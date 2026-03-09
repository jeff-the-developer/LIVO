import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Switch,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01FreeIcons } from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import {
    useNotificationPreferences,
    useUpdateNotificationPreferences,
    handleApiError,
} from '@hooks/api/useNotifications';
import type { NotificationKey } from '@api/notifications';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Notification Items Config ────────────────────────────────────────────────
interface NotifItem {
    key: NotificationKey;
    label: string;
    subtitle: string;
}

const GENERAL_ITEMS: NotifItem[] = [
    {
        key: 'push_enabled',
        label: 'Push Notifications',
        subtitle: 'Receive push notifications on your device',
    },
];

const ALERT_ITEMS: NotifItem[] = [
    {
        key: 'transaction_alerts',
        label: 'Transaction Alerts',
        subtitle: 'Get notified for every transaction',
    },
    {
        key: 'security_alerts',
        label: 'Security Alerts',
        subtitle: 'Login attempts, password changes, etc.',
    },
    {
        key: 'price_alerts',
        label: 'Price Alerts',
        subtitle: 'Crypto price movement notifications',
    },
    {
        key: 'payment_reminders',
        label: 'Payment Reminders',
        subtitle: 'Upcoming payment due dates',
    },
];

const MARKETING_ITEMS: NotifItem[] = [
    {
        key: 'promotions',
        label: 'Promotions & Offers',
        subtitle: 'Special deals, discounts, and campaigns',
    },
    {
        key: 'newsletter',
        label: 'Newsletter',
        subtitle: 'Weekly updates and insights',
    },
];

// ─── Toggle Row ───────────────────────────────────────────────────────────────
function NotifToggle({
    item,
    value,
    onToggle,
    disabled,
    isLast,
}: {
    item: NotifItem;
    value: boolean;
    onToggle: (val: boolean) => void;
    disabled: boolean;
    isLast: boolean;
}): React.ReactElement {
    return (
        <>
            <View style={rowStyles.row}>
                <View style={rowStyles.content}>
                    <Text style={rowStyles.label}>{item.label}</Text>
                    <Text style={rowStyles.subtitle}>{item.subtitle}</Text>
                </View>
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    disabled={disabled}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.background}
                    testID={`notif-${item.key}`}
                />
            </View>
            {!isLast && (
                <View
                    style={{
                        height: 0.5,
                        backgroundColor: colors.border,
                        marginHorizontal: spacing.base,
                    }}
                />
            )}
        </>
    );
}

// ─── Section ──────────────────────────────────────────────────────────────────
function Section({
    title,
    items,
    preferences,
    onToggle,
    disabled,
}: {
    title: string;
    items: NotifItem[];
    preferences: Record<string, boolean>;
    onToggle: (key: NotificationKey, val: boolean) => void;
    disabled: boolean;
}): React.ReactElement {
    return (
        <>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.card}>
                {items.map((item, idx) => (
                    <NotifToggle
                        key={item.key}
                        item={item}
                        value={preferences[item.key] ?? false}
                        onToggle={(val) => onToggle(item.key, val)}
                        disabled={disabled}
                        isLast={idx === items.length - 1}
                    />
                ))}
            </View>
        </>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function NotificationsScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const { data: preferences, isLoading } = useNotificationPreferences();
    const updateMutation = useUpdateNotificationPreferences();

    const onToggle = (key: NotificationKey, value: boolean) => {
        updateMutation.mutate(
            { [key]: value },
            {
                onError: (err) => {
                    Alert.alert('Error', handleApiError(err).message);
                },
            },
        );
    };

    const prefs = (preferences ?? {}) as Record<string, boolean>;

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* ─── Header ──────────────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    testID="notif-back"
                >
                    <HugeiconsIcon
                        icon={ArrowLeft01FreeIcons}
                        size={24}
                        color={colors.textPrimary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={styles.headerSpacer} />
            </View>

            {isLoading ? (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    <Section
                        title="General"
                        items={GENERAL_ITEMS}
                        preferences={prefs}
                        onToggle={onToggle}
                        disabled={updateMutation.isPending}
                    />
                    <Section
                        title="Alerts"
                        items={ALERT_ITEMS}
                        preferences={prefs}
                        onToggle={onToggle}
                        disabled={updateMutation.isPending}
                    />
                    <Section
                        title="Marketing"
                        items={MARKETING_ITEMS}
                        preferences={prefs}
                        onToggle={onToggle}
                        disabled={updateMutation.isPending}
                    />

                    <View style={{ height: spacing.xxl }} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

// ─── Screen Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    scroll: { paddingBottom: spacing.base },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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

    sectionTitle: {
        ...typography.label,
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        paddingHorizontal: spacing.base,
        paddingTop: spacing.lg,
        paddingBottom: spacing.sm,
    },
    card: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.card,
        borderWidth: 1,
        borderColor: colors.border,
        marginHorizontal: spacing.base,
        overflow: 'hidden',
    },
});

// ─── Row Styles ───────────────────────────────────────────────────────────────
const rowStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: spacing.base,
    },
    content: {
        flex: 1,
        marginRight: spacing.sm,
    },
    label: {
        ...typography.bodyMd,
        color: colors.textPrimary,
    },
    subtitle: {
        ...typography.caption,
        color: colors.textMuted,
        marginTop: 2,
    },
});
