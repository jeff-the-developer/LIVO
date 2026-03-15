import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Alert,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
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
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import BottomSheet from '@components/common/BottomSheet';
import AssetRow from '@components/wallet/AssetRow';
import SlideToConfirm from '@components/common/SlideToConfirm';
import { useCryptoTransfer } from '@hooks/api/useSend';
import { useWalletDashboard } from '@hooks/api/useWallet';
import { useDisplaySettings } from '@hooks/useDisplaySettings';

type Nav = NativeStackNavigationProp<AppStackParamList>;

type Step = 'form' | 'amount';

interface NetworkOption {
    key: string;
    label: string;
    subtitle: string;
    color: string;
    initial: string;
}

const NETWORKS: NetworkOption[] = [
    { key: 'ERC-20', label: 'Ethereum (ERC20)', subtitle: 'Minimum Deposit 10USDT', color: '#1353F0', initial: 'E' },
    { key: 'TRC-20', label: 'Tron (TRC20)', subtitle: 'Minimum Deposit 10USDT', color: '#FF060A', initial: 'T' },
    { key: 'BEP-20', label: 'BNB Smart Chain (BEP20)', subtitle: 'Minimum Deposit 10USDT', color: '#F3BA2F', initial: 'B' },
    { key: 'PRC-20', label: 'Polygon (PRC20)', subtitle: 'Minimum Deposit 10USDT', color: '#8247E5', initial: 'P' },
    { key: 'SOL', label: 'Solana (Sol)', subtitle: 'Minimum Deposit 10USDT', color: '#242424', initial: 'S' },
];

export default function CryptoTransferScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
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

    // Sort controls for currency sheet
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [assetTypeFilter, setAssetTypeFilter] = useState<'all' | 'crypto' | 'fiat'>('all');

    const availableBalance = dashboard.data?.assets?.find(
        (a) => a.symbol === selectedSymbol,
    )?.available ?? '0';

    const handleCurrencySelect = useCallback((symbol: string, name: string) => {
        setSelectedSymbol(symbol);
        setSelectedName(name);
        setCurrencySheetVisible(false);
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
            Alert.alert('Select Currency', 'Please select a currency first.');
            return;
        }
        if (!selectedNetwork) {
            Alert.alert('Select Network', 'Please select a network.');
            return;
        }
        if (!toAddress.trim()) {
            Alert.alert('Wallet Address', 'Please enter a wallet address.');
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
                onSuccess: () => {
                    Alert.alert(
                        'Transfer Sent',
                        `${amount} ${selectedSymbol} sent to ${toAddress.slice(0, 10)}...`,
                        [{ text: 'OK', onPress: () => navigation.goBack() }],
                    );
                },
                onError: (error: any) => {
                    Alert.alert('Transfer Failed', error?.message || 'Something went wrong');
                },
            },
        );
    };

    const selectedNetworkOption = NETWORKS.find((n) => n.key === selectedNetwork);

    // ─── Amount Entry Screen ────────────────────────────────────────────────────
    if (step === 'amount') {
        const displayAmount = amount === '0' ? '0' : amount;
        return (
            <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setStep('form')} activeOpacity={0.6} style={styles.backBtn}>
                        <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Send {selectedSymbol}</Text>
                    <View style={styles.backBtn} />
                </View>

                {/* Amount Display */}
                <View style={styles.amountSection}>
                    <Text style={styles.amountDisplay} numberOfLines={1} adjustsFontSizeToFit>
                        {displayAmount}
                    </Text>
                    <View style={styles.currencyBadge}>
                        <Text style={styles.currencyBadgeText}>
                            {selectedName} ({selectedSymbol})
                        </Text>
                    </View>
                </View>

                {/* Numpad */}
                <View style={styles.numpad}>
                    {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['.', '0', 'back']].map((row, ri) => (
                        <View key={ri} style={styles.numpadRow}>
                            {row.map((key) => (
                                <TouchableOpacity
                                    key={key}
                                    style={styles.numpadKey}
                                    onPress={() => handleNumpadPress(key)}
                                    activeOpacity={0.5}
                                >
                                    <Text style={styles.numpadText}>
                                        {key === 'back' ? '<' : key}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))}
                </View>

                {/* Footer */}
                <View style={styles.amountFooter}>
                    <View style={styles.balanceInfoCard}>
                        <View style={styles.balanceRow}>
                            <Text style={styles.balanceLabel}>
                                {availableBalance} {selectedSymbol}
                            </Text>
                            <Text style={styles.dailyLimit}>Network: {selectedNetworkOption?.label ?? selectedNetwork}</Text>
                        </View>
                    </View>
                    <SlideToConfirm
                        onConfirm={handleSlideConfirm}
                        label={parseFloat(amount) > 0 ? 'Slide to confirm' : 'Slide to continue'}
                    />
                </View>
            </SafeAreaView>
        );
    }

    // ─── Form Screen ────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.6} style={styles.backBtn}>
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Crypto Transfer</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                {/* Currency */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Currency</Text>
                    <TouchableOpacity
                        style={styles.fieldDropdown}
                        onPress={() => setCurrencySheetVisible(true)}
                        activeOpacity={0.6}
                    >
                        {selectedSymbol ? (
                            <Text style={styles.fieldValue}>{selectedName} ({selectedSymbol})</Text>
                        ) : (
                            <Text style={styles.fieldPlaceholder}>Select Currency</Text>
                        )}
                        <HugeiconsIcon icon={ArrowRight01FreeIcons} size={18} color="#B2B2B2" />
                    </TouchableOpacity>
                </View>

                {/* Network */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Network</Text>
                    <TouchableOpacity
                        style={styles.fieldDropdown}
                        onPress={() => setNetworkSheetVisible(true)}
                        activeOpacity={0.6}
                    >
                        {selectedNetwork ? (
                            <Text style={styles.fieldValue}>{selectedNetworkOption?.label ?? selectedNetwork}</Text>
                        ) : (
                            <Text style={styles.fieldPlaceholder}>Select Network</Text>
                        )}
                        <HugeiconsIcon icon={ArrowRight01FreeIcons} size={18} color="#B2B2B2" />
                    </TouchableOpacity>
                </View>

                {/* Wallet Address */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Wallet Address</Text>
                    <View style={styles.addressRow}>
                        <TextInput
                            style={styles.addressInput}
                            placeholder="Enter or paste wallet address"
                            placeholderTextColor="#B2B2B2"
                            value={toAddress}
                            onChangeText={setToAddress}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TouchableOpacity style={styles.addressIconBtn} activeOpacity={0.6}>
                            <HugeiconsIcon icon={Copy01FreeIcons} size={18} color="#B2B2B2" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.addressIconBtn} activeOpacity={0.6}>
                            <HugeiconsIcon icon={QrCodeFreeIcons} size={18} color="#B2B2B2" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Note (Optional) */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Note (Optional)</Text>
                    <View style={styles.fieldDropdown}>
                        <TextInput
                            style={styles.noteInput}
                            placeholder="Enter Only Visible to Myself"
                            placeholderTextColor="#B2B2B2"
                            value={note}
                            onChangeText={setNote}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Next Button */}
            <View style={styles.formFooter}>
                <TouchableOpacity
                    style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
                    onPress={handleNext}
                    activeOpacity={0.7}
                    disabled={!canProceed}
                >
                    <Text style={[styles.nextBtnText, !canProceed && styles.nextBtnTextDisabled]}>
                        Next
                    </Text>
                </TouchableOpacity>
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
                    {dashboard.data?.assets?.map((asset) => (
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
                    )) ?? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Loading assets...</Text>
                        </View>
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
                <View style={styles.networkList}>
                    {NETWORKS.map((network, index) => (
                        <React.Fragment key={network.key}>
                            <TouchableOpacity
                                style={styles.networkRow}
                                onPress={() => handleNetworkSelect(network.key)}
                                activeOpacity={0.6}
                            >
                                <View style={[styles.networkIcon, { backgroundColor: network.color }]}>
                                    <Text style={styles.networkIconText}>{network.initial}</Text>
                                </View>
                                <View style={styles.networkInfo}>
                                    <Text style={styles.networkName}>{network.label}</Text>
                                    <Text style={styles.networkSubtitle}>{network.subtitle}</Text>
                                </View>
                                <HugeiconsIcon icon={ArrowRight01FreeIcons} size={18} color="#B2B2B2" />
                            </TouchableOpacity>
                            {index < NETWORKS.length - 1 && <View style={styles.networkDivider} />}
                        </React.Fragment>
                    ))}
                </View>
            </BottomSheet>
        </SafeAreaView>
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
    fieldDropdown: {
        height: 52,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    fieldPlaceholder: {
        fontSize: 16,
        fontWeight: '400',
        color: '#B2B2B2',
        lineHeight: 24,
    },
    fieldValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 24,
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
    networkIcon: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    networkIconText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FFFFFF',
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
