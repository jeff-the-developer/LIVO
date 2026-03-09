import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01FreeIcons } from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type Tab = 'login' | 'security';

/** A single activity log entry */
interface ActivityEntry {
    /** Unique identifier */
    id: string;
    /** Device or action category name */
    category: string;
    /** Formatted date string */
    date: string;
    /** Location label */
    location: string;
    /** Client IP address */
    ipAddress: string;
    /** Device name (security tab only) */
    device?: string;
}

const LOGIN_DATA: ActivityEntry[] = [
    { id: '1', category: 'Solanamobile Seeker', date: '2025/12/23 01:23:50', location: 'addw', ipAddress: '94224.424' },
    { id: '2', category: 'Solanamobile Seeker', date: '2025/12/23 01:23:50', location: 'addw', ipAddress: '94224.424' },
];

const SECURITY_DATA: ActivityEntry[] = [
    { id: '1', category: 'SecurityKey', date: '2025/12/23 01:23:50', location: 'addw', ipAddress: '94224.424', device: 'Solanamobile Seeker' },
    { id: '2', category: 'Authenticator', date: '2025/12/23 01:23:50', location: 'addw', ipAddress: '94224.424', device: 'Solanamobile Seeker' },
    { id: '3', category: 'SecurityKey', date: '2025/12/23 01:23:50', location: 'addw', ipAddress: '94224.424' },
];

// ─── Activity Card ────────────────────────────────────────────────────────────
function ActivityCard({ entry, showDevice }: { entry: ActivityEntry; showDevice?: boolean }): React.ReactElement {
    return (
        <View style={card.wrap} accessibilityLabel={`Activity: ${entry.category}`}>
            <Text style={card.category}>{entry.category}</Text>
            <View style={card.container}>
                <View style={card.row}>
                    <Text style={card.label}>Date</Text>
                    <Text style={card.value}>{entry.date}</Text>
                </View>
                <View style={card.divider} />
                <View style={card.row}>
                    <Text style={card.label}>Location</Text>
                    <Text style={card.value}>{entry.location}</Text>
                </View>
                <View style={card.divider} />
                <View style={card.row}>
                    <Text style={card.label}>IP Address</Text>
                    <Text style={card.value}>{entry.ipAddress}</Text>
                </View>
                {showDevice && entry.device && (
                    <>
                        <View style={card.divider} />
                        <View style={card.row}>
                            <Text style={card.label}>Device</Text>
                            <Text style={card.value}>{entry.device}</Text>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MyActivityScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const [tab, setTab] = useState<Tab>('login');

    const data = tab === 'login' ? LOGIN_DATA : SECURITY_DATA;

    return (
        <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    testID="activity-back"
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>My Activity</Text>
                <View style={s.headerSpacer} />
            </View>

            {/* Tabs */}
            <View style={s.tabs}>
                <TouchableOpacity
                    style={[s.tab, tab === 'login' && s.tabActive]}
                    onPress={() => setTab('login')}
                    activeOpacity={0.8}
                    testID="activity-tab-login"
                    accessibilityLabel="Account Login tab"
                    accessibilityRole="tab"
                >
                    <Text style={[s.tabText, tab === 'login' && s.tabTextActive]}>Account Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[s.tab, tab === 'security' && s.tabActive]}
                    onPress={() => setTab('security')}
                    activeOpacity={0.8}
                    testID="activity-tab-security"
                    accessibilityLabel="Security Settings tab"
                    accessibilityRole="tab"
                >
                    <Text style={[s.tabText, tab === 'security' && s.tabTextActive]}>Security Settings</Text>
                </TouchableOpacity>
            </View>

            {/* Activity List */}
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                contentContainerStyle={s.list}
                renderItem={({ item }) => (
                    <ActivityCard entry={item} showDevice={tab === 'security'} />
                )}
            />
        </SafeAreaView>
    );
}

// ─── Screen Styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
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
    tabs: {
        flexDirection: 'row', paddingHorizontal: spacing.base,
        gap: spacing.sm, marginBottom: spacing.lg,
    },
    tab: {
        paddingVertical: spacing.sm, paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.full, borderWidth: 1,
        borderColor: colors.border,
    },
    tabActive: {
        backgroundColor: colors.textPrimary, borderColor: colors.textPrimary,
    },
    tabText: { ...typography.bodySm, color: colors.textMuted, fontWeight: '500' },
    tabTextActive: { color: colors.buttonText },
    list: { paddingHorizontal: spacing.base, paddingBottom: spacing.xl },
});

// ─── Card Styles ──────────────────────────────────────────────────────────────
const card = StyleSheet.create({
    wrap: { marginBottom: spacing.lg },
    category: {
        ...typography.bodySm, color: colors.textPrimary, fontWeight: '500',
        marginBottom: spacing.sm,
    },
    container: {
        borderWidth: 1, borderColor: colors.border,
        borderRadius: borderRadius.md, overflow: 'hidden',
    },
    row: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
    },
    label: { ...typography.bodySm, color: colors.textMuted },
    value: { ...typography.bodySm, color: colors.textPrimary, fontWeight: '600' },
    divider: { height: 0.5, backgroundColor: colors.border },
});
