import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
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
import { useSessions, useTerminateSession, handleApiError } from '@hooks/api/useProfile';
import type { SessionInfo } from '@api/user';

type Nav = NativeStackNavigationProp<AppStackParamList>;

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).replace(',', '');
}

// ─── Session Card ─────────────────────────────────────────────────────────────
function SessionCard({ session, onTerminate, terminating }: {
    session: SessionInfo;
    onTerminate?: () => void;
    terminating?: boolean;
}): React.ReactElement {
    return (
        <>
            <Text style={s.deviceName}>{session.device || 'Unknown Device'}</Text>
            <View style={s.card}>
                <View style={s.cardRow}>
                    <Text style={s.cardLabel}>Date</Text>
                    <Text style={s.cardValue}>{formatDate(session.date)}</Text>
                </View>
                <View style={s.cardDivider} />
                <View style={s.cardRow}>
                    <Text style={s.cardLabel}>Location</Text>
                    <Text style={s.cardValue}>{session.location || '—'}</Text>
                </View>
                <View style={s.cardDivider} />
                <View style={s.cardRow}>
                    <Text style={s.cardLabel}>IP Address</Text>
                    <Text style={s.cardValue}>{session.ip || '—'}</Text>
                </View>
            </View>
            {onTerminate && (
                <TouchableOpacity
                    style={s.terminateBtn}
                    onPress={onTerminate}
                    disabled={terminating}
                    activeOpacity={0.7}
                    accessibilityLabel="Remove session"
                    accessibilityRole="button"
                >
                    {terminating ? (
                        <ActivityIndicator size="small" color={colors.textPrimary} />
                    ) : (
                        <Text style={s.terminateBtnText}>Remove</Text>
                    )}
                </TouchableOpacity>
            )}
        </>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MyDeviceScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const sessionsQuery = useSessions();
    const terminateMutation = useTerminateSession();

    const currentSession = sessionsQuery.data?.current_session ?? null;
    const otherSessions = sessionsQuery.data?.other_sessions ?? [];

    const onTerminate = (sessionId: string) => {
        Alert.alert('Remove Device', 'Remove this device from your account?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: () =>
                    terminateMutation.mutate(sessionId, {
                        onError: (err) =>
                            Alert.alert('Error', handleApiError(err).message),
                    }),
            },
        ]);
    };

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

                {sessionsQuery.isLoading ? (
                    <ActivityIndicator color={colors.textPrimary} style={{ marginTop: spacing.xl }} />
                ) : (
                    <>
                        {/* Current Session */}
                        <View style={s.sectionRow}>
                            <View style={s.sectionLine} />
                            <Text style={s.sectionLabel}>Current Session</Text>
                            <View style={s.sectionLine} />
                        </View>

                        {currentSession ? (
                            <SessionCard session={currentSession} />
                        ) : (
                            <Text style={s.emptyText}>No current session data</Text>
                        )}

                        {/* Other Sessions */}
                        {otherSessions.length > 0 && (
                            <>
                                <View style={[s.sectionRow, { marginTop: spacing.xl }]}>
                                    <View style={s.sectionLine} />
                                    <Text style={s.sectionLabel}>Other Sessions</Text>
                                    <View style={s.sectionLine} />
                                </View>
                                {otherSessions.map((session) => (
                                    <View key={session.id} style={{ marginBottom: spacing.lg }}>
                                        <SessionCard
                                            session={session}
                                            onTerminate={() => onTerminate(session.id)}
                                            terminating={
                                                terminateMutation.isPending &&
                                                terminateMutation.variables === session.id
                                            }
                                        />
                                    </View>
                                ))}
                            </>
                        )}
                    </>
                )}
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
                {otherSessions.length === 0 && !sessionsQuery.isLoading && (
                    <View style={s.noDeviceBtn}>
                        <Text style={s.noDeviceBtnText}>No other logged-in devices</Text>
                    </View>
                )}
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
    content: { paddingHorizontal: spacing.base, paddingBottom: spacing.base },
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
    emptyText: {
        ...typography.bodySm, color: colors.textMuted,
        textAlign: 'center', marginBottom: spacing.lg,
    },
    terminateBtn: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
        marginTop: spacing.xs,
    },
    terminateBtnText: { ...typography.bodySm, color: colors.textPrimary, fontWeight: '500' },
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
