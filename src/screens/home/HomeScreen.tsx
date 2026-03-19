import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    Image,
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
    FilterHorizontalFreeIcons,
    ArrowDown01FreeIcons,
} from '@hugeicons/core-free-icons';
import Svg, { Path } from 'react-native-svg';
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
import { FlagIcon } from '@components/icons/CurrencyIcons';
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
                        <FlagIcon code="USD" size={28} />
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            onPress={() => setBalanceHidden((v) => !v)}
                            activeOpacity={0.6}
                            style={styles.headerBtn}
                        >
                            {/* Eye icon — toggles between view and view-off */}
                            {!balanceHidden ? (
                                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                                    <Path d="M2 8C2 8 6.47715 3 12 3C17.5228 3 22 8 22 8" stroke="#242424" strokeWidth={1.5} strokeLinecap="round" />
                                    <Path d="M21.544 13.045C21.848 13.4713 22 13.6845 22 14C22 14.3155 21.848 14.5287 21.544 14.955C20.1779 16.8706 16.6892 21 12 21C7.31078 21 3.8221 16.8706 2.45604 14.955C2.15201 14.5287 2 14.3155 2 14C2 13.6845 2.15201 13.4713 2.45604 13.045C3.8221 11.1294 7.31078 7 12 7C16.6892 7 20.1779 11.1294 21.544 13.045Z" stroke="#242424" strokeWidth={1.5} />
                                    <Path d="M15 14C15 12.3431 13.6569 11 12 11C10.3431 11 9 12.3431 9 14C9 15.6569 10.3431 17 12 17C13.6569 17 15 15.6569 15 14Z" stroke="#242424" strokeWidth={1.5} />
                                </Svg>
                            ) : (
                                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                                    <Path d="M22 8C22 8 18 14 12 14C6 14 2 8 2 8" stroke="#242424" strokeWidth={1.5} strokeLinecap="round" />
                                    <Path d="M15 13.5L16.5 16" stroke="#242424" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                    <Path d="M20 11L22 13" stroke="#242424" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                    <Path d="M2 13L4 11" stroke="#242424" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                    <Path d="M9 13.5L7.5 16" stroke="#242424" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.6}
                            style={styles.headerBtn}
                            onPress={() => navigation.navigate('QRScanner')}
                        >
                            {/* Scanner icon */}
                            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                                <Path d="M2.5 8.18677C2.60406 6.08705 2.91537 4.77792 3.84664 3.84664C4.77792 2.91537 6.08705 2.60406 8.18677 2.5M21.5 8.18677C21.3959 6.08705 21.0846 4.77792 20.1534 3.84664C19.2221 2.91537 17.9129 2.60406 15.8132 2.5M15.8132 21.5C17.9129 21.3959 19.2221 21.0846 20.1534 20.1534C21.0846 19.2221 21.3959 17.9129 21.5 15.8132M8.18676 21.5C6.08705 21.3959 4.77792 21.0846 3.84664 20.1534C2.91537 19.2221 2.60406 17.9129 2.5 15.8132" stroke="#242424" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                <Path d="M2.5 12H21.5" stroke="#242424" strokeWidth={1.5} strokeLinecap="round" />
                            </Svg>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.6}
                            style={styles.headerBtn}
                            onPress={() => navigation.navigate('NotificationsList')}
                        >
                            {/* Bell icon */}
                            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                                <Path d="M2.52992 14.7696C2.31727 16.1636 3.268 17.1312 4.43205 17.6134C8.89481 19.4622 15.1052 19.4622 19.5679 17.6134C20.732 17.1312 21.6827 16.1636 21.4701 14.7696C21.3394 13.9129 20.6932 13.1995 20.2144 12.5029C19.5873 11.5793 19.525 10.5718 19.5249 9.5C19.5249 5.35786 16.1559 2 12 2C7.84413 2 4.47513 5.35786 4.47513 9.5C4.47503 10.5718 4.41272 11.5793 3.78561 12.5029C3.30684 13.1995 2.66061 13.9129 2.52992 14.7696Z" stroke="#242424" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                <Path d="M8 19C8.45849 20.7252 10.0755 22 12 22C13.9245 22 15.5415 20.7252 16 19" stroke="#242424" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
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
                                <Image
                                    source={require('@assets/images/branding/logo_gradient_icon.png')}
                                    style={styles.emptyIcon}
                                    resizeMode="contain"
                                />
                                <Text style={styles.emptyText}>No Records</Text>
                            </View>
                        )}
                    </View>
                )}

                {activeTab === 'account' && (
                    <View style={styles.listSection}>
                        <View style={styles.accountRow}>
                            <View style={styles.accountIconWrap}>
                                {/* Save money dollar icon */}
                                <Svg width={30} height={30} viewBox="0 0 30 30" fill="none">
                                    <Path d="M24.6816 16.25C25.6702 14.8327 26.25 13.1091 26.25 11.25C26.25 6.41751 22.3325 2.5 17.5 2.5C12.6675 2.5 8.75 6.41751 8.75 11.25C8.75 12.592 9.05211 13.8634 9.59204 15" stroke="#242424" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                    <Path d="M17.5 7.5C16.1193 7.5 15 8.33947 15 9.375C15 10.4105 16.1193 11.25 17.5 11.25C18.8807 11.25 20 12.0895 20 13.125C20 14.1605 18.8807 15 17.5 15M17.5 7.5C18.5885 7.5 19.5145 8.02175 19.8577 8.75M17.5 7.5V6.25M17.5 15C16.4115 15 15.4855 14.4782 15.1423 13.75M17.5 15V16.25" stroke="#242424" strokeWidth={1.5} strokeLinecap="round" />
                                    <Path d="M3.75 17.5H6.74352C7.11121 17.5 7.47385 17.5828 7.80271 17.742L10.3552 18.9769C10.684 19.1361 11.0467 19.2189 11.4144 19.2189H12.7177C13.9782 19.2189 15 20.2077 15 21.4275C15 21.4768 14.9662 21.5201 14.9172 21.5337L11.7411 22.4118C11.1713 22.5693 10.5612 22.5145 10.0312 22.258L7.30263 20.9378M15 20.625L20.741 18.8611C21.7587 18.544 22.8588 18.92 23.4964 19.8029C23.9573 20.4412 23.7696 21.3552 23.0981 21.7427L13.7036 27.1632C13.1061 27.5079 12.4012 27.592 11.7439 27.397L3.75 25.0249" stroke="#242424" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                            </View>
                            <View style={styles.accountInfo}>
                                <View style={styles.accountTopRow}>
                                    <Text style={styles.accountName}>Savings</Text>
                                    <Text style={styles.accountBalance}>
                                        {balanceHidden ? '****' : '0.00'}
                                    </Text>
                                </View>
                                <View style={styles.accountBottomRow}>
                                    <Text style={styles.accountSubtext}>088-001-658780</Text>
                                    <Text style={styles.accountCustody}>Custody</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.accountRow}>
                            <View style={[styles.accountIconWrap, { backgroundColor: '#01CA47' }]}>
                                {/* Earning+ icon — dollar sign (white on green) */}
                                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                                    <Path d="M18.4167 8.14815C18.4167 5.85719 15.5438 4 12 4C8.45617 4 5.58333 5.85719 5.58333 8.14815C5.58333 10.4391 7.33333 11.7037 12 11.7037C16.6667 11.7037 19 12.8889 19 15.8519C19 18.8148 15.866 20 12 20C8.13401 20 5 18.1428 5 15.8519" stroke="#F4F4F4" strokeWidth={1.5} strokeLinecap="round" />
                                    <Path d="M12 2V22" stroke="#F4F4F4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                            </View>
                            <View style={styles.accountInfo}>
                                <View style={styles.accountTopRow}>
                                    <Text style={styles.accountName}>Earning+</Text>
                                    <Text style={styles.accountBalance}>
                                        {balanceHidden ? '****' : '0.00'}
                                    </Text>
                                </View>
                                <View style={styles.accountBottomRow}>
                                    <Text style={styles.accountSubtext}>088-001-658780</Text>
                                    <Text style={styles.accountCustody}>Custody</Text>
                                </View>
                            </View>
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
                                <Image
                                    source={require('@assets/images/branding/logo_gradient_icon.png')}
                                    style={styles.emptyIcon}
                                    resizeMode="contain"
                                />
                                <Text style={styles.emptyText}>No Records</Text>
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
    flagImage: {
        width: 28,
        height: 28,
        borderRadius: 14,
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
        paddingVertical: 80,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        width: '100%',
        gap: 16,
    },
    emptyIcon: {
        width: 100,
        height: 100,
        borderRadius: 24,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.textMuted,
    },
    // Account tab
    accountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderRadius: 13,
        borderWidth: 0.5,
        borderColor: '#E8E8E8',
        paddingHorizontal: 12,
        paddingVertical: 14,
    },
    accountIconWrap: {
        width: 55,
        height: 55,
        borderRadius: 678,
        backgroundColor: '#D9F7E3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    accountInfo: {
        flex: 1,
        gap: 4,
    },
    accountTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    accountBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    accountName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 24,
    },
    accountSubtext: {
        fontSize: 16,
        fontWeight: '700',
        color: '#B2B2B2',
        lineHeight: 19.2,
    },
    accountBalance: {
        fontSize: 26,
        fontWeight: '700',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 31.2,
        textAlign: 'right',
    },
    accountCustody: {
        fontSize: 14,
        fontWeight: '700',
        color: '#B2B2B2',
        lineHeight: 16.8,
        textAlign: 'right',
    },
});
