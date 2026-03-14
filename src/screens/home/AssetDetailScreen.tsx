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
import { useWalletAsset } from '@hooks/api/useWallet';
import { useTransactions } from '@hooks/api/useTransactions';
import TransactionRow from '@components/transactions/TransactionRow';
import BalanceFilterSheet from '@components/wallet/BalanceFilterSheet';

type Props = NativeStackScreenProps<AppStackParamList, 'AssetDetail'>;
type Nav = NativeStackNavigationProp<AppStackParamList>;
type TabId = 'overview' | 'transactions';

const CURRENCY_FLAGS: Record<string, string> = {
    USD: 'US', HKD: 'HK', CNY: 'CN', AUD: 'AU', CAD: 'CA',
    CHF: 'CH', EUR: 'EU', GBP: 'GB', JPY: 'JP', SGD: 'SG',
};

function getFlagEmoji(symbol: string): string {
    const code = CURRENCY_FLAGS[symbol] ?? 'US';
    return code
        .toUpperCase()
        .split('')
        .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
        .join('');
}

export default function AssetDetailScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const route = useRoute<Props['route']>();
    const { symbol } = route.params;
    const { formatAmount } = useDisplaySettings();

    const [balanceHidden, setBalanceHidden] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [balanceSheetVisible, setBalanceSheetVisible] = useState(false);
    const [txSortOrder, setTxSortOrder] = useState<'desc' | 'asc'>('desc');
    const [txTypeFilter, setTxTypeFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'transfer' | 'swap'>('all');
    const [displayMode, setDisplayMode] = useState<'available' | 'total'>('available');

    const asset = useWalletAsset(symbol);
    const allTransactions = useTransactions({ page: 1, limit: 50 });

    // Filter transactions to only show ones matching this asset's currency
    const filteredTx = allTransactions.data?.transactions?.filter(
        (tx) => tx.currency.toUpperCase() === symbol.toUpperCase(),
    ) ?? [];

    const sortedFilteredTx = useMemo(() => {
        const filtered = txTypeFilter === 'all'
            ? filteredTx
            : filteredTx.filter((tx) => tx.type === txTypeFilter);
        return [...filtered].sort((a, b) => {
            const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
            return txSortOrder === 'desc' ? -diff : diff;
        });
    }, [filteredTx, txSortOrder, txTypeFilter]);

    const cycleTxType = useCallback(() => {
        setTxTypeFilter((prev) => {
            const cycle: Array<'all' | 'deposit' | 'withdrawal' | 'transfer' | 'swap'> = ['all', 'deposit', 'withdrawal', 'transfer', 'swap'];
            const idx = cycle.indexOf(prev);
            return cycle[(idx + 1) % cycle.length];
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
        if (activeTab === 'transactions') allTransactions.refetch();
    }, [asset, allTransactions, activeTab]);

    const isRefreshing = asset.isRefetching || (activeTab === 'transactions' && allTransactions.isRefetching);

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
                            <Text style={styles.headerFlagEmoji}>{getFlagEmoji(symbol)}</Text>
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
                        <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
                            <View style={styles.actionCircle}>
                                <HugeiconsIcon icon={Add01FreeIcons} size={24} color="#242424" />
                            </View>
                            <Text style={styles.actionLabel}>Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
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

                        {sortedFilteredTx.length ? (
                            <View style={styles.txList}>
                                {sortedFilteredTx.map((tx) => (
                                    <TransactionRow
                                        key={tx.id}
                                        type={tx.type}
                                        from={tx.from}
                                        to={tx.to}
                                        amount={tx.amount}
                                        currency={tx.currency}
                                        timestamp={tx.timestamp}
                                        status={tx.status}
                                        isHidden={balanceHidden}
                                        onPress={() => navigation.navigate('TransactionDetail', { id: tx.id })}
                                    />
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <View style={styles.emptyLogo}>
                                    <Text style={styles.emptyLogoText}>L</Text>
                                </View>
                                <Text style={styles.emptyText}>
                                    {allTransactions.isLoading ? 'Loading...' : 'No Records'}
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
        gap: 30,
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
