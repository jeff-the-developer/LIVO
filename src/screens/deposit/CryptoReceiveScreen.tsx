import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Share,
    Linking,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    ArrowRight01FreeIcons,
    ArrowDown01FreeIcons,
    Alert02FreeIcons,
    Tick02FreeIcons,
    FilterHorizontalFreeIcons,
    Bookmark01FreeIcons,
    Link01FreeIcons,
    Mail01FreeIcons,
    Share04FreeIcons,
} from '@hugeicons/core-free-icons';
import type { AppStackParamList } from '@app-types/navigation.types';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import BottomSheet from '@components/common/BottomSheet';
import AssetRow from '@components/wallet/AssetRow';
import { useWalletDashboard } from '@hooks/api/useWallet';
import { useDisplaySettings } from '@hooks/useDisplaySettings';

type Nav = NativeStackNavigationProp<AppStackParamList>;

type Step = 'currency' | 'network' | 'detail';
type DetailTab = 'address' | 'transaction';

// ─── Static Data ─────────────────────────────────────────────────────────────

interface NetworkOption {
    id: string;
    name: string;
    color: string;
    letter: string;
    minDeposit: string;
}

const NETWORKS: NetworkOption[] = [
    { id: 'erc20', name: 'Ethereum (ERC20)', color: '#1353F0', letter: 'E', minDeposit: '10USDT' },
    { id: 'trc20', name: 'Tron (TRC20)', color: '#FF060A', letter: 'T', minDeposit: '10USDT' },
    { id: 'bep20', name: 'BNB Smart Chain (BEP20)', color: '#F3BA2F', letter: 'B', minDeposit: '10USDT' },
    { id: 'prc20', name: 'Polygon (PRC20)', color: '#8247E5', letter: 'P', minDeposit: '10USDT' },
    { id: 'sol', name: 'Solana (Sol)', color: '#242424', letter: 'S', minDeposit: '10USDT' },
];

const DEPOSIT_NOTES = [
    'SOL network addresses are case-sensitive',
    'Do not deposit NFTs to this address',
    'Do not use smart contracts to deposit to this address',
    'Only send token from SOL Network or you may lose asset permanently',
    'Use screening tool to check sending wallet. High risk deposit will not be credited and incur 30 USD refund fee',
];

const MOCK_WALLET_ADDRESS = '0x387e8882cafb5f2f36b3a17c23e42b2b3564ef1a';

// ─── Component ───────────────────────────────────────────────────────────────

export default function CryptoReceiveScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const { currency } = useDisplaySettings();
    const dashboard = useWalletDashboard(currency);

    // Step state
    const [step, setStep] = useState<Step>('currency');
    const [detailTab, setDetailTab] = useState<DetailTab>('address');
    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [selectedCurrencyName, setSelectedCurrencyName] = useState('');
    const [selectedNetwork, setSelectedNetwork] = useState('');

    // Bottom sheet state
    const [notesVisible, setNotesVisible] = useState(false);
    const [checkedNotes, setCheckedNotes] = useState<boolean[]>([false, false, false, false, false]);
    const [shareVisible, setShareVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    // Sort controls (no-op for now)
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    const allNotesChecked = checkedNotes.every(Boolean);

    const selectedNetworkOption = NETWORKS.find((n) => n.id === selectedNetwork);

    // ─── Handlers ────────────────────────────────────────────────────────────────

    const handleBack = useCallback(() => {
        if (step === 'detail') {
            setStep('network');
        } else if (step === 'network') {
            setStep('currency');
        } else {
            navigation.goBack();
        }
    }, [step, navigation]);

    const handleCurrencySelect = useCallback((symbol: string, name: string) => {
        setSelectedCurrency(symbol);
        setSelectedCurrencyName(name);
        setStep('network');
    }, []);

    const handleNetworkSelect = useCallback((networkId: string) => {
        setSelectedNetwork(networkId);
        setCheckedNotes([false, false, false, false, false]);
        setNotesVisible(true);
    }, []);

    const toggleNote = useCallback((index: number) => {
        setCheckedNotes((prev) => {
            const next = [...prev];
            next[index] = !next[index];
            return next;
        });
    }, []);

    const handleUnderstand = useCallback(() => {
        setNotesVisible(false);
        setDetailTab('address');
        setCopied(false);
        setStep('detail');
    }, []);

    const handleCopyAddress = useCallback(async () => {
        await Clipboard.setStringAsync(MOCK_WALLET_ADDRESS);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, []);

    const handleSharePress = useCallback(async () => {
        try {
            await Share.share({
                message: `My ${selectedCurrencyName} deposit address (${selectedNetworkOption?.name ?? ''}): ${MOCK_WALLET_ADDRESS}`,
                title: 'LIVOPay - Deposit Address',
            });
        } catch {
            // User cancelled
        }
    }, [selectedCurrencyName, selectedNetworkOption]);

    const handleMailPress = useCallback(() => {
        Linking.openURL(
            `mailto:?subject=My LIVOPay Deposit Address&body=${encodeURIComponent(
                `My ${selectedCurrencyName} deposit address (${selectedNetworkOption?.name ?? ''}):\n${MOCK_WALLET_ADDRESS}`
            )}`
        );
    }, [selectedCurrencyName, selectedNetworkOption]);

    const handleCopyLink = useCallback(async () => {
        await Clipboard.setStringAsync(MOCK_WALLET_ADDRESS);
    }, []);

    // ─── Step 3: Network Detail ──────────────────────────────────────────────────

    if (step === 'detail') {
        return (
            <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} activeOpacity={0.6} style={styles.backBtn}>
                        <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Network</Text>
                    <View style={styles.backBtn} />
                </View>

                {/* Tab Selector */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, detailTab === 'address' && styles.tabActive]}
                        onPress={() => setDetailTab('address')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, detailTab === 'address' && styles.tabTextActive]}>
                            Wallet Address
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, detailTab === 'transaction' && styles.tabActive]}
                        onPress={() => setDetailTab('transaction')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, detailTab === 'transaction' && styles.tabTextActive]}>
                            Transaction
                        </Text>
                    </TouchableOpacity>
                </View>

                {detailTab === 'address' ? (
                    <ScrollView
                        style={styles.scroll}
                        contentContainerStyle={styles.detailScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* QR Code */}
                        <View style={styles.qrSection}>
                            <View style={styles.qrContainer}>
                                <View style={styles.qrGrid}>
                                    {Array.from({ length: 144 }).map((_, i) => (
                                        <View
                                            key={i}
                                            style={[
                                                styles.qrDot,
                                                (i + Math.floor(i / 12)) % 3 === 0 && styles.qrDotFilled,
                                            ]}
                                        />
                                    ))}
                                </View>
                                <View style={styles.qrLogoWrap}>
                                    <View style={styles.qrLogo}>
                                        <Text style={styles.qrLogoText}>L</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Address Card */}
                        <View style={styles.addressCard}>
                            <Text style={styles.networkSupportText}>
                                Only Support {selectedNetworkOption?.name?.split(' ')[1]?.replace('(', '').replace(')', '') ?? selectedNetworkOption?.id?.toUpperCase()}
                            </Text>
                            <Text style={styles.walletAddressText} selectable>
                                {MOCK_WALLET_ADDRESS}
                            </Text>
                        </View>

                        {/* Info Row Cards */}
                        <View style={styles.infoSection}>
                            <View style={styles.infoCard}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Contract</Text>
                                    <Text style={styles.infoValue}>*31ec7</Text>
                                </View>
                            </View>
                            <View style={styles.infoCard}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Confirmation</Text>
                                    <Text style={styles.infoValue}>32</Text>
                                </View>
                            </View>
                            <View style={styles.infoCard}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Min Deposit</Text>
                                    <Text style={styles.infoValue}>{selectedNetworkOption?.minDeposit ?? '10 USDT'}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Important Notes Card */}
                        <View style={styles.detailNotesSection}>
                            <Text style={styles.detailNotesTitle}>Important Note:</Text>
                            <Text style={styles.detailNoteText}>
                                Do not deposit NFTs to this address{'\n'}
                                Do not use smart contracts to deposit to this address{'\n'}
                                Only send tOkayens from {selectedNetworkOption?.name?.split(' ')[0] ?? 'ETH'} Network or you will lose your asset permanently
                            </Text>
                        </View>
                    </ScrollView>
                ) : (
                    /* Transaction Tab - Empty State */
                    <View style={styles.emptyTransactionContainer}>
                        <View style={styles.emptyLogoBox}>
                            <Text style={styles.emptyLogoText}>L</Text>
                        </View>
                        <Text style={styles.emptyRecordsText}>No Records</Text>
                    </View>
                )}

                {/* Footer Buttons (only on address tab) */}
                {detailTab === 'address' && (
                    <View style={styles.detailFooter}>
                        <TouchableOpacity
                            style={[styles.copyBtn, copied && styles.copyBtnCopied]}
                            onPress={handleCopyAddress}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.copyBtnText}>
                                {copied ? 'Copied' : 'Copy'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.shareTextBtn}
                            onPress={() => setShareVisible(true)}
                            activeOpacity={0.6}
                        >
                            <Text style={styles.shareTextBtnLabel}>Share QR code</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* ─── Share Bottom Sheet ─────────────────────────────────── */}
                <BottomSheet
                    visible={shareVisible}
                    onClose={() => setShareVisible(false)}
                    footer={
                        <TouchableOpacity
                            style={styles.okayBtn}
                            onPress={() => setShareVisible(false)}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.okayBtnText}>Okay</Text>
                        </TouchableOpacity>
                    }
                >
                    {/* QR Preview */}
                    <View style={styles.shareQrWrap}>
                        <View style={styles.shareQrContainer}>
                            <View style={styles.shareQrGrid}>
                                {Array.from({ length: 64 }).map((_, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.shareQrDot,
                                            (i + Math.floor(i / 8)) % 3 === 0 && styles.shareQrDotFilled,
                                        ]}
                                    />
                                ))}
                            </View>
                            <View style={styles.shareQrLogoWrap}>
                                <View style={styles.shareQrLogo}>
                                    <Text style={styles.shareQrLogoText}>L</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.shareAddressText} numberOfLines={1}>
                        {MOCK_WALLET_ADDRESS}
                    </Text>

                    {/* Action Buttons */}
                    <View style={styles.shareActions}>
                        <TouchableOpacity style={styles.shareActionItem} activeOpacity={0.7}>
                            <View style={styles.shareActionIconWrap}>
                                <HugeiconsIcon icon={Bookmark01FreeIcons} size={20} color={colors.textPrimary} />
                            </View>
                            <Text style={styles.shareActionLabel}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareActionItem} onPress={handleCopyLink} activeOpacity={0.7}>
                            <View style={styles.shareActionIconWrap}>
                                <HugeiconsIcon icon={Link01FreeIcons} size={20} color={colors.textPrimary} />
                            </View>
                            <Text style={styles.shareActionLabel}>Link</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareActionItem} onPress={handleMailPress} activeOpacity={0.7}>
                            <View style={styles.shareActionIconWrap}>
                                <HugeiconsIcon icon={Mail01FreeIcons} size={20} color={colors.textPrimary} />
                            </View>
                            <Text style={styles.shareActionLabel}>Mail</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareActionItem} onPress={handleSharePress} activeOpacity={0.7}>
                            <View style={styles.shareActionIconWrap}>
                                <HugeiconsIcon icon={Share04FreeIcons} size={20} color={colors.textPrimary} />
                            </View>
                            <Text style={styles.shareActionLabel}>Share</Text>
                        </TouchableOpacity>
                    </View>
                </BottomSheet>
            </SafeAreaView>
        );
    }

    // ─── Step 2: Network Selection ───────────────────────────────────────────────

    if (step === 'network') {
        return (
            <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} activeOpacity={0.6} style={styles.backBtn}>
                        <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Network</Text>
                    <View style={styles.backBtn} />
                </View>

                {/* Network List */}
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.networkScrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {NETWORKS.map((network, index) => (
                        <React.Fragment key={network.id}>
                            <TouchableOpacity
                                style={styles.networkRow}
                                onPress={() => handleNetworkSelect(network.id)}
                                activeOpacity={0.6}
                            >
                                <View style={[styles.networkIcon, { backgroundColor: network.color }]}>
                                    <Text style={styles.networkIconText}>{network.letter}</Text>
                                </View>
                                <View style={styles.networkInfo}>
                                    <Text style={styles.networkName}>{network.name}</Text>
                                    <Text style={styles.networkSubtitle}>
                                        Minimum Deposit {network.minDeposit}
                                    </Text>
                                </View>
                                <HugeiconsIcon icon={ArrowRight01FreeIcons} size={18} color="#B2B2B2" />
                            </TouchableOpacity>
                            {index < NETWORKS.length - 1 && <View style={styles.networkDivider} />}
                        </React.Fragment>
                    ))}
                </ScrollView>

                {/* ─── Important Notes Bottom Sheet ────────────────────────── */}
                <BottomSheet
                    visible={notesVisible}
                    onClose={() => setNotesVisible(false)}
                    maxHeight="65%"
                    footer={
                        <TouchableOpacity
                            style={[styles.understandBtn, !allNotesChecked && styles.understandBtnDisabled]}
                            activeOpacity={0.7}
                            onPress={handleUnderstand}
                            disabled={!allNotesChecked}
                        >
                            <Text style={styles.understandBtnText}>I Understand</Text>
                        </TouchableOpacity>
                    }
                >
                    <View style={styles.notesSheetContent}>
                        <View style={styles.warningCircle}>
                            <HugeiconsIcon icon={Alert02FreeIcons} size={24} color="#242424" />
                        </View>
                        <Text style={styles.notesSheetTitle}>Important Notes</Text>
                        <View style={styles.notesList}>
                            {DEPOSIT_NOTES.map((note, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.noteRow}
                                    activeOpacity={0.7}
                                    onPress={() => toggleNote(index)}
                                >
                                    <Text style={styles.noteText}>{note}</Text>
                                    <View
                                        style={[
                                            styles.checkbox,
                                            checkedNotes[index] && styles.checkboxChecked,
                                        ]}
                                    >
                                        {checkedNotes[index] && (
                                            <HugeiconsIcon icon={Tick02FreeIcons} size={16} color="#FFFFFF" />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </BottomSheet>
            </SafeAreaView>
        );
    }

    // ─── Step 1: Currency Selection ──────────────────────────────────────────────

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} activeOpacity={0.6} style={styles.backBtn}>
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Deposit</Text>
                <View style={styles.backBtn} />
            </View>

            {/* Sort Controls */}
            <View style={styles.sortRow}>
                <TouchableOpacity
                    style={styles.sortBtn}
                    activeOpacity={0.6}
                    onPress={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
                >
                    <HugeiconsIcon icon={FilterHorizontalFreeIcons} size={18} color="#242424" />
                    <Text style={styles.sortText}>{sortOrder === 'desc' ? 'Descend' : 'Ascend'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sortBtn} activeOpacity={0.6}>
                    <Text style={styles.sortText}>All</Text>
                    <HugeiconsIcon icon={ArrowDown01FreeIcons} size={14} color="#242424" />
                </TouchableOpacity>
            </View>

            {/* Currency List */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.currencyScrollContent}
                showsVerticalScrollIndicator={false}
            >
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
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // Header
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

    // Shared scroll
    scroll: {
        flex: 1,
    },

    // ─── Step 1: Currency Selection ──────────────────────────────────────────────

    sortRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    sortBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    sortText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#242424',
    },
    currencyScrollContent: {
        paddingHorizontal: 15,
        paddingBottom: spacing.huge,
        gap: 10,
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

    // ─── Step 2: Network Selection ───────────────────────────────────────────────

    networkScrollContent: {
        paddingBottom: spacing.huge,
    },
    networkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        height: 72,
        gap: 15,
    },
    networkIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    networkIconText: {
        fontSize: 22,
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
        height: 1,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 15,
    },

    // ─── Important Notes Bottom Sheet ────────────────────────────────────────────

    notesSheetContent: {
        alignItems: 'center',
    },
    warningCircle: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#FFF07F',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    notesSheetTitle: {
        fontSize: 30,
        fontWeight: '700',
        color: '#242424',
        marginBottom: 16,
    },
    notesList: {
        width: '100%',
        gap: 10,
    },
    noteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 13,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    noteText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '400',
        color: '#242424',
        lineHeight: 21,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    checkboxChecked: {
        backgroundColor: '#242424',
        borderColor: '#242424',
    },
    understandBtn: {
        height: 52,
        backgroundColor: '#242424',
        borderRadius: 521,
        alignItems: 'center',
        justifyContent: 'center',
    },
    understandBtnDisabled: {
        opacity: 0.4,
    },
    understandBtnText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        lineHeight: 24,
    },

    // ─── Step 3: Network Detail ──────────────────────────────────────────────────

    // Tab Selector
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 24,
        backgroundColor: '#E8E8E8',
        borderRadius: 110,
        padding: 10,
        marginBottom: 16,
        gap: 2,
    },
    tab: {
        flex: 1,
        height: 33,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabActive: {
        backgroundColor: '#FFFFFF',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 24,
    },
    tabTextActive: {
        color: '#242424',
    },

    // QR Code
    qrSection: {
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 16,
    },
    qrContainer: {
        width: 373,
        height: 373,
        borderRadius: 31,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 7,
    },
    qrGrid: {
        width: 320,
        height: 320,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrDot: {
        width: 18,
        height: 18,
        borderRadius: 2,
        backgroundColor: '#F0F0F0',
    },
    qrDotFilled: {
        backgroundColor: '#242424',
    },
    qrLogoWrap: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrLogo: {
        width: 98,
        height: 98,
        borderRadius: 23,
        backgroundColor: '#01CA47',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 12,
        borderColor: '#FFFFFF',
    },
    qrLogoText: {
        fontSize: 30,
        fontWeight: '700',
        color: 'white',
    },

    // Info cards
    detailScrollContent: {
        paddingHorizontal: 15,
        paddingBottom: spacing.huge,
        gap: 7,
    },

    // Network support + address card
    addressCard: {
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRadius: 15,
        padding: 10,
        paddingLeft: 17,
    },
    networkSupportText: {
        fontSize: 16,
        fontWeight: '400',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 24,
        marginBottom: 6,
    },
    walletAddressText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 24,
    },

    // Info Row Cards
    infoCard: {
        height: 52,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRadius: 15,
        padding: 10,
        paddingHorizontal: 17,
        justifyContent: 'center',
    },
    infoSection: {
        gap: 7,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: '400',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 24,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 24,
        textAlign: 'right',
    },

    // Detail Important Notes
    detailNotesSection: {
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRadius: 15,
        paddingVertical: 10,
        paddingHorizontal: 17,
    },
    detailNotesTitle: {
        fontSize: 16,
        fontWeight: '400',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 24,
        marginBottom: 6,
    },
    detailNoteText: {
        fontSize: 16,
        fontWeight: '400',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 24,
    },

    // Footer Buttons
    detailFooter: {
        paddingHorizontal: 24,
        paddingBottom: spacing.base,
        gap: 14,
    },
    copyBtn: {
        height: 52,
        backgroundColor: '#242424',
        borderRadius: 521,
        alignItems: 'center',
        justifyContent: 'center',
    },
    copyBtnCopied: {
        backgroundColor: '#01CA47',
    },
    copyBtnText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#FFFFFF',
        lineHeight: 27,
    },
    shareTextBtn: {
        height: 52,
        backgroundColor: '#F0F0F0',
        borderRadius: 521,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareTextBtnLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 24,
    },

    // Transaction Tab - Empty State
    emptyTransactionContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    emptyLogoBox: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#01CA47',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyLogoText: {
        fontSize: 40,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    emptyRecordsText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#B2B2B2',
        lineHeight: 24,
    },

    // ─── Share Bottom Sheet ──────────────────────────────────────────────────────

    shareQrWrap: {
        alignItems: 'center',
        marginBottom: 16,
    },
    shareQrContainer: {
        width: 160,
        height: 160,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareQrGrid: {
        width: 136,
        height: 136,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareQrDot: {
        width: 15,
        height: 15,
        borderRadius: 2,
        backgroundColor: '#F0F0F0',
    },
    shareQrDotFilled: {
        backgroundColor: '#242424',
    },
    shareQrLogoWrap: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareQrLogo: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#01CA47',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareQrLogoText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
    shareAddressText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#242424',
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    shareActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 58,
        paddingVertical: 17,
    },
    shareActionItem: {
        alignItems: 'center',
        gap: 5,
        width: 39,
    },
    shareActionIconWrap: {
        width: 39,
        height: 39,
        borderRadius: 243,
        backgroundColor: '#D9F7E3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareActionLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 21,
        textAlign: 'center',
    },
    okayBtn: {
        height: 52,
        backgroundColor: '#242424',
        borderRadius: 600,
        alignItems: 'center',
        justifyContent: 'center',
    },
    okayBtnText: {
        fontSize: 16,
        fontWeight: '500',
        color: 'white',
        lineHeight: 24,
    },
});
