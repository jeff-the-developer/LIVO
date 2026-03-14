import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { TxType, TxStatus } from '@app-types/transaction.types';

interface TransactionRowProps {
    type: TxType;
    from: string;
    to: string;
    amount: string;
    currency: string;
    timestamp: string;
    status: TxStatus;
    isHidden: boolean;
    onPress?: () => void;
}

// Determine if a transaction is "incoming" (green) or "outgoing" (red)
function isIncoming(type: TxType): boolean {
    return type === 'deposit' || type === 'card_withdraw' || type === 'earning';
}

// Badge config: letter + colors based on type
function getBadge(type: TxType): { letter: string; bg: string; color: string } {
    switch (type) {
        case 'deposit':
        case 'earning':
            return { letter: 'S', bg: '#FFF07F', color: '#242424' };
        case 'withdrawal':
        case 'transfer':
        case 'card_topup':
            return { letter: 'S', bg: '#8E7FFF', color: '#FFFFFF' };
        case 'swap':
            return { letter: 'S', bg: '#8E7FFF', color: '#FFFFFF' };
        case 'card_withdraw':
            return { letter: 'S', bg: '#FFF07F', color: '#242424' };
        default:
            return { letter: 'S', bg: '#8E7FFF', color: '#FFFFFF' };
    }
}

function formatTxDate(timestamp: string): { date: string; time: string } {
    const d = new Date(timestamp);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return { date: `${day}/${month}`, time: `${hours}:${minutes}` };
}

export default function TransactionRow({
    type,
    from,
    to,
    amount,
    currency,
    timestamp,
    status,
    isHidden,
    onPress,
}: TransactionRowProps): React.ReactElement {
    const incoming = isIncoming(type);
    const badge = getBadge(type);
    const { date, time } = formatTxDate(timestamp);

    // Use "from" field as label for incoming, "to" for outgoing
    const label = incoming ? (from || 'Deposit') : (to || 'Transfer');
    // Simplify label — show currency name or short reference
    const displayLabel = currency.length <= 5 ? `${currency.charAt(0).toUpperCase() + currency.slice(1).toLowerCase()} ${type === 'swap' ? 'Swap' : ''}`.trim() : label;

    return (
        <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6} disabled={!onPress}>
            {/* Icon circle with arrow + badge */}
            <View style={styles.iconContainer}>
                <View style={[styles.iconCircle, { backgroundColor: incoming ? '#01CA47' : 'rgba(255, 32, 32, 0.50)' }]}>
                    {/* Arrow: up-right for outgoing, down-left for incoming */}
                    <View style={[styles.arrow, incoming ? styles.arrowDown : styles.arrowUp]}>
                        <View style={[styles.arrowShaft, { backgroundColor: incoming ? '#D9F7E3' : '#F91919' }]} />
                        <View style={[
                            styles.arrowHead,
                            { borderColor: incoming ? '#D9F7E3' : '#F91919' },
                            incoming ? styles.arrowHeadDown : styles.arrowHeadUp,
                        ]} />
                    </View>
                </View>
                {/* Badge */}
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.color }]}>{badge.letter}</Text>
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <Text style={styles.name} numberOfLines={1}>{from || currency}</Text>
                    <Text style={styles.amount} numberOfLines={1}>
                        {isHidden ? '***' : amount}
                    </Text>
                </View>
                <View style={styles.bottomRow}>
                    <View style={styles.dateRow}>
                        <Text style={styles.dateText}>{date}</Text>
                        <Text style={styles.dateText}>{time}</Text>
                    </View>
                    <Text style={styles.currency}>{currency}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    // Icon
    iconContainer: {
        width: 55,
        height: 55,
        position: 'relative',
    },
    iconCircle: {
        width: 55,
        height: 55,
        borderRadius: 678,
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrow: {
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowShaft: {
        width: 2,
        height: 14,
        borderRadius: 1,
    },
    arrowHead: {
        width: 8,
        height: 8,
        borderWidth: 2,
        backgroundColor: 'transparent',
        position: 'absolute',
    },
    arrowUp: {
        transform: [{ rotate: '-45deg' }],
    },
    arrowDown: {
        transform: [{ rotate: '135deg' }],
    },
    arrowHeadUp: {
        top: 0,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
    },
    arrowHeadDown: {
        top: 0,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
    },
    // Badge
    badge: {
        width: 21,
        height: 21,
        borderRadius: 10.5,
        position: 'absolute',
        bottom: -2,
        right: -2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 21,
    },
    // Content
    content: {
        flex: 1,
        gap: 2,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 16,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 24,
        flex: 1,
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 19.2,
        textAlign: 'right',
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '400',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 24,
    },
    currency: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 24,
        textAlign: 'right',
    },
});
