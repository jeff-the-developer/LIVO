import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    ComputerIcon as ComputerFreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MyDeviceScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();

    return (
        <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    testID="device-back"
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>My Device</Text>
                <View style={s.headerSpacer} />
            </View>

            <ScrollView style={s.flex} contentContainerStyle={s.content}>
                {/* QR Scan Banner */}
                <View style={s.banner}>
                    <HugeiconsIcon icon={ComputerFreeIcons} size={80} color={colors.textPrimary} />
                    <Text style={s.bannerTitle}>Scan QRCode to connect</Text>
                    <Text style={s.bannerSubtitle}>to other portals</Text>
                </View>

                {/* Current Session Divider */}
                <View style={s.sectionRow}>
                    <View style={s.sectionLine} />
                    <Text style={s.sectionLabel}>Current Session</Text>
                    <View style={s.sectionLine} />
                </View>

                {/* Session Card */}
                <Text style={s.deviceName}>Solanamobile Seeker</Text>
                <View style={s.card}>
                    <View style={s.cardRow}>
                        <Text style={s.cardLabel}>Date</Text>
                        <Text style={s.cardValue}>2025/12/23 01:23:50</Text>
                    </View>
                    <View style={s.cardDivider} />
                    <View style={s.cardRow}>
                        <Text style={s.cardLabel}>Location</Text>
                        <Text style={s.cardValue}>addw</Text>
                    </View>
                    <View style={s.cardDivider} />
                    <View style={s.cardRow}>
                        <Text style={s.cardLabel}>IP Address</Text>
                        <Text style={s.cardValue}>94224.424</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={s.footer}>
                <TouchableOpacity
                    style={s.connectBtn}
                    activeOpacity={0.85}
                    testID="device-connect"
                    accessibilityLabel="Connect device"
                    accessibilityRole="button"
                >
                    <Text style={s.connectBtnText}>Connect</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={s.noDeviceBtn}
                    activeOpacity={0.85}
                    testID="device-none"
                    accessibilityLabel="No other logged-in devices"
                    accessibilityRole="button"
                >
                    <Text style={s.noDeviceBtnText}>No other logged-in devices</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: spacing.base, paddingHorizontal: spacing.base,
    },
    backBtn: { width: 36, alignItems: 'flex-start' },
    headerTitle: {
        flex: 1, textAlign: 'center', ...typography.h4,
        color: colors.textPrimary, fontWeight: '700',
    },
    headerSpacer: { width: 36 },
    content: { paddingHorizontal: spacing.base },
    banner: {
        backgroundColor: palette.green50, borderRadius: borderRadius.lg,
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: spacing.xl, marginBottom: spacing.lg,
    },
    bannerTitle: {
        ...typography.bodyMd, color: colors.textPrimary, fontWeight: '600',
        marginTop: spacing.sm,
    },
    bannerSubtitle: {
        ...typography.bodyMd, color: colors.textPrimary, fontWeight: '600',
    },
    sectionRow: {
        flexDirection: 'row', alignItems: 'center',
        marginBottom: spacing.lg, gap: spacing.sm,
    },
    sectionLine: { flex: 1, height: 0.5, backgroundColor: colors.border },
    sectionLabel: {
        ...typography.bodySm, color: colors.textPrimary, fontWeight: '600',
    },
    deviceName: {
        ...typography.bodySm, color: colors.textPrimary, fontWeight: '500',
        marginBottom: spacing.sm,
    },
    card: {
        borderWidth: 1, borderColor: colors.border,
        borderRadius: borderRadius.md, overflow: 'hidden',
    },
    cardRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
    },
    cardLabel: { ...typography.bodySm, color: colors.textMuted },
    cardValue: { ...typography.bodySm, color: colors.textPrimary, fontWeight: '600' },
    cardDivider: { height: 0.5, backgroundColor: colors.border },
    footer: {
        paddingHorizontal: spacing.base, paddingBottom: spacing.base,
        gap: spacing.sm,
    },
    connectBtn: {
        backgroundColor: colors.textPrimary, borderRadius: borderRadius.full,
        paddingVertical: spacing.base, alignItems: 'center',
    },
    connectBtnText: { ...typography.bodyMd, color: colors.buttonText, fontWeight: '600' },
    noDeviceBtn: {
        backgroundColor: palette.gray100, borderRadius: borderRadius.full,
        paddingVertical: spacing.base, alignItems: 'center',
    },
    noDeviceBtnText: { ...typography.bodyMd, color: colors.textPrimary, fontWeight: '600' },
});
