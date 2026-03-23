import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '@app-types/navigation.types';
import { useTransactionDetail } from '@hooks/api/useTransactions';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import Card from '@components/common/Card';
import DetailRow from '@components/common/DetailRow';
import Divider from '@components/common/Divider';
import EmptyState from '@components/common/EmptyState';
import ScreenHeader from '@components/common/ScreenHeader';
import TransactionStatus from '@components/transactions/TransactionStatus';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type RouteProps = NativeStackScreenProps<AppStackParamList, 'TransactionDetail'>['route'];

function isIncoming(type: string): boolean {
    return type === 'deposit' || type === 'card_withdraw' || type === 'earning';
}

function formatDateTime(timestamp: string): string {
    const d = new Date(timestamp);
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

function getTypeLabel(type: string): string {
    switch (type) {
        case 'deposit': return 'Deposit';
        case 'withdrawal': return 'Withdrawal';
        case 'transfer': return 'Transfer';
        case 'swap': return 'Swap';
        case 'card_topup': return 'Card Top Up';
        case 'card_withdraw': return 'Card Withdrawal';
        case 'earning': return 'Earning';
        default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
}

export default function TransactionDetailScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const route = useRoute<RouteProps>();
    const params = route.params;

    // If params include full data (passed from list), use directly; otherwise fetch
    const hasInlineData = !!params.type && !!params.amount;
    const tx = useTransactionDetail(hasInlineData ? '' : params.id);

    const data = hasInlineData
        ? {
              id: params.id,
              user_id: '',
              type: params.type!,
              status: params.status ?? 'pending',
              amount: params.amount!,
              fee: params.fee ?? '0',
              currency: params.currency ?? '',
              from: params.from ?? '',
              to: params.to ?? '',
              timestamp: params.timestamp ?? '',
              reference: params.reference ?? '',
              notes: params.notes ?? '',
          }
        : tx.data ?? null;

    if (!hasInlineData && tx.isLoading) {
        return (
            <SafeAreaView style={styles.safe} edges={['top']}>
                <ScreenHeader title="Transaction" onBackPress={() => navigation.goBack()} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!data) {
        return (
            <SafeAreaView style={styles.safe} edges={['top']}>
                <ScreenHeader title="Transaction" onBackPress={() => navigation.goBack()} />
                <View style={styles.loadingContainer}>
                    <EmptyState
                        title="Transaction not found"
                        description="We could not load this activity. It may have been removed or is unavailable."
                        actionLabel="Go back"
                        onAction={() => navigation.goBack()}
                    />
                </View>
            </SafeAreaView>
        );
    }
    const incoming = isIncoming(data.type);

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <ScreenHeader title="Transaction Details" onBackPress={() => navigation.goBack()} />

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {/* Amount Section */}
                <View style={styles.amountSection}>
                    <View style={[styles.amountIcon, { backgroundColor: incoming ? colors.primaryLight : palette.redLight }]}>
                        <Text style={[styles.amountIconArrow, { color: incoming ? colors.success : colors.error }]}>
                            {incoming ? '+' : '-'}
                        </Text>
                    </View>
                    <Text style={styles.amountText}>
                        {incoming ? '+' : '-'}{data.amount ?? '0'} {data.currency || ''}
                    </Text>
                    <TransactionStatus status={data.status} />
                </View>

                {/* Details Card */}
                <Card style={styles.detailsCard}>
                    <DetailRow label="Type" value={getTypeLabel(data.type)} />
                    <Divider />
                    <DetailRow label="From" value={data.from || '-'} />
                    <Divider />
                    <DetailRow label="To" value={data.to || '-'} />
                    <Divider />
                    <DetailRow label="Amount" value={`${data.amount} ${data.currency}`} />
                    {Number.parseFloat(String(data.fee ?? '0')) > 0 && (
                        <>
                            <Divider />
                            <DetailRow label="Fee" value={`${data.fee} ${data.currency}`} />
                        </>
                    )}
                    <Divider />
                    <DetailRow label="Date" value={formatDateTime(data.timestamp)} />
                    <Divider />
                    <DetailRow label="Reference" value={data.reference} mono />
                    {data.notes ? (
                        <>
                            <Divider />
                            <DetailRow label="Notes" value={data.notes} />
                        </>
                    ) : null}
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: spacing.base, paddingBottom: spacing.huge },

    // Amount
    amountSection: { alignItems: 'center', paddingVertical: 32, gap: 16 },
    amountIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    amountIconArrow: { fontSize: 32, fontWeight: '700' },
    amountText: { ...typography.amountLg, color: colors.textPrimary },

    // Details
    detailsCard: {
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.divider,
        paddingHorizontal: spacing.lg,
        paddingVertical: 8,
    },
});
