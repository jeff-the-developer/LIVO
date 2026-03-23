import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Pressable,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    ArrowRight01FreeIcons,
    ArrowDown01FreeIcons,
    Copy01FreeIcons,
    QrCodeFreeIcons,
    FilterHorizontalFreeIcons,
} from '@hugeicons/core-free-icons';
import type { AppStackParamList } from '@app-types/navigation.types';
import type { ApiResponse } from '@app-types/api.types';
import type { TransferResponse } from '@app-types/send.types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import Button from '@components/common/Button';
import BottomSheet from '@components/common/BottomSheet';
import AssetRow from '@components/wallet/AssetRow';
import { CryptoIcon, CurrencyIcon } from '@components/icons/CurrencyIcons';
import Divider from '@components/common/Divider';
import EmptyState from '@components/common/EmptyState';
import Input from '@components/common/Input';
import ScreenHeader from '@components/common/ScreenHeader';
import SlideToConfirm from '@components/common/SlideToConfirm';
import SelectField from '@components/forms/SelectField';
import { useCryptoTransfer } from '@hooks/api/useSend';
import { useWalletDashboard } from '@hooks/api/useWallet';
import { useDisplaySettings } from '@hooks/useDisplaySettings';
import TransferAmountStep from '@components/send/TransferAmountStep';
import { ui } from '@theme/ui';
import { handleApiError } from '@utils/errorHandler';
import MoneyReceiptSheet, { type MoneyReceiptRow } from '@components/common/MoneyReceiptSheet';
import { formatReceiptDateTime } from '@utils/formatReceipt';
import { hapticSuccess, hapticWarning } from '@utils/haptics';
import ApiErrorSheet from '@components/common/ApiErrorSheet';

function formatWalletAddress(addr: string): string {
    const a = addr.trim();
    if (a.length <= 20) return a;
    return `${a.slice(0, 12)}…${a.slice(-8)}`;
}

type Nav = NativeStackNavigationProp<AppStackParamList>;

type Step = 'form' | 'amount';

// Fiat symbols that should NOT appear in crypto transfer
const FIAT_SYMBOLS = new Set(['USD', 'HKD', 'CNY', 'AUD', 'CAD', 'CHF', 'EUR', 'GBP', 'JPY', 'SGD']);

interface NetworkOption {
    key: string;
    label: string;
    subtitle: string;
    iconSymbol: string;
    /** Which crypto symbols this network supports. Empty = all crypto. */
    symbols?: string[];
}

const NETWORKS: NetworkOption[] = [
    { key: 'ERC-20', label: 'Ethereum (ERC20)', subtitle: 'Supports ETH, USDT, ERC-20 tokens', iconSymbol: 'ETH', symbols: ['ETH', 'USDT'] },
    { key: 'TRC-20', label: 'Tron (TRC20)', subtitle: 'Supports USDT (TRC-20)', iconSymbol: 'TRX', symbols: ['USDT'] },
    { key: 'BEP-20', label: 'BNB Smart Chain (BEP20)', subtitle: 'Supports BNB, USDT, BEP-20 tokens', iconSymbol: 'BNB', symbols: ['USDT', 'BNB'] },
    { key: 'BTC', label: 'Bitcoin Network', subtitle: 'Supports BTC only', iconSymbol: 'BTC', symbols: ['BTC'] },
    { key: 'SOL', label: 'Solana (SOL)', subtitle: 'Supports SOL, SPL tokens', iconSymbol: 'SOL', symbols: ['SOL', 'USDT'] },
];

/** Best-effort network hint from pasted/scanned address (user must still confirm). */
function inferNetworkFromAddress(address: string): string {
    const a = address.trim();
    if (/^0x[0-9a-fA-F]{40}$/.test(a)) return 'ERC-20';
    if (/^bc1[a-zA-HJ-NP-Z0-9]{25,}$/i.test(a) || /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(a)) return 'BTC';
    if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(a)) return 'TRC-20';
    return '';
}

export default function CryptoTransferScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const route = useRoute<RouteProp<AppStackParamList, 'CryptoTransfer'>>();
    const { currency } = useDisplaySettings();
    const dashboard = useWalletDashboard(currency);
    const cryptoTransfer = useCryptoTransfer();

    // Form state
    const [step, setStep] = useState<Step>('form');
    const [selectedSymbol, setSelectedSymbol] = useState('');
    const [selectedName, setSelectedName] = useState('');
    const [toAddress, setToAddress] = useState('');
    const [selectedNetwork, setSelectedNetwork] = useState('');
    const [note, setNote] = useState('');

    // Amount state
    const [amount, setAmount] = useState('0');

    // Sheet visibility
    const [currencySheetVisible, setCurrencySheetVisible] = useState(false);
    const [networkSheetVisible, setNetworkSheetVisible] = useState(false);
    const [receiptOpen, setReceiptOpen] = useState(false);
    const [receipt, setReceipt] = useState<{
        headline: string;
        summary?: string;
        rows: MoneyReceiptRow[];
    } | null>(null);
    const [noticeSheet, setNoticeSheet] = useState<{
        title: string;
        message: string;
        tone: 'error' | 'warning' | 'info';
    } | null>(null);

    // Sort controls for currency sheet
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [assetTypeFilter, setAssetTypeFilter] = useState<'all' | 'crypto' | 'fiat'>('all');

    const cryptoAssets = dashboard.data?.assets?.filter(
        (a) => !FIAT_SYMBOLS.has(a.symbol),
    ) ?? [];

    const prefilledAddress = route.params?.prefilledAddress;
    useEffect(() => {
        const addr = prefilledAddress?.trim();
        if (!addr) return;
        setToAddress(addr);
        const guessed = inferNetworkFromAddress(addr);
        if (guessed) setSelectedNetwork(guessed);
    }, [prefilledAddress]);

    const selectedAsset = useMemo(
        () => cryptoAssets.find((a) => a.symbol === selectedSymbol),
        [cryptoAssets, selectedSymbol],
    );

    const availableBalance = selectedAsset?.available ?? '0';

    // Filter networks that support the selected symbol
    const availableNetworks = selectedSymbol
        ? NETWORKS.filter((n) => !n.symbols || n.symbols.includes(selectedSymbol))
        : NETWORKS;

    const handleCurrencySelect = useCallback((symbol: string, name: string) => {
        setSelectedSymbol(symbol);
        setSelectedName(name);
        setCurrencySheetVisible(false);
        // Reset network if it doesn't support the newly selected symbol
        setSelectedNetwork((prev) => {
            const net = NETWORKS.find((n) => n.key === prev);
            if (net?.symbols && !net.symbols.includes(symbol)) return '';
            return prev;
        });
    }, []);

    const handleNetworkSelect = useCallback((network: string) => {
        setSelectedNetwork(network);
        setNetworkSheetVisible(false);
    }, []);

    const cycleAssetType = useCallback(() => {
        setAssetTypeFilter((prev) => {
            if (prev === 'all') return 'crypto';
            if (prev === 'crypto') return 'fiat';
            return 'all';
        });
    }, []);

    const handleNext = () => {
        if (!selectedSymbol) {
            setNoticeSheet({
                title: 'Select currency',
                message: 'Choose which asset you are sending before continuing.',
                tone: 'warning',
            });
            return;
        }
        if (!selectedNetwork) {
            setNoticeSheet({
                title: 'Select network',
                message: 'Pick the blockchain network that matches this address.',
                tone: 'warning',
            });
            return;
        }
        if (!toAddress.trim()) {
            setNoticeSheet({
                title: 'Wallet address required',
                message: 'Enter the recipient wallet address to continue.',
                tone: 'warning',
            });
            return;
        }
        setStep('amount');
    };

    const canProceed = !!selectedSymbol && !!toAddress.trim() && !!selectedNetwork;

    const handleNumpadPress = (key: string) => {
        if (key === 'back') {
            setAmount((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
        } else if (key === '.') {
            if (!amount.includes('.')) {
                setAmount((prev) => prev + '.');
            }
        } else {
            setAmount((prev) => (prev === '0' ? key : prev + key));
        }
    };

    const handleSlideConfirm = () => {
        if (!selectedSymbol || !selectedNetwork || parseFloat(amount) <= 0) return;

        cryptoTransfer.mutate(
            {
                symbol: selectedSymbol,
                amount,
                to_address: toAddress,
                network: selectedNetwork,
            },
            {
                onSuccess: (res: ApiResponse<TransferResponse>) => {
                    hapticSuccess();
                    const d = res.data;
                    const ts = formatReceiptDateTime();
                    const rows: MoneyReceiptRow[] = [
                        { label: 'To address', value: toAddress.trim(), mono: true, valueNumberOfLines: 8 },
                        { label: 'Network', value: selectedNetworkOption?.label ?? selectedNetwork },
                        { label: 'Amount', value: `${d.amount ?? '—'} ${d.currency ?? ''}`.trim() },
                        { label: 'Fee', value: `${d.fee ?? '—'} ${d.currency ?? ''}`.trim() },
                        { label: 'Status', value: d.status ?? '—' },
                        { label: 'Date', value: ts },
                    ];
                    if (d.reference?.trim()) {
                        rows.push({ label: 'Reference', value: d.reference, mono: true });
                    }
                    if (d.tx_id?.trim()) {
                        rows.push({ label: 'Transaction ID', value: d.tx_id, mono: true });
                    }
                    setReceipt({
                        headline: 'Transfer submitted',
                        summary: `${d.amount} ${d.currency} on ${selectedNetworkOption?.label ?? selectedNetwork}`,
                        rows,
                    });
                    setReceiptOpen(true);
                },
                onError: (error: unknown) => {
                    hapticWarning();
                    const e = handleApiError(error);
                    const message = e.retryable
                        ? `${e.message}\n\nCheck the address, network, and balance, then try again.`
                        : e.message;
                    setNoticeSheet({ title: e.title, message, tone: 'error' });
                },
            },
        );
    };

    const selectedNetworkOption = NETWORKS.find((n) => n.key === selectedNetwork);

    // ─── Amount Entry Screen ────────────────────────────────────────────────────
    if (step === 'amount') {
        const displayAmount = amount === '0' ? '0' : amount;
        return (
            <>
                <TransferAmountStep
                    title={`Send ${selectedSymbol}`}
                    onBackPress={() => setStep('form')}
                    displayAmount={displayAmount}
                    badgeLabel={`${selectedName} (${selectedSymbol})`}
                    infoPrimary={`${availableBalance} ${selectedSymbol}`}
                    infoSecondary={`Network: ${selectedNetworkOption?.label ?? selectedNetwork}`}
                    onKeyPress={handleNumpadPress}
                    onConfirm={handleSlideConfirm}
                    sliderLabel={parseFloat(amount) > 0 ? 'Slide to confirm' : 'Slide to continue'}
                    confirmationRows={[
                        { label: 'Asset', value: `${selectedName} (${selectedSymbol})` },
                        { label: 'Network', value: selectedNetworkOption?.label ?? selectedNetwork },
                        { label: 'To address', value: formatWalletAddress(toAddress) },
                        { label: 'You send', value: `${amount} ${selectedSymbol}` },
                        ...(note.trim() ? [{ label: 'Note', value: note.trim() }] : []),
                    ]}
                    feeBreakdown={{
                        rows: [
                            { label: 'Network fee', value: 'Shown on receipt after broadcast' },
                            { label: 'You authorize', value: `${amount} ${selectedSymbol}` },
                        ],
                        footnote:
                            'Blockchain fees vary by network load. The receipt shows the fee returned by the processor.',
                    }}
                />
                {receipt ? (
                    <MoneyReceiptSheet
                        visible={receiptOpen}
                        onClose={() => setReceiptOpen(false)}
                        headline={receipt.headline}
                        summary={receipt.summary}
                        rows={receipt.rows}
                        onDone={() => {
                            setReceiptOpen(false);
                            setReceipt(null);
                            navigation.goBack();
                        }}
                    />
                ) : null}
                <ApiErrorSheet
                    visible={noticeSheet !== null}
                    onClose={() => setNoticeSheet(null)}
                    title={noticeSheet?.title ?? ''}
                    message={noticeSheet?.message ?? ''}
                    tone={noticeSheet?.tone === 'warning' ? 'warning' : noticeSheet?.tone === 'info' ? 'info' : 'error'}
                />
            </>
        );
    }

    // ─── Form Screen ────────────────────────────────────────────────────────────
    return (
        <>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <ScreenHeader title="Crypto Transfer" onBackPress={() => navigation.goBack()} />

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                {/* Currency */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Currency</Text>
                    <SelectField
                        onPress={() => setCurrencySheetVisible(true)}
                        value={selectedSymbol ? `${selectedName} (${selectedSymbol})` : undefined}
                        placeholder="Select Currency"
                        leftAdornment={
                            selectedSymbol ? (
                                <CurrencyIcon
                                    symbol={selectedSymbol}
                                    size={ui.selectorIconSm}
                                    iconUrl={selectedAsset?.icon_url}
                                />
                            ) : undefined
                        }
                    />
                </View>

                {/* Network */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Network</Text>
                    <SelectField
                        onPress={() => setNetworkSheetVisible(true)}
                        value={selectedNetwork ? (selectedNetworkOption?.label ?? selectedNetwork) : undefined}
                        placeholder="Select Network"
                        leftAdornment={
                            selectedNetworkOption ? (
                                <CryptoIcon
                                    symbol={selectedNetworkOption.iconSymbol}
                                    size={ui.selectorIconSm}
                                />
                            ) : undefined
                        }
                    />
                </View>

                {/* Wallet Address */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Wallet Address</Text>
                    <Input
                        value={toAddress}
                        onChangeText={setToAddress}
                        placeholder="Enter or paste wallet address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        rightAdornment={
                            <View style={styles.addressActions}>
                                <TouchableOpacity style={styles.addressIconBtn} activeOpacity={0.6}>
                                    <HugeiconsIcon icon={Copy01FreeIcons} size={18} color="#B2B2B2" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.addressIconBtn} activeOpacity={0.6}>
                                    <HugeiconsIcon icon={QrCodeFreeIcons} size={18} color="#B2B2B2" />
                                </TouchableOpacity>
                            </View>
                        }
                    />
                </View>

                {/* Note (Optional) */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Note (Optional)</Text>
                    <Input
                        value={note}
                        onChangeText={setNote}
                        placeholder="Enter Only Visible to Myself"
                    />
                </View>
            </ScrollView>

            {/* Next Button */}
            <View style={styles.formFooter}>
                <Button label="Next" onPress={handleNext} disabled={!canProceed} />
            </View>

            {/* ─── Currency Picker Sheet ──────────────────────────────────── */}
            <BottomSheet
                visible={currencySheetVisible}
                onClose={() => setCurrencySheetVisible(false)}
                maxHeight="85%"
                showBackButton
            >
                <Text style={styles.currencySheetTitle}>Currency</Text>

                {/* Sort Controls */}
                <View style={styles.sortRow}>
                    <TouchableOpacity
                        style={styles.sortBtn}
                        activeOpacity={0.6}
                        onPress={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
                    >
                        <HugeiconsIcon icon={FilterHorizontalFreeIcons} size={18} color="rgba(0, 0, 0, 0.20)" />
                        <Text style={styles.sortText}>{sortOrder === 'desc' ? 'Descend' : 'Ascend'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sortBtn} activeOpacity={0.6} onPress={cycleAssetType}>
                        <Text style={styles.sortText}>{assetTypeFilter.charAt(0).toUpperCase() + assetTypeFilter.slice(1)}</Text>
                        <HugeiconsIcon icon={ArrowDown01FreeIcons} size={14} color="rgba(0, 0, 0, 0.20)" />
                    </TouchableOpacity>
                </View>

                <View style={styles.assetList}>
                    {cryptoAssets.length > 0 ? cryptoAssets.map((asset) => (
                        <AssetRow
                            key={asset.symbol}
                            symbol={asset.symbol}
                            name={asset.name}
                            price={asset.price}
                            change24h={asset.change_24h}
                            balance={asset.balance}
                            usdValue={`${asset.balance} USD`}
                            iconUrl={asset.icon_url}
                            isHidden={false}
                            onPress={() => handleCurrencySelect(asset.symbol, asset.name)}
                        />
                    )) : (
                        <EmptyState
                            title="No crypto assets available"
                            description="Available crypto balances will appear here once they load."
                            style={styles.emptyState}
                        />
                    )}
                </View>
            </BottomSheet>

            {/* ─── Network Picker Sheet ────────────────────────────────── */}
            <BottomSheet
                visible={networkSheetVisible}
                onClose={() => setNetworkSheetVisible(false)}
                maxHeight="70%"
                title="Network"
                showBackButton
            >
                {availableNetworks.length ? (
                    <View style={styles.networkList}>
                        {availableNetworks.map((network, index) => (
                            <React.Fragment key={network.key}>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.networkRow,
                                        pressed && styles.networkRowPressed,
                                    ]}
                                    onPress={() => handleNetworkSelect(network.key)}
                                >
                                    <CryptoIcon symbol={network.iconSymbol} size={ui.pickerRowIcon} />
                                    <View style={styles.networkInfo}>
                                        <Text style={styles.networkName}>{network.label}</Text>
                                        <Text style={styles.networkSubtitle}>{network.subtitle}</Text>
                                    </View>
                                    <HugeiconsIcon
                                        icon={ArrowRight01FreeIcons}
                                        size={ui.iconSize.md}
                                        color={colors.textMuted}
                                    />
                                </Pressable>
                                {index < availableNetworks.length - 1 && <Divider style={styles.networkDivider} />}
                            </React.Fragment>
                        ))}
                    </View>
                ) : (
                    <EmptyState
                        title="No supported networks"
                        description="This asset does not have a supported transfer network right now."
                        style={styles.emptyState}
                    />
                )}
            </BottomSheet>
        </SafeAreaView>
            {receipt ? (
                <MoneyReceiptSheet
                    visible={receiptOpen}
                    onClose={() => setReceiptOpen(false)}
                    headline={receipt.headline}
                    summary={receipt.summary}
                    rows={receipt.rows}
                    onDone={() => {
                        setReceiptOpen(false);
                        setReceipt(null);
                        navigation.goBack();
                    }}
                />
            ) : null}
            <ApiErrorSheet
                visible={noticeSheet !== null}
                onClose={() => setNoticeSheet(null)}
                title={noticeSheet?.title ?? ''}
                message={noticeSheet?.message ?? ''}
                tone={noticeSheet?.tone === 'warning' ? 'warning' : noticeSheet?.tone === 'info' ? 'info' : 'error'}
            />
        </>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    backBtn: {
        width: 36,
        height: 33,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 24,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 23,
        paddingTop: 10,
    },
    fieldGroup: {
        marginBottom: 27,
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 24,
        marginBottom: 10,
    },
    addressActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    addressRow: {
        height: 44,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: '#DBDBDB',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    addressInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '400',
        color: '#242424',
        lineHeight: 24,
        paddingVertical: 0,
    },
    addressIconBtn: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noteInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '400',
        color: '#242424',
        lineHeight: 24,
        paddingVertical: 0,
    },
    formFooter: {
        paddingHorizontal: 15,
        paddingBottom: spacing.base,
    },
    nextBtn: {
        height: 52,
        backgroundColor: '#242424',
        borderRadius: 521,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextBtnDisabled: {
        backgroundColor: '#F0F0F0',
    },
    nextBtnText: {
        fontSize: 16,
        fontWeight: '500',
        color: 'white',
        lineHeight: 24,
    },
    nextBtnTextDisabled: {
        color: '#B2B2B2',
    },
    // Currency sheet
    currencySheetTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#242424',
        lineHeight: 38.4,
        marginBottom: 10,
    },
    sortRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 11,
    },
    sortBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    sortText: {
        fontSize: 12,
        fontWeight: '500',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 18,
    },
    assetList: {
        gap: 10,
    },
    // Network sheet
    networkList: {
        gap: 0,
    },
    networkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 26,
        paddingVertical: 18,
        borderRadius: 21,
        gap: 15,
    },
    networkRowPressed: {
        backgroundColor: colors.surface,
        opacity: 0.96,
    },
    networkInfo: {
        flex: 1,
    },
    networkName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 24,
    },
    networkSubtitle: {
        fontSize: 12,
        fontWeight: '400',
        color: '#B2B2B2',
        lineHeight: 18,
    },
    networkDivider: {
        height: 1.5,
        backgroundColor: '#F0F0F0',
    },
    emptyState: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#B2B2B2',
    },
    // Amount screen
    amountSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    amountDisplay: {
        fontSize: 80,
        fontWeight: '700',
        color: '#242424',
        textAlign: 'center',
        lineHeight: 96,
    },
    currencyBadge: {
        marginTop: 16,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 121,
        backgroundColor: '#F0F0F0',
    },
    currencyBadgeText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 27,
    },
    numpad: {
        paddingHorizontal: 64,
        gap: 42,
    },
    numpadRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    numpadKey: {
        width: 50,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    numpadText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 36,
    },
    amountFooter: {
        paddingHorizontal: 15,
        paddingBottom: spacing.base,
        gap: 12,
    },
    balanceInfoCard: {
        backgroundColor: 'rgba(240, 240, 240, 0.60)',
        borderRadius: 13,
        padding: 10,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: 18,
        fontWeight: '500',
        color: '#434343',
        lineHeight: 21.6,
    },
    dailyLimit: {
        fontSize: 16,
        fontWeight: '500',
        color: '#434343',
        lineHeight: 19.2,
    },
});
