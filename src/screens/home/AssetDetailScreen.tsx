import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Image,
    StyleSheet,
    AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    ViewFreeIcons,
    ViewOffFreeIcons,
    Add01FreeIcons,
    ArrowDataTransferHorizontalFreeIcons,
    FilterHorizontalFreeIcons,
    ArrowDown01FreeIcons,
    Wallet01FreeIcons,
    PercentSquareFreeIcons,
} from '@hugeicons/core-free-icons';
import type { AppStackParamList } from '@app-types/navigation.types';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { useDisplaySettings } from '@hooks/useDisplaySettings';
import { useWalletAsset, useWalletLedger } from '@hooks/api/useWallet';
import BalanceFilterSheet from '@components/wallet/BalanceFilterSheet';
import { CurrencyIcon } from '@components/icons/CurrencyIcons';

type Props = NativeStackScreenProps<AppStackParamList, 'AssetDetail'>;
type Nav = NativeStackNavigationProp<AppStackParamList>;
type TabId = 'overview' | 'transactions';

export default function AssetDetailScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const route = useRoute<Props['route']>();
    const { symbol } = route.params;
    const { formatAmount } = useDisplaySettings();

    const [balanceHidden, setBalanceHidden] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [balanceSheetVisible, setBalanceSheetVisible] = useState(false);
    const [txSortOrder, setTxSortOrder] = useState<'desc' | 'asc'>('desc');
    const [txTypeFilter, setTxTypeFilter] = useState<'all' | 'credit' | 'debit'>('all');
    const [displayMode, setDisplayMode] = useState<'available' | 'total'>('available');

    const asset = useWalletAsset(symbol);
    const ledger = useWalletLedger({ asset: symbol, page: 1, limit: 50 });

    const sortedFilteredEntries = useMemo(() => {
        const entries = ledger.data?.entries ?? [];
        const filtered = txTypeFilter === 'all'
            ? entries
            : entries.filter((e) => e.type === txTypeFilter);
        return [...filtered].sort((a, b) => {
            const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            return txSortOrder === 'desc' ? -diff : diff;
        });
    }, [ledger.data?.entries, txSortOrder, txTypeFilter]);

    const cycleTxType = useCallback(() => {
        setTxTypeFilter((prev) => {
            if (prev === 'all') return 'credit';
            if (prev === 'credit') return 'debit';
            return 'all';
        });
    }, []);

    // Hide balance when app goes to background
    useEffect(() => {
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'background' || state === 'inactive') {
                setBalanceHidden(true);
            }
        });
        return () => sub.remove();
    }, []);

    const onRefresh = useCallback(() => {
        asset.refetch();
        if (activeTab === 'transactions') ledger.refetch();
    }, [asset, ledger, activeTab]);

    const isRefreshing = asset.isRefetching || (activeTab === 'transactions' && ledger.isRefetching);

    const formattedBalance = asset.data
        ? formatAmount(parseFloat(displayMode === 'total' ? asset.data.balance : asset.data.available))
        : formatAmount(0);

    const assetName = asset.data?.name ?? symbol;

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.6}
                        style={styles.backBtn}
                    >
                        <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        {asset.data?.icon_url ? (
                            <Image
                                source={{ uri: asset.data.icon_url }}
                                style={styles.headerFlag}
                            />
                        ) : (
                            <CurrencyIcon symbol={symbol} size={28} />
                        )}
                        <Text style={styles.headerTitle}>{assetName}</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => setBalanceHidden((v) => !v)}
                        activeOpacity={0.6}
                        style={styles.eyeBtn}
                    >
                        <HugeiconsIcon
                            icon={balanceHidden ? ViewOffFreeIcons : ViewFreeIcons}
                            size={24}
                            color="#242424"
                        />
                    </TouchableOpacity>
                </View>

                {/* Balance Card (no green banner) */}
                <View style={styles.balanceCard}>
                    {/* 3-dot menu */}
                    <TouchableOpacity style={styles.dotsBtn} activeOpacity={0.6}>
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                    </TouchableOpacity>

                    {/* Balance */}
                    <View style={styles.balanceWrap}>
                        <Text style={styles.balanceText} numberOfLines={1} adjustsFontSizeToFit>
                            {balanceHidden ? '****' : formattedBalance}
                        </Text>
                        <TouchableOpacity style={styles.availableRow} activeOpacity={0.6} onPress={() => setBalanceSheetVisible(true)}>
                            <Text style={styles.availableText}>{displayMode === 'total' ? 'Total Balance' : 'Available Balance'}</Text>
                            <Text style={styles.chevron}>&gt;</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Quick Actions */}
                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.actionItem} activeOpacity={0.7} onPress={() => navigation.navigate('Deposit')}>
                            <View style={styles.actionCircle}>
                                <HugeiconsIcon icon={Add01FreeIcons} size={24} color="#242424" />
                            </View>
                            <Text style={styles.actionLabel}>Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} activeOpacity={0.7} onPress={() => navigation.navigate('FXSwap')}>
                            <View style={styles.actionCircle}>
                                <HugeiconsIcon icon={ArrowDataTransferHorizontalFreeIcons} size={24} color="#242424" />
                            </View>
                            <Text style={styles.actionLabel}>Swap</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tab Selector */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'overview' ? styles.tabActive : styles.tabInactive]}
                        onPress={() => setActiveTab('overview')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, activeTab === 'overview' ? styles.tabTextActive : styles.tabTextInactive]}>
                            Overview
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'transactions' ? styles.tabActive : styles.tabInactive]}
                        onPress={() => setActiveTab('transactions')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, activeTab === 'transactions' ? styles.tabTextActive : styles.tabTextInactive]}>
                            Transactions
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <View style={styles.overviewSection}>
                        {/* Sort Controls */}
                        <View style={styles.sortRow}>
                            <TouchableOpacity style={styles.sortBtn} activeOpacity={0.6}>
                                <HugeiconsIcon icon={FilterHorizontalFreeIcons} size={18} color="rgba(0, 0, 0, 0.20)" />
                                <Text style={styles.sortText}>Descend</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.sortBtn} activeOpacity={0.6}>
                                <Text style={styles.sortText}>All</Text>
                                <HugeiconsIcon icon={ArrowDown01FreeIcons} size={14} color="rgba(0, 0, 0, 0.20)" />
                            </TouchableOpacity>
                        </View>

                        {/* Account Rows */}
                        <View style={styles.accountList}>
                            {/* Savings */}
                            <View style={styles.accountCard}>
                                <View style={styles.accountIconSavings}>
                                    <HugeiconsIcon icon={Wallet01FreeIcons} size={30} color="#242424" />
                                </View>
                                <View style={styles.accountContent}>
                                    <View style={styles.accountTopRow}>
                                        <Text style={styles.accountName}>Savings</Text>
                                        <Text style={styles.accountBalance}>
                                            {balanceHidden ? '****' : '0.00'}
                                        </Text>
                                    </View>
                                    <View style={styles.accountBottomRow}>
                                        <Text style={styles.accountNumber}>088-001-658780</Text>
                                        <Text style={styles.accountType}>Custody</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Earning+ */}
                            <View style={styles.accountCard}>
                                <View style={styles.accountIconEarning}>
                                    <HugeiconsIcon icon={PercentSquareFreeIcons} size={24} color="#F4F4F4" />
                                </View>
                                <View style={styles.accountContent}>
                                    <View style={styles.accountTopRow}>
                                        <Text style={styles.accountName}>Earning+</Text>
                                        <Text style={styles.accountBalance}>
                                            {balanceHidden ? '****' : '0.00'}
                                        </Text>
                                    </View>
                                    <View style={styles.accountBottomRow}>
                                        <Text style={styles.accountNumber}>088-001-658780</Text>
                                        <Text style={styles.accountType}>Custody</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {activeTab === 'transactions' && (
                    <View style={styles.transactionsSection}>
                        {/* Sort Controls */}
                        <View style={styles.sortRow}>
                            <TouchableOpacity style={styles.sortBtn} activeOpacity={0.6} onPress={() => setTxSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}>
                                <HugeiconsIcon icon={FilterHorizontalFreeIcons} size={18} color="rgba(0, 0, 0, 0.20)" />
                                <Text style={styles.sortText}>{txSortOrder === 'desc' ? 'Descend' : 'Ascend'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.sortBtn} activeOpacity={0.6} onPress={cycleTxType}>
                                <Text style={styles.sortText}>{txTypeFilter === 'all' ? 'All' : txTypeFilter.charAt(0).toUpperCase() + txTypeFilter.slice(1)}</Text>
                                <HugeiconsIcon icon={ArrowDown01FreeIcons} size={14} color="rgba(0, 0, 0, 0.20)" />
                            </TouchableOpacity>
                        </View>

                        {sortedFilteredEntries.length ? (
                            <View style={styles.txList}>
                                {sortedFilteredEntries.map((entry) => (
                                    <View key={entry.id} style={styles.ledgerRow}>
                                        <View style={[styles.ledgerBadge, entry.type === 'credit' ? styles.ledgerBadgeCredit : styles.ledgerBadgeDebit]}>
                                            <Text style={[styles.ledgerBadgeText, entry.type === 'credit' ? styles.ledgerBadgeTextCredit : styles.ledgerBadgeTextDebit]}>
                                                {entry.type === 'credit' ? '+' : '-'}
                                            </Text>
                                        </View>
                                        <View style={styles.ledgerInfo}>
                                            <Text style={styles.ledgerDescription} numberOfLines={1}>{entry.description || (entry.type === 'credit' ? 'Credit' : 'Debit')}</Text>
                                            <Text style={styles.ledgerDate}>{new Date(entry.created_at).toLocaleString()}</Text>
                                        </View>
                                        <View style={styles.ledgerRight}>
                                            <Text style={[styles.ledgerAmount, entry.type === 'credit' ? styles.ledgerAmountCredit : styles.ledgerAmountDebit]}>
                                                {entry.type === 'credit' ? '+' : '-'}{balanceHidden ? '****' : entry.amount} {symbol}
                                            </Text>
                                            <Text style={styles.ledgerBalance}>
                                                Bal: {balanceHidden ? '****' : entry.balance_after}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <View style={styles.emptyLogo}>
                                    <Text style={styles.emptyLogoText}>L</Text>
                                </View>
                                <Text style={styles.emptyText}>
                                    {ledger.isLoading ? 'Loading...' : 'No Records'}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            <BalanceFilterSheet
                visible={balanceSheetVisible}
                onClose={() => setBalanceSheetVisible(false)}
                currency={assetName}
                showTypeFilter={false}
                onConfirm={(display) => setDisplayMode(display)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.huge,
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 30,
        height: 63,
    },
    backBtn: {
        width: 36,
        height: 33,
        justifyContent: 'center',
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    headerFlag: {
        width: 17,
        height: 17,
        borderRadius: 210,
        borderWidth: 0.31,
        borderColor: '#C4C4C4',
    },
    headerFlagEmoji: {
        fontSize: 14,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 24,
    },
    eyeBtn: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Balance Card (no green banner)
    balanceCard: {
        marginHorizontal: 15,
        backgroundColor: 'white',
        borderRadius: 21,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        paddingTop: 29,
        paddingBottom: spacing.base,
    },
    dotsBtn: {
        position: 'absolute',
        top: 19,
        right: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        zIndex: 1,
        padding: 4,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#242424',
    },
    balanceWrap: {
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    balanceText: {
        fontSize: 46,
        fontWeight: '700',
        color: '#242424',
        lineHeight: 57.5,
        textAlign: 'center',
    },
    availableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
    },
    availableText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 24,
    },
    chevron: {
        fontSize: 14,
        color: '#242424',
        marginLeft: 2,
    },
    divider: {
        height: 1.5,
        backgroundColor: '#F0F0F0',
        marginTop: spacing.base,
        marginBottom: spacing.base,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 35,
        paddingVertical: spacing.sm,
    },
    actionItem: {
        alignItems: 'center',
        gap: 8,
    },
    actionCircle: {
        width: 46,
        height: 46,
        borderRadius: 370,
        backgroundColor: '#D9F7E3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 18,
        textAlign: 'center',
    },
    // Tabs
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 15,
        marginTop: 26,
        justifyContent: 'space-between',
        gap: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 380,
    },
    tabActive: {
        backgroundColor: '#242424',
    },
    tabInactive: {
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 21,
    },
    tabTextActive: {
        color: '#E8E8E8',
    },
    tabTextInactive: {
        color: '#B2B2B2',
    },
    // Overview
    overviewSection: {
        paddingHorizontal: 15,
        marginTop: 20,
    },
    sortRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
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
    accountList: {
        gap: 10,
    },
    // Account cards
    accountCard: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 78,
        borderRadius: 13,
        borderWidth: 0.5,
        borderColor: '#E8E8E8',
        paddingHorizontal: 12,
        gap: 12,
    },
    accountIconSavings: {
        width: 55,
        height: 55,
        borderRadius: 678,
        backgroundColor: '#D9F7E3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    accountIconEarning: {
        width: 55,
        height: 55,
        borderRadius: 678,
        backgroundColor: '#01CA47',
        alignItems: 'center',
        justifyContent: 'center',
    },
    accountContent: {
        flex: 1,
        gap: 4,
    },
    accountTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    accountName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 24,
    },
    accountBalance: {
        fontSize: 26,
        fontWeight: '700',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 31.2,
        textAlign: 'right',
    },
    accountBottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    accountNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: '#B2B2B2',
        lineHeight: 19.2,
    },
    accountType: {
        fontSize: 14,
        fontWeight: '700',
        color: '#B2B2B2',
        lineHeight: 16.8,
        textAlign: 'right',
    },
    // Transactions
    transactionsSection: {
        paddingHorizontal: 15,
        marginTop: 20,
    },
    txList: {
        gap: 0,
    },
    ledgerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        gap: 12,
    },
    ledgerBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ledgerBadgeCredit: {
        backgroundColor: '#D9F7E3',
    },
    ledgerBadgeDebit: {
        backgroundColor: '#FFF0F0',
    },
    ledgerBadgeText: {
        fontSize: 22,
        fontWeight: '700',
    },
    ledgerBadgeTextCredit: {
        color: '#01CA47',
    },
    ledgerBadgeTextDebit: {
        color: '#FF5A5F',
    },
    ledgerInfo: {
        flex: 1,
        gap: 3,
    },
    ledgerDescription: {
        fontSize: 14,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 21,
    },
    ledgerDate: {
        fontSize: 12,
        fontWeight: '400',
        color: '#B2B2B2',
        lineHeight: 18,
    },
    ledgerRight: {
        alignItems: 'flex-end',
        gap: 3,
    },
    ledgerAmount: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 21,
    },
    ledgerAmountCredit: {
        color: '#01CA47',
    },
    ledgerAmountDebit: {
        color: '#FF5A5F',
    },
    ledgerBalance: {
        fontSize: 11,
        fontWeight: '400',
        color: '#B2B2B2',
        lineHeight: 16,
    },
    emptyState: {
        paddingVertical: 60,
        alignItems: 'center',
        gap: 12,
    },
    emptyLogo: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: '#01CA47',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyLogoText: {
        fontSize: 32,
        fontWeight: '700',
        color: 'white',
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 21,
    },
});
