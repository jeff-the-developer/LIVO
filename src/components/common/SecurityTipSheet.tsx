import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { UserGroupFreeIcons } from '@hugeicons/core-free-icons';
import BottomSheet from '@components/common/BottomSheet';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SecurityTipSheetProps {
    /** Whether the sheet is visible */
    visible: boolean;
    /** Title text (default: "Security Tip") */
    title?: string;
    /** Description / body text */
    description: string;
    /** Label for the primary button (default: "Okay") */
    primaryLabel?: string;
    /** Label for the secondary button (default: "Cancel") */
    secondaryLabel?: string;
    /** Callback when the primary button is pressed */
    onPrimary: () => void;
    /** Callback when the secondary button is pressed or the sheet is dismissed */
    onSecondary: () => void;
    /** Test ID prefix for automated testing (default: "security-tip") */
    testIDPrefix?: string;
}

// ─── SecurityTipSheet ─────────────────────────────────────────────────────────
/**
 * A reusable bottom sheet for displaying security-related tips and warnings.
 * Shows a person icon, title, description, and two action buttons.
 */
export default function SecurityTipSheet({
    visible,
    title = 'Security Tip',
    description,
    primaryLabel = 'Okay',
    secondaryLabel = 'Cancel',
    onPrimary,
    onSecondary,
    testIDPrefix = 'security-tip',
}: SecurityTipSheetProps): React.ReactElement {
    return (
        <BottomSheet visible={visible} onClose={onSecondary}>
            <View style={styles.body}>
                <View style={styles.iconCircle}>
                    <HugeiconsIcon icon={UserGroupFreeIcons} size={24} color={colors.textPrimary} />
                </View>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.btnPrimary}
                    onPress={onPrimary}
                    activeOpacity={0.85}
                    accessibilityLabel={primaryLabel}
                    accessibilityRole="button"
                    testID={`${testIDPrefix}-primary`}
                >
                    <Text style={styles.btnPrimaryText}>{primaryLabel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.btnSecondary}
                    onPress={onSecondary}
                    activeOpacity={0.85}
                    accessibilityLabel={secondaryLabel}
                    accessibilityRole="button"
                    testID={`${testIDPrefix}-secondary`}
                >
                    <Text style={styles.btnSecondaryText}>{secondaryLabel}</Text>
                </TouchableOpacity>
            </View>
        </BottomSheet>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    body: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl,
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: palette.green50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
        fontWeight: '800',
        marginBottom: spacing.sm,
    },
    description: {
        ...typography.bodyMd,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    footer: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.base,
        gap: spacing.sm,
    },
    btnPrimary: {
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnPrimaryText: {
        ...typography.bodyMd,
        color: colors.buttonText,
        fontWeight: '700',
    },
    btnSecondary: {
        backgroundColor: palette.gray100,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnSecondaryText: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
    },
});
