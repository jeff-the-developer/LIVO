import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    Add01FreeIcons,
    ArrowDataTransferHorizontalFreeIcons,
} from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

interface BalanceCardProps {
    totalBalance: string;
    isHidden: boolean;
    onMenuPress?: () => void;
    onAddPress?: () => void;
    onSwapPress?: () => void;
    onCashBalancePress?: () => void;
}

export default function BalanceCard({
    totalBalance,
    isHidden,
    onMenuPress,
    onAddPress,
    onSwapPress,
    onCashBalancePress,
}: BalanceCardProps): React.ReactElement {
    return (
        <View style={styles.container}>
            {/* Green banner */}
            <View style={styles.greenBanner}>
                <Text style={styles.brandLivo}>LIVO</Text>
                <Text style={styles.brandPay}>pay</Text>
            </View>

            {/* White card overlapping green */}
            <View style={styles.card}>
                {/* 3-dot vertical menu */}
                <TouchableOpacity
                    onPress={onMenuPress}
                    style={styles.dotsBtn}
                    activeOpacity={0.6}
                >
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </TouchableOpacity>

                {/* Balance */}
                <View style={styles.balanceWrap}>
                    <Text style={styles.balanceText} numberOfLines={1} adjustsFontSizeToFit>
                        {isHidden ? '****' : totalBalance}
                    </Text>
                    <TouchableOpacity style={styles.cashBalanceRow} activeOpacity={0.6} onPress={onCashBalancePress}>
                        <Text style={styles.cashBalanceText}>Cash Balance</Text>
                        <Text style={styles.chevron}>&gt;</Text>
                    </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Quick Actions */}
                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionItem} onPress={onAddPress} activeOpacity={0.7}>
                        <View style={styles.actionCircle}>
                            <HugeiconsIcon icon={Add01FreeIcons} size={24} color="#242424" />
                        </View>
                        <Text style={styles.actionLabel}>Add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionItem} onPress={onSwapPress} activeOpacity={0.7}>
                        <View style={styles.actionCircle}>
                            <HugeiconsIcon icon={ArrowDataTransferHorizontalFreeIcons} size={24} color="#242424" />
                        </View>
                        <Text style={styles.actionLabel}>Swap</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 15,
    },
    // Green banner
    greenBanner: {
        backgroundColor: '#01CA47',
        borderTopLeftRadius: 21,
        borderTopRightRadius: 21,
        paddingTop: 13,
        paddingBottom: 50,
        paddingHorizontal: 30,
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    brandLivo: {
        fontSize: 14,
        fontWeight: '700',
        color: '#242424',
        letterSpacing: 0.5,
    },
    brandPay: {
        fontSize: 8.5,
        fontWeight: '400',
        color: '#242424',
        marginLeft: 1,
    },
    // White card
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 21,
        marginTop: -20,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        paddingTop: 35,
        paddingBottom: spacing.base,
    },
    // Dots menu
    dotsBtn: {
        position: 'absolute',
        top: 22,
        right: 20,
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
    // Balance
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
    cashBalanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
    },
    cashBalanceText: {
        fontSize: 16,
        fontWeight: '400',
        color: '#242424',
    },
    chevron: {
        fontSize: 14,
        color: '#242424',
        marginLeft: 2,
    },
    // Divider
    divider: {
        height: 1.5,
        backgroundColor: '#F0F0F0',
        marginTop: spacing.base,
        marginBottom: spacing.base,
    },
    // Quick actions
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 60,
        paddingVertical: spacing.sm,
    },
    actionItem: {
        alignItems: 'center',
        gap: 2,
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
        fontSize: 14,
        fontWeight: '500',
        color: '#242424',
        textAlign: 'center',
    },
});
