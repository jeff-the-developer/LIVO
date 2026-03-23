import { borderRadius } from './borderRadius';
import { spacing } from './spacing';
import { fontSize } from './typography';

export const ui = {
    buttonHeight: spacing.huge + spacing.xs,
    inputHeight: spacing.huge + spacing.xs,
    cardPadding: spacing.base,
    sectionSpacing: spacing.lg,
    iconSize: {
        sm: fontSize.lg,
        md: fontSize.xl,
        lg: fontSize.xxl,
    },
    radius: {
        card: borderRadius.card,
        field: borderRadius.input,
        sheet: borderRadius.xxl,
        pill: borderRadius.full,
    },
    tabBarHeight: spacing.huge + spacing.xl + spacing.base,
    /** Leading icon in compact selectors (e.g. form SelectField) */
    selectorIconSm: fontSize.lg + 2,
    /** Leading icon in bottom-sheet list rows (currency / country / asset) */
    pickerRowIcon: 40,
    /** Slightly larger icon in dedicated picker sheets */
    pickerSheetIcon: 44,
} as const;

export type UI = typeof ui;
