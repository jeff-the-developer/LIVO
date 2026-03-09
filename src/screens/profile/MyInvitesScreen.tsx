import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
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

type Nav = NativeStackNavigationProp<AppStackParamList>;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const livoIcon = require('@assets/images/branding/logo_gradient_icon.png');

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab(): React.ReactElement {
    return (
        <View style={tabS.container}>
            <View style={tabS.row}>
                <Text style={tabS.label}>Total Transactions</Text>
                <Text style={tabS.value}>0.00 USD</Text>
            </View>
            <View style={tabS.divider} />
            <View style={tabS.row}>
                <Text style={tabS.label}>Number of Transactions</Text>
                <Text style={tabS.value}>0</Text>
            </View>
            <View style={tabS.divider} />
            <View style={tabS.row}>
                <Text style={tabS.label}>Reward Amount</Text>
                <Text style={tabS.value}>0.00 USD</Text>
            </View>
            <View style={tabS.divider} />
            <View style={tabS.row}>
                <Text style={tabS.label}>Total Users Invited</Text>
                <Text style={tabS.value}>0</Text>
            </View>
        </View>
    );
}

// ─── Invited Users Tab ────────────────────────────────────────────────────────
function InvitedUsersTab(): React.ReactElement {
    return (
        <View style={emptyS.container}>
            <Image source={livoIcon} style={emptyS.logo} resizeMode="contain" />
            <Text style={emptyS.text}>No Records</Text>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MyInvitesScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const [activeTab, setActiveTab] = useState<'overview' | 'invited'>('overview');

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back" testID="my-invites-back">
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>My Invites</Text>
                <View style={s.headerSpacer} />
            </View>

            {/* Tabs */}
            <View style={s.tabs}>
                <TouchableOpacity
                    style={[s.tab, activeTab === 'overview' && s.tabActive]}
                    onPress={() => setActiveTab('overview')}
                    activeOpacity={0.7} testID="tab-overview">
                    <Text style={[s.tabText, activeTab === 'overview' && s.tabTextActive]}>Overview</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[s.tab, activeTab === 'invited' && s.tabActive]}
                    onPress={() => setActiveTab('invited')}
                    activeOpacity={0.7} testID="tab-invited">
                    <Text style={[s.tabText, activeTab === 'invited' && s.tabTextActive]}>Invited Users</Text>
                </TouchableOpacity>
            </View>

            {/* Tab Content */}
            {activeTab === 'overview' ? <OverviewTab /> : <InvitedUsersTab />}
        </SafeAreaView>
    );
}

// ─── Screen Styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.base, paddingHorizontal: spacing.base },
    backBtn: { width: 36, alignItems: 'flex-start' },
    headerTitle: { flex: 1, textAlign: 'center', ...typography.h4, color: colors.textPrimary, fontWeight: '700' },
    headerSpacer: { width: 36 },

    tabs: {
        flexDirection: 'row', marginHorizontal: spacing.base,
        marginBottom: spacing.lg, gap: spacing.sm,
    },
    tab: {
        flex: 1, paddingVertical: spacing.md,
        borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border,
        alignItems: 'center', justifyContent: 'center',
    },
    tabActive: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
    tabText: { ...typography.bodySm, color: colors.textMuted, fontWeight: '500' },
    tabTextActive: { color: colors.buttonText, fontWeight: '600' },
});

// ─── Overview Tab Styles ──────────────────────────────────────────────────────
const tabS = StyleSheet.create({
    container: { paddingHorizontal: spacing.base },
    row: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: spacing.md,
    },
    label: { ...typography.bodyMd, color: colors.textPrimary },
    value: { ...typography.bodyMd, color: colors.textPrimary, fontWeight: '700' },
    divider: { height: 0.5, backgroundColor: colors.border },
});

// ─── Empty State Styles ───────────────────────────────────────────────────────
const emptyS = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
    logo: { width: 80, height: 80, marginBottom: spacing.base },
    text: { ...typography.bodyMd, color: colors.textSecondary },
});
