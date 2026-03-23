import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    type ImageSourcePropType,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { borderRadius } from '@theme/borderRadius';

interface EmptyStateProps {
    title: string;
    description?: string;
    imageSource?: ImageSourcePropType;
    actionLabel?: string;
    onAction?: () => void;
    style?: StyleProp<ViewStyle>;
}

export default function EmptyState({
    title,
    description,
    imageSource,
    actionLabel,
    onAction,
    style,
}: EmptyStateProps): React.ReactElement {
    return (
        <View style={[styles.container, style]}>
            {imageSource ? (
                <Image
                    source={imageSource}
                    style={styles.image}
                    resizeMode="contain"
                />
            ) : null}
            <View style={styles.copy}>
                <Text style={styles.title}>{title}</Text>
                {description ? (
                    <Text style={styles.description}>{description}</Text>
                ) : null}
            </View>
            {actionLabel && onAction ? (
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
    image: {
        width: 88,
        height: 88,
        borderRadius: borderRadius.card,
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
