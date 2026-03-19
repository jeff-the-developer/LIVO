import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CurrencyIcon } from '@components/icons/CurrencyIcons';

interface AssetRowProps {
    symbol: string;
    name: string;
    price: string;
    change24h: string;
    balance: string;
    usdValue: string;
    iconUrl?: string;
    isHidden: boolean;
    onPress?: () => void;
}

export default function AssetRow({
    symbol,
    name,
    price,
    change24h,
    balance,
    usdValue,
    iconUrl,
    isHidden,
    onPress,
}: AssetRowProps): React.ReactElement {
    const changeNum = parseFloat(change24h);
    const isPositive = changeNum >= 0;
    const changeDisplay = isPositive ? `+${change24h}%` : `${change24h}%`;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.6} disabled={!onPress}>
            {/* Icon */}
            <View style={styles.iconWrap}>
                <CurrencyIcon symbol={symbol} size={40} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Top row: name + balance */}
                <View style={styles.topRow}>
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                    <Text style={styles.balance} numberOfLines={1}>
                        {isHidden ? '****' : balance}
                    </Text>
                </View>

                {/* Bottom row: price + change + usd value */}
                <View style={styles.bottomRow}>
                    <View style={styles.priceChangeRow}>
                        <Text style={styles.price} numberOfLines={1}>${price}</Text>
                        <Text
                            style={[styles.change, isPositive ? styles.changePositive : styles.changeNegative]}
                            numberOfLines={1}
                        >
                            {changeDisplay}
                        </Text>
                    </View>
                    <Text style={styles.usdValue} numberOfLines={1}>
                        {isHidden ? '****' : usdValue}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 78,
        borderRadius: 13,
        borderWidth: 0.5,
        borderColor: '#E8E8E8',
        paddingHorizontal: 12,
        gap: 12,
    },
    iconWrap: {
        width: 55,
        height: 55,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    content: {
        flex: 1,
        gap: 6,
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
    balance: {
        fontSize: 30,
        fontWeight: '600',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 37.5,
        textAlign: 'right',
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    priceChangeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    price: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 24,
    },
    change: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
    },
    changePositive: {
        color: '#01CA47',
    },
    changeNegative: {
        color: '#FF5A5A',
    },
    usdValue: {
        fontSize: 14,
        fontWeight: '700',
        color: 'rgba(0, 0, 0, 0.20)',
        lineHeight: 16.8,
        textAlign: 'right',
    },
});
