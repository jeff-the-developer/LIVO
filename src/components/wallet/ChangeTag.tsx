import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { borderRadius } from '@theme/borderRadius';
import { spacing } from '@theme/spacing';

interface ChangeTagProps {
    value: string;
}

export default function ChangeTag({ value }: ChangeTagProps): React.ReactElement {
    const numericValue = parseFloat(value);
    const isPositive = numericValue >= 0;
    const displayText = isPositive ? `+${value}%` : `${value}%`;

    return (
        <View style={[styles.container, isPositive ? styles.positive : styles.negative]}>
            <Text style={[styles.text, isPositive ? styles.positiveText : styles.negativeText]}>
                {displayText}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.badge,
        alignSelf: 'flex-end',
    },
    positive: {
        backgroundColor: '#E8F9EE',
    },
    negative: {
        backgroundColor: '#FEE2E2',
    },
    text: {
        ...typography.caption,
        fontWeight: '600',
    },
    positiveText: {
        color: colors.success,
    },
    negativeText: {
        color: colors.error,
    },
});
