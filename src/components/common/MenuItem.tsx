import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MenuItemProps {
    /** HugeIcons icon data from @hugeicons/core-free-icons */
    icon: Parameters<typeof HugeiconsIcon>[0]['icon'];
    /** Menu label text */
    label: string;
    /** Optional subtitle text */
    subtitle?: string;
    /** Icon color override (default: textSecondary) */
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
                <HugeiconsIcon icon={icon} size={20} color={iconColor} />
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
