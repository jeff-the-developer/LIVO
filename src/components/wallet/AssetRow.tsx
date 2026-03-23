import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CurrencyIcon } from '@components/icons/CurrencyIcons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { ui } from '@theme/ui';

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
        <Pressable
            style={({ pressed }) => [
                styles.card,
                pressed && onPress && styles.cardPressed,
            ]}
            onPress={onPress}
            disabled={!onPress}
        >
            {/* Icon */}
            <View style={styles.iconWrap}>
                <CurrencyIcon symbol={symbol} size={ui.pickerRowIcon} iconUrl={iconUrl} />
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
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 78,
        borderRadius: ui.radius.card,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        paddingHorizontal: spacing.base,
        gap: spacing.sm + spacing.xs,
        backgroundColor: colors.background,
    },
    cardPressed: {
        backgroundColor: colors.surface,
        opacity: 0.96,
    },
    iconWrap: {
        width: ui.pickerRowIcon + spacing.md,
        height: ui.pickerRowIcon + spacing.md,
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
        ...typography.bodyMd,
        fontWeight: '500',
        color: colors.textPrimary,
        flex: 1,
    },
    balance: {
        fontSize: 30,
        fontWeight: '600',
        color: colors.textMuted,
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
        ...typography.bodyMd,
        fontWeight: '600',
        color: colors.textMuted,
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
        ...typography.caption,
        fontWeight: '700',
        color: colors.textMuted,
        textAlign: 'right',
    },
});
