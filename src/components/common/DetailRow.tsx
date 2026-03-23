import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';

interface DetailRowProps {
    label: string;
    value: string;
    mono?: boolean;
    /** Max lines for value (receipts may need more) */
    valueNumberOfLines?: number;
}

export default function DetailRow({
    label,
    value,
    mono = false,
    valueNumberOfLines = 2,
}: DetailRowProps): React.ReactElement {
    return (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={[styles.value, mono && styles.mono]} numberOfLines={valueNumberOfLines}>
                {value}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.base,
        paddingVertical: spacing.base,
    },
    label: {
        ...typography.bodyMd,
        color: colors.textSecondary,
        flex: 1,
    },
    value: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
        textAlign: 'right',
        maxWidth: '60%',
    },
    mono: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        lineHeight: 18,
    },
});
