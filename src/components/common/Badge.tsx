import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { ui } from '@theme/ui';

export type BadgeTone = 'neutral' | 'success' | 'error' | 'warning' | 'info' | 'primary';

interface BadgeProps {
    label: string;
    tone?: BadgeTone;
    style?: StyleProp<ViewStyle>;
}

export default function Badge({
    label,
    tone = 'neutral',
    style,
}: BadgeProps): React.ReactElement {
    return (
        <View style={[styles.base, toneStyles[tone].container, style]}>
            <Text style={[styles.label, toneStyles[tone].text]}>{label}</Text>
        </View>
    );
}

const toneStyles = {
    neutral: StyleSheet.create({
        container: { backgroundColor: colors.surfaceAlt },
        text: { color: colors.textPrimary },
    }),
    success: StyleSheet.create({
        container: { backgroundColor: palette.green50 },
        text: { color: colors.success },
    }),
    error: StyleSheet.create({
        container: { backgroundColor: palette.redLight },
        text: { color: colors.error },
    }),
    warning: StyleSheet.create({
        container: { backgroundColor: '#FFF4E5' },
        text: { color: colors.warning },
    }),
    info: StyleSheet.create({
        container: { backgroundColor: '#EAF2FF' },
        text: { color: colors.info },
    }),
    primary: StyleSheet.create({
        container: { backgroundColor: colors.buttonPrimary },
        text: { color: colors.textInverse },
    }),
} as const;

const styles = StyleSheet.create({
    base: {
        minHeight: 28,
        borderRadius: ui.radius.pill,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
    },
    label: {
        ...typography.bodySm,
        fontWeight: '600',
    },
});
