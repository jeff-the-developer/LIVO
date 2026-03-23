import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01FreeIcons } from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import ScreenHeader from '@components/common/ScreenHeader';
import SlideToConfirm from '@components/common/SlideToConfirm';

export interface TransferConfirmationRow {
    label: string;
    value: string;
}

interface TransferAmountStepProps {
    title: string;
    onBackPress: () => void;
    displayAmount: string;
    badgeLabel: string;
    infoPrimary: string;
    infoSecondary: string;
    onKeyPress: (key: string) => void;
    onConfirm: () => void;
    sliderLabel: string;
    headerCenter?: React.ReactNode;
    /** Shown above the slider so the user sees exactly what they are authorizing */
    confirmationRows?: TransferConfirmationRow[];
    /** Fee + net outcome before slide (no redesign — clarity only) */
    feeBreakdown?: {
        rows: TransferConfirmationRow[];
        footnote?: string;
    };
}

const KEYPAD_ROWS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'back'],
] as const;

export default function TransferAmountStep({
    title,
    onBackPress,
    displayAmount,
    badgeLabel,
    infoPrimary,
    infoSecondary,
    onKeyPress,
    onConfirm,
    sliderLabel,
    headerCenter,
    confirmationRows,
    feeBreakdown,
}: TransferAmountStepProps): React.ReactElement {
    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {headerCenter ? (
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBackPress} activeOpacity={0.6} style={styles.backBtn}>
                        <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>{headerCenter}</View>
                    <View style={styles.backBtn} />
                </View>
            ) : (
                <ScreenHeader title={title} onBackPress={onBackPress} />
            )}

            <View style={styles.amountSection}>
                <Text style={styles.amountDisplay} numberOfLines={1} adjustsFontSizeToFit>
                    {displayAmount}
                </Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badgeLabel}</Text>
                </View>
            </View>

            <View style={styles.numpad}>
                {KEYPAD_ROWS.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.numpadRow}>
                        {row.map((key) => (
                            <TouchableOpacity
                                key={key}
                                style={styles.numpadKey}
                                onPress={() => onKeyPress(key)}
                                activeOpacity={0.5}
                            >
                                <Text style={styles.numpadText}>
                                    {key === 'back' ? '<' : key}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>

            <View style={styles.footer}>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoPrimary}>{infoPrimary}</Text>
                        <Text style={styles.infoSecondary}>{infoSecondary}</Text>
                    </View>
                </View>
                {confirmationRows && confirmationRows.length > 0 ? (
                    <View style={styles.confirmCard} accessible accessibilityLabel="Transfer confirmation summary">
                        <Text style={styles.confirmHeading}>You’re confirming</Text>
                        {confirmationRows.map((row) => (
                            <View key={row.label} style={styles.confirmRow}>
                                <Text style={styles.confirmLabel}>{row.label}</Text>
                                <Text style={styles.confirmValue} numberOfLines={3}>
                                    {row.value}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : null}
                {feeBreakdown && feeBreakdown.rows.length > 0 ? (
                    <View style={styles.feeCard} accessible accessibilityLabel="Fee and amount outcome">
                        <Text style={styles.feeHeading}>Costs & outcome</Text>
                        {feeBreakdown.rows.map((row) => (
                            <View key={row.label} style={styles.confirmRow}>
                                <Text style={styles.confirmLabel}>{row.label}</Text>
                                <Text style={styles.confirmValue} numberOfLines={3}>
                                    {row.value}
                                </Text>
                            </View>
                        ))}
                        {feeBreakdown.footnote ? (
                            <Text style={styles.feeFootnote}>{feeBreakdown.footnote}</Text>
                        ) : null}
                    </View>
                ) : null}
                <SlideToConfirm onConfirm={onConfirm} label={sliderLabel} />
            </View>
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
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
    },
    backBtn: {
        width: 36,
        height: 33,
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    amountSection: {
        alignItems: 'center',
        gap: spacing.base,
        paddingTop: spacing.huge,
        paddingBottom: spacing.xxl,
    },
    amountDisplay: {
        ...typography.amountHero,
        color: colors.textPrimary,
    },
    badge: {
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.sm,
        borderRadius: 999,
        backgroundColor: colors.surfaceAlt,
    },
    badgeText: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    numpad: {
        paddingHorizontal: spacing.base,
        gap: spacing.sm,
    },
    numpadRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    numpadKey: {
        width: 96,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
    },
    numpadText: {
        ...typography.h2,
        color: colors.textPrimary,
    },
    footer: {
        marginTop: 'auto',
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.base,
        paddingTop: spacing.sm,
        gap: spacing.base,
    },
    infoCard: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: 13,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.base,
    },
    infoPrimary: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    infoSecondary: {
        ...typography.bodySm,
        color: colors.textSecondary,
        textAlign: 'right',
    },
    confirmCard: {
        backgroundColor: colors.background,
        borderRadius: 13,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    confirmHeading: {
        ...typography.caption,
        fontWeight: '700',
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginBottom: spacing.xs,
    },
    confirmRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    confirmLabel: {
        ...typography.bodySm,
        color: colors.textMuted,
        minWidth: 88,
    },
    confirmValue: {
        ...typography.bodyMd,
        fontWeight: '600',
        color: colors.textPrimary,
        flex: 1,
        textAlign: 'right',
    },
    feeCard: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: 13,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    feeHeading: {
        ...typography.caption,
        fontWeight: '700',
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginBottom: spacing.xs,
    },
    feeFootnote: {
        ...typography.bodySm,
        color: colors.textMuted,
        marginTop: spacing.xs,
        lineHeight: 20,
    },
});
