import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { ui } from '@theme/ui';

interface OTPInputProps {
    digits: string[];
    activeIndex: number;
    isError?: boolean;
    dashAfter?: number;
    maskCharacter?: string;
    filledTone?: 'default' | 'success';
}

export default function OTPInput({
    digits,
    activeIndex,
    isError = false,
    dashAfter = -1,
    maskCharacter,
    filledTone = 'default',
}: OTPInputProps): React.ReactElement {
    return (
        <View style={styles.row}>
            {digits.map((digit, index) => {
                const active = index === activeIndex;
                const filled = digit !== '';
                const displayValue = filled && maskCharacter ? maskCharacter : digit;

                return (
                    <React.Fragment key={index}>
                        {dashAfter >= 0 && index === dashAfter + 1 ? <Text style={styles.dash}>-</Text> : null}
                        <View
                            style={[
                                styles.box,
                                active && !filled && styles.boxActive,
                                filled && filledTone === 'success' && !isError && styles.boxFilledSuccess,
                                isError && styles.boxError,
                            ]}
                        >
                            <Text style={[styles.digit, isError && styles.digitError]}>{displayValue}</Text>
                        </View>
                    </React.Fragment>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
    },
    box: {
        width: ui.buttonHeight - spacing.xs,
        height: ui.buttonHeight,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: ui.radius.field,
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxActive: {
        borderColor: colors.textPrimary,
        borderWidth: 2,
    },
    boxFilledSuccess: {
        backgroundColor: colors.primaryLight,
        borderColor: colors.primary,
    },
    boxError: {
        borderColor: colors.error,
    },
    digit: {
        ...typography.h3,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    digitError: {
        color: colors.error,
    },
    dash: {
        ...typography.h4,
        color: colors.textMuted,
        marginHorizontal: spacing.xs,
    },
});
