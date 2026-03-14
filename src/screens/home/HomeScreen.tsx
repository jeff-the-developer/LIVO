import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    StyleSheet,
    AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ViewFreeIcons,
    ViewOffFreeIcons,
    QrCodeFreeIcons,
    Notification03FreeIcons,
    FilterHorizontalFreeIcons,
    ArrowDown01FreeIcons,
} from '@hugeicons/core-free-icons';
import type { AppStackParamList } from '@app-types/navigation.types';
import { colors, palette } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { useDisplaySettings } from '@hooks/useDisplaySettings';
import { useWalletDashboard } from '@hooks/api/useWallet';
import { useTransactions } from '@hooks/api/useTransactions';
import { useNotifications } from '@hooks/api/useNotifications';
import BalanceCard from '@components/wallet/BalanceCard';
import AssetRow from '@components/wallet/AssetRow';
import TransactionRow from '@components/transactions/TransactionRow';
import BalanceFilterSheet from '@components/wallet/BalanceFilterSheet';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type TabId = 'assets' | 'account' | 'activity';

const TABS: { id: TabId; label: string }[] = [
    { id: 'assets', label: 'Assets' },
    { id: 'account', label: 'Account' },
    { id: 'activity', label: 'Activity' },
];

const CURRENCY_FLAGS: Record<string, string> = {
    USD: 'US', HKD: 'HK', CNY: 'CN', AUD: 'AU', CAD: 'CA',
    CHF: 'CH', EUR: 'EU', GBP: 'GB', JPY: 'JP', SGD: 'SG',
};

function getFlagEmoji(currency: string): string {
    const code = CURRENCY_FLAGS[currency] ?? 'US';
    return code
        .toUpperCase()
        .split('')
        .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
        .join('');
}

export default function HomeScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const { currency, formatAmount } = useDisplaySettings();

    const [balanceHidden, setBalanceHidden] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>('assets');
    const [balanceSheetVisible, setBalanceSheetVisible] = useState(false);
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [assetTypeFilter, setAssetTypeFilter] = useState<'all' | 'fiat' | 'crypto'>('all');
    const [displayMode, setDisplayMode] = useState<'available' | 'total'>('available');

    const dashboard = useWalletDashboard(currency);
    const transactions = useTransactions({ page: 1, limit: 10 });
    const notifications = useNotifications(1, 10);

    const unreadCount = notifications.data?.unread_count ?? 0;

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
        dashboard.refetch();
        if (activeTab === 'activity') transactions.refetch();
    }, [dashboard, transactions, activeTab]);

    const isRefreshing = dashboard.isRefetching || (activeTab === 'activity' && transactions.isRefetching);

    const formattedTotal = dashboard.data
        ? formatAmount(parseFloat(
              displayMode === 'total'
                  ? dashboard.data.total_balance
                  : dashboard.data.available_balance,
          ))
        : formatAmount(0);

    const FIAT_SYMBOLS = new Set(['USD', 'HKD', 'CNY', 'AUD', 'CAD', 'CHF', 'EUR', 'GBP', 'JPY', 'SGD']);

    const sortedFilteredAssets = useMemo(() => {
        const assets = dashboard.data?.assets ?? [];
        const filtered = assetTypeFilter === 'all'
            ? assets
            : assets.filter((a) =>
                  assetTypeFilter === 'fiat'
                      ? FIAT_SYMBOLS.has(a.symbol.toUpperCase())
                      : !FIAT_SYMBOLS.has(a.symbol.toUpperCase()),
              );
        return [...filtered].sort((a, b) => {
            const diff = parseFloat(a.balance) - parseFloat(b.balance);
            return sortOrder === 'desc' ? -diff : diff;
        });
    }, [dashboard.data?.assets, sortOrder, assetTypeFilter]);

    const cycleAssetType = useCallback(() => {
        setAssetTypeFilter((prev) => {
            if (prev === 'all') return 'fiat';
            if (prev === 'fiat') return 'crypto';
            return 'all';
        });
    }, []);

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
                    <View style={styles.flagWrap}>
                        <Text style={styles.flagIcon}>{getFlagEmoji(currency)}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            onPress={() => setBalanceHidden((v) => !v)}
                            activeOpacity={0.6}
                            style={styles.headerBtn}
                        >
                            <HugeiconsIcon
                                icon={balanceHidden ? ViewOffFreeIcons : ViewFreeIcons}
                                size={24}
                                color="#242424"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.6}
                            style={styles.headerBtn}
                            onPress={() => navigation.navigate('QRScanner')}
                        >
                            <HugeiconsIcon icon={QrCodeFreeIcons} size={24} color="#242424" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.6}
                            style={styles.headerBtn}
                            onPress={() => navigation.navigate('NotificationsList')}
                        >
                            <HugeiconsIcon icon={Notification03FreeIcons} size={24} color="#242424" />
                            {unreadCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Balance Card (includes quick actions) */}
                {dashboard.isError ? (
                    <TouchableOpacity style={styles.errorCard} onPress={() => dashboard.refetch()} activeOpacity={0.7}>
                        <Text style={styles.errorTitle}>Unable to load balance</Text>
                        <Text style={styles.errorSubtitle}>Tap to retry</Text>
                    </TouchableOpacity>
                ) : (
                    <BalanceCard
                        totalBalance={formattedTotal}
                        isHidden={balanceHidden}
                        onAddPress={() => {}}
                        onSwapPress={() => {}}
                        onCashBalancePress={() => setBalanceSheetVisible(true)}
                    />
                )}

                {/* Tab Selector */}
                <View style={styles.tabContainer}>
                    {TABS.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[
                                styles.tab,
                                activeTab === tab.id ? styles.tabActive : styles.tabInactive,
                            ]}
                            onPress={() => setActiveTab(tab.id)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.tabText,
                                activeTab === tab.id ? styles.tabTextActive : styles.tabTextInactive,
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Sort Controls (Assets tab only) */}
                {activeTab === 'assets' && (
                    <View style={styles.sortRow}>
                        <TouchableOpacity style={styles.sortBtn} activeOpacity={0.6} onPress={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}>
                            <HugeiconsIcon icon={FilterHorizontalFreeIcons} size={18} color="rgba(0, 0, 0, 0.20)" />
                            <Text style={styles.sortText}>{sortOrder === 'desc' ? 'Descend' : 'Ascend'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.sortBtn} activeOpacity={0.6} onPress={cycleAssetType}>
                            <Text style={styles.sortText}>{assetTypeFilter.charAt(0).toUpperCase() + assetTypeFilter.slice(1)}</Text>
                            <HugeiconsIcon icon={ArrowDown01FreeIcons} size={14} color="rgba(0, 0, 0, 0.20)" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Tab Content */}
                {activeTab === 'assets' && (
                    <View style={styles.listSection}>
                        {sortedFilteredAssets.length ? (
                            sortedFilteredAssets.map((asset) => (
                                <AssetRow
                                    key={asset.symbol}
                                    symbol={asset.symbol}
                                    name={asset.name}
                                    price={asset.price}
                                    change24h={asset.change_24h}
                                    balance={asset.balance}
                                    usdValue={`${asset.balance} USD`}
                                    iconUrl={asset.icon_url}
                                    isHidden={balanceHidden}
                                    onPress={() => navigation.navigate('AssetDetail', { symbol: asset.symbol })}
                                />
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>
                                    {dashboard.isLoading ? 'Loading assets...' : 'No assets yet'}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {activeTab === 'account' && (
                    <View style={styles.listSection}>
                        <View style={styles.accountRow}>
                            <View style={styles.accountInfo}>
                                <Text style={styles.accountName}>Savings</Text>
                                <Text style={styles.accountSubtext}>Custody</Text>
                            </View>
                            <Text style={styles.accountBalance}>
                                {balanceHidden ? '****' : formattedTotal}
                            </Text>
                        </View>
                        <View style={styles.accountRow}>
                            <View style={styles.accountInfo}>
                                <Text style={styles.accountName}>Earning+</Text>
                                <Text style={styles.accountSubtext}>Custody</Text>
                            </View>
                            <Text style={styles.accountBalance}>
                                {balanceHidden ? '****' : formatAmount(0)}
                            </Text>
                        </View>
                    </View>
                )}

                {activeTab === 'activity' && (
                    <View style={styles.activitySection}>
                        {transactions.data?.transactions?.length ? (
                            transactions.data.transactions.map((tx) => (
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
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>
                                    {transactions.isLoading ? 'Loading activity...' : 'No transactions yet'}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            <BalanceFilterSheet
                visible={balanceSheetVisible}
                onClose={() => setBalanceSheetVisible(false)}
                currency="US Dollar"
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
        paddingVertical: 10,
    },
    flagWrap: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    flagIcon: {
        fontSize: 26,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 21,
    },
    headerBtn: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -6,
        backgroundColor: colors.error,
        borderRadius: borderRadius.full,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    badgeText: {
        fontSize: 9,
        color: colors.textInverse,
        fontWeight: '700',
    },
    // Error
    errorCard: {
        marginHorizontal: 15,
        backgroundColor: colors.cardBackground,
        borderRadius: 21,
        padding: spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    errorTitle: {
        ...typography.h4,
        color: '#242424',
    },
    errorSubtitle: {
        ...typography.bodySm,
        color: colors.primary,
        marginTop: spacing.xs,
    },
    // Tabs
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 15,
        marginTop: spacing.lg,
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
    // Sort
    sortRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginTop: spacing.lg,
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
    // List
    listSection: {
        paddingHorizontal: 15,
        gap: 10,
    },
    activitySection: {
        paddingHorizontal: 15,
        gap: 30,
    },
    emptyState: {
        paddingVertical: spacing.xxxl,
        alignItems: 'center',
    },
    emptyText: {
        ...typography.bodyMd,
        color: colors.textMuted,
    },
    // Account tab
    accountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 78,
        borderRadius: 13,
        borderWidth: 0.5,
        borderColor: '#E8E8E8',
        paddingHorizontal: 12,
    },
    accountInfo: {
        flex: 1,
    },
    accountName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 24,
    },
    accountSubtext: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(0, 0, 0, 0.20)',
        marginTop: 2,
    },
    accountBalance: {
        fontSize: 30,
        fontWeight: '600',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 37.5,
    },
});
