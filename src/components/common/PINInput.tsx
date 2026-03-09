import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PINInputProps {
  /** Current digit values (array of single-char strings, empty string = unfilled) */
  digits: string[];
  /** Index of the next unfilled digit (-1 if all filled) */
  activeIndex: number;
  /** Whether to show error styling (red borders/digits) */
  isError?: boolean;
  /** Number of digit boxes (default: 6) */
  length?: number;
  /** Position to insert a dash separator (e.g. 3 = after 3rd box). Set to -1 for none. */
  dashAfter?: number;
}

// ─── PINInput ─────────────────────────────────────────────────────────────────
/**
 * Displays a row of PIN digit boxes with filled, active, and error states.
 * A dash separator is shown between the two halves by default (after index 2).
 */
export default function PINInput({
  digits,
  activeIndex,
  isError = false,
  dashAfter = 2,
}: PINInputProps): React.ReactElement {
  return (
    <View
      style={styles.row}
      accessibilityLabel="PIN input"
      accessibilityRole="none"
    >
      {digits.map((d, i) => {
        const filled = d !== '';
        const active = i === activeIndex;
        return (
          <React.Fragment key={i}>
            {i === dashAfter + 1 && (
              <Text style={styles.dash}>-</Text>
            )}
            <View
              style={[
                styles.box,
                filled && !isError && styles.boxFilled,
                filled && isError && styles.boxError,
                active && !filled && !isError && styles.boxActive,
              ]}
              accessibilityLabel={`Digit ${i + 1}${filled ? ', filled' : ', empty'}`}
            >
              {filled && (
                <Text style={[styles.digit, isError && styles.digitError]}>
                  *
                </Text>
              )}
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  box: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: {
    backgroundColor: palette.green50,
    borderColor: palette.green200,
  },
  boxError: {
    backgroundColor: palette.redLight,
    borderColor: palette.red,
  },
  boxActive: {
    borderWidth: 2,
    borderColor: colors.textPrimary,
  },
  digit: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  digitError: {
    color: palette.red,
  },
  dash: {
    ...typography.h4,
    color: colors.textMuted,
    marginHorizontal: spacing.xs,
  },
});
