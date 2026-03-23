import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    FlatList,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    FilterHorizontalFreeIcons,
    ArrowDown01FreeIcons,
} from '@hugeicons/core-free-icons';
import type { AppStackParamList } from '@app-types/navigation.types';
import type { Transaction, TxType } from '@app-types/transaction.types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { useInfiniteTransactions } from '@hooks/api/useTransactions';
import EmptyState from '@components/common/EmptyState';
import ErrorState from '@components/common/ErrorState';
import ScreenHeader from '@components/common/ScreenHeader';
import TransactionRow from '@components/transactions/TransactionRow';
import TransactionListSkeleton from '@components/transactions/TransactionListSkeleton';

type Nav = NativeStackNavigationProp<AppStackParamList>;

type SortOrder = 'desc' | 'asc';
type TypeFilter = 'all' | TxType;

const TYPE_CYCLE: TypeFilter[] = ['all', 'transfer', 'deposit', 'withdrawal', 'swap', 'earning', 'card_topup'];
const EMPTY_STATE_IMAGE = require('@assets/images/branding/logo_gradient_icon.png');

export default function AllTransactionsScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();

    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

    const transactions = useInfiniteTransactions({
        limit: 30,
        type: typeFilter === 'all' ? undefined : typeFilter,
    });

    const pages = transactions.data?.pages ?? [];
    const data = useMemo(
        () => pages.flatMap((page) => page.transactions),
        [pages],
    );
    const lastPage = pages[pages.length - 1];
    const hasMore = lastPage?.pagination.has_more ?? false;

    const sorted = useMemo(
        () => (sortOrder === 'desc' ? data : [...data].reverse()),
        [data, sortOrder],
    );

    const cycleType = useCallback(() => {
        setTypeFilter((prev) => {
            const idx = TYPE_CYCLE.indexOf(prev);
            return TYPE_CYCLE[(idx + 1) % TYPE_CYCLE.length];
        });
    }, []);

    const toggleSort = useCallback(() => {
        setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    }, []);

    const loadMore = useCallback(() => {
        if (hasMore && !transactions.isFetchingNextPage) {
            transactions.fetchNextPage();
        }
    }, [hasMore, transactions]);

    const handleRefresh = useCallback(() => {
        transactions.refetch();
    }, [transactions]);

    const goToSend = useCallback(() => {
        navigation.dispatch(
            CommonActions.navigate({
                name: 'MainTabs',
                params: { screen: 'Send' },
            }),
        );
    }, [navigation]);

    const handlePressTransaction = useCallback(
        (tx: Transaction) => {
            navigation.navigate('TransactionDetail', {
                id: tx.id,
                type: tx.type,
                status: tx.status,
                amount: tx.amount,
                fee: tx.fee,
                currency: tx.currency,
                from: tx.from,
                to: tx.to,
                timestamp: tx.timestamp,
                reference: tx.reference,
                notes: tx.notes,
            });
        },
        [navigation],
    );

    const renderItem = useCallback(
        ({ item: tx }: { item: Transaction }) => (
            <TransactionRow
                type={tx.type}
                from={tx.from}
                to={tx.to}
                amount={tx.amount}
                currency={tx.currency}
                timestamp={tx.timestamp}
                status={tx.status}
                isHidden={false}
                onPress={() => handlePressTransaction(tx)}
            />
        ),
        [handlePressTransaction],
    );

    const listEmptyComponent = useMemo(() => {
        if (transactions.isPending) {
            return (
                <View style={styles.loadingState}>
                    <TransactionListSkeleton rows={6} />
                </View>
            );
        }

        if (transactions.isError) {
            return (
                <ErrorState
                    title="Unable to load transactions"
                    description="Pull to refresh or try again to get the latest activity."
                    onAction={handleRefresh}
                    style={styles.stateBlock}
                />
            );
        }

        return (
            <EmptyState
                title="No transactions yet"
                description="Your latest wallet activity will appear here as soon as it happens."
                imageSource={EMPTY_STATE_IMAGE}
                style={styles.stateBlock}
                actionLabel="Send money"
                onAction={goToSend}
            />
        );
    }, [goToSend, handleRefresh, transactions.isError, transactions.isPending]);

    const listFooterComponent = useMemo(() => {
        if (transactions.isFetchingNextPage) {
            return (
                <View style={styles.footerLoading}>
                    <TransactionListSkeleton rows={2} />
                </View>
            );
        }

        if (hasMore) {
            return (
                <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore} activeOpacity={0.7}>
                    <Text style={styles.loadMoreText}>Load more</Text>
                </TouchableOpacity>
            );
        }

        return <View style={styles.listEndSpacer} />;
    }, [hasMore, loadMore, transactions.isFetchingNextPage]);

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <ScreenHeader title="All Transactions" onBackPress={() => navigation.goBack()} />

            {/* Sort / Filter Controls */}
            <View style={styles.sortRow}>
                <TouchableOpacity style={styles.sortBtn} activeOpacity={0.6} onPress={toggleSort}>
                    <HugeiconsIcon icon={FilterHorizontalFreeIcons} size={18} color="rgba(0,0,0,0.20)" />
                    <Text style={styles.sortText}>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sortBtn} activeOpacity={0.6} onPress={cycleType}>
                    <Text style={styles.sortText}>
                        {typeFilter === 'all' ? 'All' : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1).replace('_', ' ')}
                    </Text>
                    <HugeiconsIcon icon={ArrowDown01FreeIcons} size={14} color="rgba(0,0,0,0.20)" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={sorted}
                keyExtractor={(item, index) => (item.id ? String(item.id) : `tx-${index}`)}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                initialNumToRender={14}
                maxToRenderPerBatch={12}
                windowSize={9}
                removeClippedSubviews={Platform.OS === 'android'}
                refreshControl={
                    <RefreshControl
                        refreshing={transactions.isRefetching}
                        onRefresh={handleRefresh}
                    />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={listEmptyComponent}
                ListFooterComponent={listFooterComponent}
                renderItem={renderItem}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },
    sortRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 12,
    },
    sortBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    sortText: {
        fontSize: 12,
        fontWeight: '500',
        color: 'rgba(0,0,0,0.20)',
        lineHeight: 18,
    },
    listContent: {
        paddingHorizontal: 15,
        paddingBottom: spacing.huge,
    },
    separator: {
        height: 28,
    },
    emptyState: {
        paddingVertical: 80,
        alignItems: 'center',
        gap: 16,
    },
    stateBlock: {
        paddingVertical: spacing.massive,
    },
    loadingState: {
        paddingTop: spacing.md,
        gap: spacing.lg,
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
    loadMoreBtn: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    loadMoreText: {
        ...typography.bodyMd,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    footerLoading: {
        paddingTop: spacing.base,
        gap: spacing.lg,
    },
    listEndSpacer: {
        height: spacing.lg,
    },
});
