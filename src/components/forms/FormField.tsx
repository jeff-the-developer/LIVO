import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    type StyleProp,
    type TextStyle,
    type ViewStyle,
} from 'react-native';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';

interface FormFieldProps {
    label: string;
    error?: string;
    hint?: string;
    containerStyle?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    children: React.ReactNode;
}

export default function FormField({
    label,
    error,
    hint,
    containerStyle,
    labelStyle,
    children,
}: FormFieldProps): React.ReactElement {
    return (
        <View style={[styles.container, containerStyle]}>
            <Text style={[styles.label, labelStyle]}>{label}</Text>
            {children}
            {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.sm,
    },
    label: {
        ...typography.h4,
        color: colors.textPrimary,
    },
    hint: {
        ...typography.bodySm,
        color: colors.textSecondary,
    },
    error: {
        ...typography.bodySm,
        color: colors.error,
    },
});
