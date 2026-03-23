import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
    type GestureResponderEvent,
    type StyleProp,
    type TextStyle,
    type ViewStyle,
} from 'react-native';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { ui } from '@theme/ui';
import { hapticLight } from '@utils/haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface ButtonProps {
    label: string;
    onPress?: (event: GestureResponderEvent) => void;
    variant?: ButtonVariant;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    leftAdornment?: React.ReactNode;
    rightAdornment?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    testID?: string;
    accessibilityLabel?: string;
    /** Light haptic on press in (default true for primary affordances) */
    sensoryFeedback?: boolean;
}

export default function Button({
    label,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
    fullWidth = true,
    leftAdornment,
    rightAdornment,
    style,
    textStyle,
    testID,
    accessibilityLabel,
    sensoryFeedback = true,
}: ButtonProps): React.ReactElement {
    const isDisabled = disabled || loading;

    return (
        <Pressable
            onPressIn={() => {
                if (!isDisabled && sensoryFeedback) hapticLight();
            }}
            style={({ pressed }) => [
                styles.base,
                fullWidth && styles.fullWidth,
                variantStyles[variant].container,
                isDisabled && styles.disabled,
                pressed && !isDisabled && styles.pressed,
                style,
            ]}
            onPress={onPress}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? label}
            testID={testID}
        >
            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator color={variantStyles[variant].activityColor} />
                ) : (
                    <>
                        {leftAdornment ? <View style={styles.adornment}>{leftAdornment}</View> : null}
                        <Text style={[styles.label, variantStyles[variant].text, textStyle]}>{label}</Text>
                        {rightAdornment ? <View style={styles.adornment}>{rightAdornment}</View> : null}
                    </>
                )}
            </View>
        </Pressable>
    );
}

const variantStyles = {
    primary: StyleSheet.create({
        container: {
            backgroundColor: colors.buttonPrimary,
        },
        text: {
            color: colors.buttonText,
        },
        activityColor: colors.buttonText,
    }),
    secondary: StyleSheet.create({
        container: {
            backgroundColor: colors.surfaceAlt,
        },
        text: {
            color: colors.textPrimary,
        },
        activityColor: colors.textPrimary,
    }),
    outline: StyleSheet.create({
        container: {
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
        },
        text: {
            color: colors.textPrimary,
        },
        activityColor: colors.textPrimary,
    }),
    ghost: StyleSheet.create({
        container: {
            backgroundColor: 'transparent',
        },
        text: {
            color: colors.textPrimary,
        },
        activityColor: colors.textPrimary,
    }),
} as const;

const styles = StyleSheet.create({
    base: {
        minHeight: ui.buttonHeight,
        paddingHorizontal: spacing.base,
        borderRadius: ui.radius.pill,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullWidth: {
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    adornment: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        ...typography.bodyMd,
        fontWeight: '500',
        textAlign: 'center',
    },
    disabled: {
        opacity: 0.5,
    },
    pressed: {
        opacity: 0.92,
        transform: [{ scale: 0.99 }],
    },
});
