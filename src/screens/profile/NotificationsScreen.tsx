import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    ArrowRight01FreeIcons,
    Notification03FreeIcons,
    Mail01FreeIcons,
    Exchange01FreeIcons,
    Activity01FreeIcons,
    Settings01FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Nav Row ──────────────────────────────────────────────────────────────────
function NavRow({
    icon,
    label,
    onPress,
    testID,
}: {
    icon: Parameters<typeof HugeiconsIcon>[0]['icon'];
    label: string;
    onPress: () => void;
    testID: string;
}): React.ReactElement {
    return (
        <>
            <TouchableOpacity
                style={s.row}
                onPress={onPress}
                activeOpacity={0.7}
                testID={testID}
            >
                <View style={s.rowIconWrap}>
                    <HugeiconsIcon icon={icon} size={20} color={colors.textPrimary} />
                </View>
                <Text style={s.rowLabel}>{label}</Text>
                <HugeiconsIcon icon={ArrowRight01FreeIcons} size={18} color={colors.textMuted} />
            </TouchableOpacity>
            <View style={s.divider} />
        </>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function NotificationsScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();

    const openSystemSettings = () => {
        Linking.openSettings();
    };

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    testID="notif-back"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Notifications</Text>
                <View style={s.headerSpacer} />
            </View>

            <ScrollView
                style={s.flex}
                contentContainerStyle={s.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* ─── System Notifications Card ────────────────────── */}
                <View style={s.systemCard}>
                    <View style={s.systemCardLeft}>
                        <View style={s.bellWrap}>
                            <HugeiconsIcon
                                icon={Notification03FreeIcons}
                                size={22}
                                color={colors.primary}
                            />
                        </View>
                        <View style={s.systemCardText}>
                            <Text style={s.systemCardTitle}>App Notifications</Text>
                            <Text style={s.systemCardSubtitle}>
                                Go to system settings to turn on
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={s.goBtn}
                        onPress={openSystemSettings}
                        activeOpacity={0.85}
                        testID="notif-go-settings"
                    >
                        <Text style={s.goBtnText}>Go</Text>
                    </TouchableOpacity>
                </View>

                {/* ─── Navigation Rows ──────────────────────────────── */}
                <View style={s.group}>
                    <NavRow
                        icon={Mail01FreeIcons}
                        label="Email"
                        onPress={() => navigation.navigate('EditEmail')}
                        testID="notif-email"
                    />
                    <NavRow
                        icon={Exchange01FreeIcons}
                        label="Transactions"
                        onPress={() => navigation.navigate('NotifTransactions')}
                        testID="notif-transactions"
                    />
                    <NavRow
                        icon={Activity01FreeIcons}
                        label="Account activities"
                        onPress={() => navigation.navigate('NotifAccountActivities')}
                        testID="notif-account-activities"
                    />
                    <NavRow
                        icon={Settings01FreeIcons}
                        label="Miscellaneous"
                        onPress={() => navigation.navigate('NotifMiscellaneous')}
                        testID="notif-miscellaneous"
                    />
                </View>

                <View style={{ height: spacing.xxl }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    scroll: { paddingTop: spacing.base },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.base,
        paddingHorizontal: spacing.base,
    },
    backBtn: { width: 36, alignItems: 'flex-start' },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        ...typography.h4,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    headerSpacer: { width: 36 },

    // System card
    systemCard: {
        marginHorizontal: spacing.base,
        borderRadius: borderRadius.card,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    systemCardLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    bellWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    systemCardText: { flex: 1 },
    systemCardTitle: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    systemCardSubtitle: {
        ...typography.caption,
        color: colors.textMuted,
        marginTop: 2,
    },
    goBtn: {
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xs + 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    goBtnText: {
        ...typography.bodySm,
        color: colors.buttonText,
        fontWeight: '600',
    },

    // Nav rows
    group: {
        paddingHorizontal: spacing.base,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        gap: spacing.sm,
    },
    rowIconWrap: {
        width: 32,
        alignItems: 'center',
    },
    rowLabel: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        flex: 1,
    },
    divider: {
        height: 0.5,
        backgroundColor: colors.border,
    },
});
