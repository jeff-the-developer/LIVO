import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MenuItemProps {
    /** HugeIcons icon data from @hugeicons/core-free-icons */
    icon?: Parameters<typeof HugeiconsIcon>[0]['icon'];
    /** Custom image icon (takes precedence over `icon`) */
    iconImage?: ImageSourcePropType;
    /** Custom image icon size (default: 24) */
    iconImageSize?: number;
    /** Menu label text */
    label: string;
    /** Optional subtitle text */
    subtitle?: string;
    /** Icon color override (default: textSecondary) — used only with HugeIcons */
    iconColor?: string;
    /** Press handler */
    onPress?: () => void;
    /** Show chevron (default: true) */
    showChevron?: boolean;
    /** Test ID for automated testing */
    testID?: string;
}

export default function MenuItem({
    icon,
    iconImage,
    iconImageSize = 24,
    label,
    subtitle,
    iconColor = colors.textSecondary,
    onPress,
    showChevron = true,
    testID,
}: MenuItemProps): React.ReactElement {
    return (
        <TouchableOpacity
            style={styles.row}
            onPress={onPress}
            activeOpacity={0.6}
            accessibilityLabel={label}
            accessibilityRole="button"
            testID={testID}
        >
            <View style={styles.iconWrap}>
                {iconImage ? (
                    <Image
                        source={iconImage}
                        style={{ width: iconImageSize, height: iconImageSize }}
                        resizeMode="contain"
                    />
                ) : icon ? (
                    <HugeiconsIcon icon={icon} size={20} color={iconColor} />
                ) : null}
            </View>
            <View style={styles.content}>
                <Text style={styles.label} numberOfLines={1}>
                    {label}
                </Text>
                {subtitle ? (
                    <Text style={styles.subtitle} numberOfLines={1}>
                        {subtitle}
                    </Text>
                ) : null}
            </View>
            {showChevron && <Text style={styles.chevron}>›</Text>}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: spacing.base,
    },
    iconWrap: {
        width: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        marginLeft: spacing.sm,
    },
    label: {
        ...typography.bodyMd,
        color: colors.textPrimary,
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
