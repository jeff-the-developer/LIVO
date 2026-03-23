import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ViewOffIcon as ViewOffFreeIcons,
    EyeIcon as EyeFreeIcons,
} from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PasswordInputProps {
    /** Current input value */
    value: string;
    /** Called when text changes */
    onChangeText: (text: string) => void;
    /** Placeholder text */
    placeholder: string;
    /** Test ID for automated testing */
    testID: string;
    /** Accessibility label (defaults to placeholder) */
    accessibilityLabel?: string;
    onBlur?: () => void;
    hasError?: boolean;
    returnKeyType?: 'done' | 'next' | 'go' | 'search' | 'send';
    onSubmitEditing?: () => void;
}

// ─── PasswordInput ────────────────────────────────────────────────────────────
/**
 * A password text input with a visibility toggle (eye icon).
 * Uses the app's standard input styling and icon set.
 */
export default function PasswordInput({
    value,
    onChangeText,
    placeholder,
    testID,
    accessibilityLabel,
    onBlur,
    hasError = false,
    returnKeyType,
    onSubmitEditing,
}: PasswordInputProps): React.ReactElement {
    const [visible, setVisible] = useState(false);

    return (
        <View style={[styles.row, hasError && styles.rowError]}>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                onBlur={onBlur}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!visible}
                autoCapitalize="none"
                returnKeyType={returnKeyType}
                onSubmitEditing={onSubmitEditing}
                accessibilityLabel={accessibilityLabel ?? placeholder}
                testID={testID}
            />
            <TouchableOpacity
                onPress={() => setVisible(!visible)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel={visible ? 'Hide password' : 'Show password'}
                accessibilityRole="button"
                testID={`${testID}-toggle`}
            >
                <HugeiconsIcon
                    icon={visible ? EyeFreeIcons : ViewOffFreeIcons}
                    size={20}
                    color={colors.textMuted}
                />
            </TouchableOpacity>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.input,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
    },
    rowError: {
        borderColor: colors.error,
    },
    input: {
        flex: 1,
        ...typography.bodyMd,
        color: colors.textPrimary,
    },
});
