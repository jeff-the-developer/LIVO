import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    Alert02FreeIcons,
    CancelCircleFreeIcons,
    CheckmarkCircle02FreeIcons,
    Notification03FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';

type SheetStateTone = 'success' | 'error' | 'info' | 'warning';

interface SheetStateBlockProps {
    tone: SheetStateTone;
    title: string;
    description?: string;
}

const toneConfig = {
    success: {
        icon: CheckmarkCircle02FreeIcons,
        iconColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
    error: {
        icon: CancelCircleFreeIcons,
        iconColor: colors.error,
        backgroundColor: palette.redLight,
    },
    info: {
        icon: Notification03FreeIcons,
        iconColor: colors.textPrimary,
        backgroundColor: colors.surfaceAlt,
    },
    warning: {
        icon: Alert02FreeIcons,
        iconColor: colors.warning,
        backgroundColor: '#FFF4E5',
    },
} as const;

export default function SheetStateBlock({
    tone,
    title,
    description,
}: SheetStateBlockProps): React.ReactElement {
    const config = toneConfig[tone];

    return (
        <View style={styles.container}>
            <View style={[styles.iconCircle, { backgroundColor: config.backgroundColor }]}>
                <HugeiconsIcon icon={config.icon} size={28} color={config.iconColor} />
            </View>
            <Text style={styles.title}>{title}</Text>
            {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: spacing.base,
        paddingBottom: spacing.base,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
        fontWeight: '800',
        textAlign: 'center',
    },
    description: {
        ...typography.bodyMd,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
});
