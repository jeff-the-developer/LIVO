import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    CheckmarkCircle02FreeIcons,
    ClockFreeIcons,
    Cancel01FreeIcons,
    InformationCircleFreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';

// ─── Types ────────────────────────────────────────────────────────────────────
interface KYCStatusBannerProps {
    level: number;
    status: 'pending' | 'in_progress' | 'approved' | 'rejected';
    rejectionReason?: string;
    onPress?: () => void;
    style?: any;
    testID?: string;
}

// ─── Status Configuration ─────────────────────────────────────────────────────
const getStatusConfig = (status: KYCStatusBannerProps['status']) => {
    switch (status) {
        case 'approved':
            return {
                icon: CheckmarkCircle02FreeIcons,
                iconColor: colors.success,
                backgroundColor: palette.green50,
                borderColor: colors.success,
                title: 'Verification Complete',
                titleColor: colors.success,
                message: 'Your identity has been verified successfully',
                messageColor: colors.textSecondary,
                actionText: 'View Details',
            };
        case 'pending':
            return {
                icon: ClockFreeIcons,
                iconColor: palette.orange,
                backgroundColor: palette.orange + '15',
                borderColor: palette.orange,
                title: 'Under Review',
                titleColor: palette.orange,
                message: 'Your documents are being reviewed. This usually takes 24-48 hours.',
                messageColor: colors.textSecondary,
                actionText: 'Track Progress',
            };
        case 'in_progress':
            return {
                icon: InformationCircleFreeIcons,
                iconColor: colors.primary,
                backgroundColor: colors.primaryLight,
                borderColor: colors.primary,
                title: 'Verification in Progress',
                titleColor: colors.primary,
                message: 'Please complete all required steps to submit your verification.',
                messageColor: colors.textSecondary,
                actionText: 'Continue',
            };
        case 'rejected':
            return {
                icon: Cancel01FreeIcons,
                iconColor: colors.error,
                backgroundColor: palette.redLight,
                borderColor: colors.error,
                title: 'Verification Failed',
                titleColor: colors.error,
                message: 'Please review the feedback and resubmit your documents.',
                messageColor: colors.textSecondary,
                actionText: 'Try Again',
            };
        default:
            return {
                icon: InformationCircleFreeIcons,
                iconColor: colors.textMuted,
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
                title: 'Verification Required',
                titleColor: colors.textPrimary,
                message: 'Complete identity verification to unlock more features.',
                messageColor: colors.textSecondary,
                actionText: 'Start Now',
            };
    }
};

export default function KYCStatusBanner({
    level,
    status,
    rejectionReason,
    onPress,
    style,
    testID,
}: KYCStatusBannerProps): React.ReactElement {
    const config = getStatusConfig(status);
    const isLoading = status === 'pending';

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: config.backgroundColor,
                    borderColor: config.borderColor,
                },
                style,
            ]}
            onPress={onPress}
            activeOpacity={onPress ? 0.8 : 1}
            disabled={!onPress}
            accessibilityLabel={`KYC${level} ${config.title}`}
            accessibilityRole={onPress ? 'button' : 'text'}
            testID={testID}
        >
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color={config.iconColor} />
                    ) : (
                        <HugeiconsIcon
                            icon={config.icon}
                            size={24}
                            color={config.iconColor}
                        />
                    )}
                </View>

                <View style={styles.textContainer}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: config.titleColor }]}>
                            KYC{level} - {config.title}
                        </Text>
                        {onPress && (
                            <Text style={styles.actionText}>{config.actionText}</Text>
                        )}
                    </View>

                    <Text style={[styles.message, { color: config.messageColor }]}>
                        {rejectionReason || config.message}
                    </Text>

                    {status === 'rejected' && rejectionReason && (
                        <Text style={styles.rejectionReason}>
                            Reason: {rejectionReason}
                        </Text>
                    )}
                </View>
            </View>

            {onPress && (
                <View style={styles.chevronContainer}>
                    <Text style={styles.chevron}>›</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderRadius: borderRadius.card,
        padding: spacing.base,
        marginHorizontal: spacing.base,
        marginVertical: spacing.xs,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        marginRight: spacing.sm,
        marginTop: 2,
    },
    textContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    title: {
        ...typography.bodyMd,
        fontWeight: '700',
        flex: 1,
    },
    actionText: {
        ...typography.caption,
        color: colors.primary,
        fontWeight: '600',
    },
    message: {
        ...typography.bodySm,
        lineHeight: 18,
    },
    rejectionReason: {
        ...typography.caption,
        color: colors.error,
        fontWeight: '500',
        marginTop: spacing.xs,
        fontStyle: 'italic',
    },
    chevronContainer: {
        marginLeft: spacing.sm,
        justifyContent: 'center',
    },
    chevron: {
        fontSize: 18,
        color: colors.textMuted,
    },
});