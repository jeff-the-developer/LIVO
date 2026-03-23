import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowRight01FreeIcons } from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { ui } from '@theme/ui';
import { hapticLight } from '@utils/haptics';

interface SelectFieldProps {
    value?: string;
    placeholder: string;
    onPress?: () => void;
    leftAdornment?: React.ReactNode;
    rightAdornment?: React.ReactNode;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
}

export default function SelectField({
    value,
    placeholder,
    onPress,
    leftAdornment,
    rightAdornment,
    disabled = false,
    style,
}: SelectFieldProps): React.ReactElement {
    return (
        <Pressable
            onPressIn={() => {
                if (!disabled) hapticLight();
            }}
            style={({ pressed }) => [
                styles.container,
                disabled && styles.disabled,
                pressed && !disabled && styles.pressed,
                pressed && !disabled && styles.pressedTransform,
                style,
            ]}
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={value || placeholder}
        >
            <View style={styles.leading}>
                {leftAdornment}
                <Text style={value ? styles.value : styles.placeholder} numberOfLines={1}>
                    {value || placeholder}
                </Text>
            </View>
            {rightAdornment ?? (
                <HugeiconsIcon
                    icon={ArrowRight01FreeIcons}
                    size={ui.iconSize.md}
                    color={colors.textMuted}
                />
            )}
        </Pressable>
    );
}

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
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    disabled: {
        opacity: 0.5,
    },
    pressed: {
        backgroundColor: colors.surface,
    },
    pressedTransform: {
        transform: [{ scale: 0.996 }],
    },
    leading: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    placeholder: {
        ...typography.bodyMd,
        color: colors.textMuted,
        flex: 1,
    },
    value: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        flex: 1,
    },
});
