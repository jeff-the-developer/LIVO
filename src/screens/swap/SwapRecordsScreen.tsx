import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01FreeIcons } from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import type { AppStackParamList } from '@app-types/navigation.types';
import { useTransactions } from '@hooks/api/useTransactions';
import TransactionRow from '@components/transactions/TransactionRow';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function SwapRecordsScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const swaps = useTransactions({ type: 'swap', page: 1, limit: 50 });

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.6} style={styles.backBtn}>
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Swap Records</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={swaps.isRefetching} onRefresh={() => swaps.refetch()} />
                }
            >
                {swaps.data?.transactions?.length ? (
                    swaps.data.transactions.map((tx) => (
                        <TransactionRow
                            key={tx.id}
                            type={tx.type}
                            from={tx.from}
                            to={tx.to}
                            amount={tx.amount}
                            currency={tx.currency}
                            timestamp={tx.timestamp}
                            status={tx.status}
                            isHidden={false}
                            onPress={() => navigation.navigate('TransactionDetail', {
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
                            })}
                        />
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Image
                            source={require('@assets/images/branding/logo_gradient_icon.png')}
                            style={styles.emptyIcon}
                            resizeMode="contain"
                        />
                        <Text style={styles.emptyText}>
                            {swaps.isLoading ? 'Loading...' : 'No Records'}
                        </Text>
                    </View>
                )}
            </ScrollView>
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
    content: {
        paddingHorizontal: 15,
        paddingTop: 10,
        gap: 30,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 80,
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
        color: '#242424',
        lineHeight: 24,
    },
});
