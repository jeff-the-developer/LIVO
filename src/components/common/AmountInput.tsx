import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Input from './Input';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { ui } from '@theme/ui';

interface AmountInputProps {
    value: string;
    onChangeText: (value: string) => void;
    currencyLabel?: string;
    onPressCurrency?: () => void;
    placeholder?: string;
    editable?: boolean;
}

export default function AmountInput({
    value,
    onChangeText,
    currencyLabel,
    onPressCurrency,
    placeholder = '00.00',
    editable = true,
}: AmountInputProps): React.ReactElement {
    return (
        <View style={styles.row}>
            <Input
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                keyboardType="decimal-pad"
                editable={editable}
                containerStyle={styles.inputContainer}
                style={styles.input}
                accessibilityLabel="Amount"
            />
            {currencyLabel ? (
                <TouchableOpacity
                    style={styles.currency}
                    activeOpacity={0.72}
                    onPress={onPressCurrency}
                    disabled={!onPressCurrency}
                >
                    <Text style={styles.currencyCode}>{currencyLabel}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    inputContainer: {
        flex: 1,
    },
    input: {
        ...typography.amountLg,
        paddingVertical: spacing.sm,
    },
    currency: {
        minHeight: ui.inputHeight,
        paddingHorizontal: spacing.base - 2,
        borderRadius: ui.radius.field,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: spacing.xs,
    },
    currencyCode: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
    },
});
