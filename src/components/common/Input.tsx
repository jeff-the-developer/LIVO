import React, { forwardRef, useState } from 'react';
import {
    StyleSheet,
    TextInput,
    View,
    type TextInputProps,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { ui } from '@theme/ui';

interface InputProps extends TextInputProps {
    leftAdornment?: React.ReactNode;
    rightAdornment?: React.ReactNode;
    hasError?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
}

// Avoid `forwardRef<TextInput, Props>` — Metro/Babel can parse `<` as JSX and break the module.
const Input = forwardRef(function Input(
    {
        leftAdornment,
        rightAdornment,
        hasError = false,
        style,
        containerStyle,
        placeholderTextColor = colors.textMuted,
        onFocus,
        onBlur,
        ...props
    }: InputProps,
    ref: React.Ref<TextInput>,
): React.ReactElement {
    const [focused, setFocused] = useState(false);

    return (
        <View
            style={[
                styles.container,
                focused && !hasError && styles.containerFocused,
                hasError && styles.containerError,
                containerStyle,
            ]}
        >
            {leftAdornment ? <View style={styles.adornment}>{leftAdornment}</View> : null}
            <TextInput
                ref={ref}
                style={[styles.input, style]}
                placeholderTextColor={placeholderTextColor}
                onFocus={(event) => {
                    setFocused(true);
                    onFocus?.(event);
                }}
                onBlur={(event) => {
                    setFocused(false);
                    onBlur?.(event);
                }}
                {...props}
            />
            {rightAdornment ? <View style={styles.adornment}>{rightAdornment}</View> : null}
        </View>
    );
});

export default Input;

const styles = StyleSheet.create({
    container: {
        minHeight: ui.inputHeight,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: ui.radius.field,
        backgroundColor: colors.inputBackground,
        paddingHorizontal: spacing.base - 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    containerError: {
        borderColor: colors.error,
    },
    containerFocused: {
        borderColor: colors.borderFocused,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 2,
    },
    adornment: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        ...typography.bodyMd,
        color: colors.textPrimary,
        paddingVertical: spacing.sm + spacing.xs,
    },
});
