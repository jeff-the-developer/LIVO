import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
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

export default function GiftsHistoryScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const gifts = useTransactions({ type: 'transfer', page: 1, limit: 50 });

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.6} style={styles.backBtn}>
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Gifts</Text>
                    <Text style={styles.headerSubtitle} numberOfLines={2}>
                        Peer transfers — not limited to gifts until gifting is available.
                    </Text>
                </View>
                <View style={styles.backBtn} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={gifts.isRefetching} onRefresh={() => gifts.refetch()} />
                }
            >
                {gifts.data?.transactions?.length ? (
                    gifts.data.transactions.map((tx) => (
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
                            {gifts.isLoading ? 'Loading...' : 'No Records'}
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
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 24,
    },
    headerSubtitle: {
        fontSize: 11,
        fontWeight: '400',
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 15,
        marginTop: 2,
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
