import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';

interface QuickActionProps {
    icon: Parameters<typeof HugeiconsIcon>[0]['icon'];
    label: string;
    onPress: () => void;
}

export default function QuickAction({ icon, label, onPress }: QuickActionProps): React.ReactElement {
    return (
        <TouchableOpacity style={styles.wrapper} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.circle}>
                <HugeiconsIcon icon={icon} size={22} color={colors.textPrimary} />
            </View>
            <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        gap: spacing.sm,
    },
    circle: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '500',
    },
});
