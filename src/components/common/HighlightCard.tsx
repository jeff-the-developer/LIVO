import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';

// ─── Types ────────────────────────────────────────────────────────────────────
interface HighlightCardProps {
    /** HugeIcons icon data from @hugeicons/core-free-icons */
    icon?: Parameters<typeof HugeiconsIcon>[0]['icon'];
    /** PNG image source (takes priority over icon when provided) */
    iconImage?: ImageSourcePropType;
    /** Card title */
    title: string;
    /** Card subtitle */
    subtitle: string;
    /** Icon color override (default: primary) */
    iconColor?: string;
    /** Icon background color override */
    iconBg?: string;
    /** Custom image size override */
    iconSize?: number;
    /** Press handler */
    onPress?: () => void;
    /** Test ID for automated testing */
    testID?: string;
}

export default function HighlightCard({
    icon,
    iconImage,
    title,
    subtitle,
    iconColor = colors.primary,
    iconBg = colors.surfaceAlt,
    iconSize = 22,
    onPress,
    testID,
}: HighlightCardProps): React.ReactElement {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.6}
            accessibilityLabel={`${title}: ${subtitle}`}
            accessibilityRole="button"
            testID={testID}
        >
            <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
                {iconImage ? (
                    <Image
                        source={iconImage}
                        style={[styles.iconImage, { width: iconSize, height: iconSize }]}
                        resizeMode="contain"
                    />
                ) : icon ? (
                    <HugeiconsIcon icon={icon} size={20} color={iconColor} />
                ) : null}
            </View>
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                    {subtitle}
                </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: spacing.base,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconImage: {
        width: 22,
        height: 22,
    },
    content: {
        flex: 1,
        marginLeft: spacing.sm,
    },
    title: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    subtitle: {
        ...typography.caption,
        color: colors.textMuted,
        marginTop: 2,
    },
    chevron: {
        fontSize: 22,
        color: colors.textMuted,
        marginLeft: spacing.xs,
    },
});
