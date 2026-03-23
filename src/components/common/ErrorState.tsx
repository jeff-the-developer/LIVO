import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { borderRadius } from '@theme/borderRadius';

interface ErrorStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    style?: StyleProp<ViewStyle>;
}

export default function ErrorState({
    title = 'Something went wrong',
    description = 'Try again in a moment.',
    actionLabel = 'Try again',
    onAction,
    style,
}: ErrorStateProps): React.ReactElement {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.iconWrap}>
                <Text style={styles.iconText}>!</Text>
            </View>
            <View style={styles.copy}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
            {onAction ? (
                <TouchableOpacity
                    style={styles.action}
                    activeOpacity={0.8}
                    onPress={onAction}
                >
                    <Text style={styles.actionText}>{actionLabel}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.giant,
        paddingHorizontal: spacing.xl,
        gap: spacing.base,
    },
    iconWrap: {
        width: 52,
        height: 52,
        borderRadius: borderRadius.full,
        backgroundColor: colors.errorAlt,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        ...typography.h3,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    copy: {
        alignItems: 'center',
        gap: spacing.sm,
    },
    title: {
        ...typography.h4,
        color: colors.textPrimary,
        textAlign: 'center',
    },
    description: {
        ...typography.bodyMd,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    action: {
        minHeight: 44,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm + spacing.xs,
        borderRadius: borderRadius.full,
        backgroundColor: colors.textPrimary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        ...typography.bodyMd,
        color: colors.textInverse,
        fontWeight: '600',
    },
});
