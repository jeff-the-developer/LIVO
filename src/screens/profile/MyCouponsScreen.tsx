import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    Coupon01FreeIcons,
    GiftFreeIcons,
    CheckmarkCircle02FreeIcons,
    Time01FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import { useCoupons, handleApiError } from '@hooks/api/useCoupons';
import type { Coupon, CouponStatus } from '@api/coupons';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Tab Filters (Figma order: Active first) ─────────────────────────────────
const TABS: { key: CouponStatus | 'all'; label: string }[] = [
    { key: 'active', label: 'Active' },
    { key: 'all', label: 'All' },
    { key: 'used', label: 'Used' },
    { key: 'expired', label: 'Expired' },
];

// ─── Status Config ────────────────────────────────────────────────────────────
function getStatusConfig(status: CouponStatus) {
    switch (status) {
        case 'active':
            return {
                icon: Coupon01FreeIcons,
                color: colors.primary,
                bgColor: palette.green50,
                label: 'Active',
            };
        case 'used':
            return {
                icon: CheckmarkCircle02FreeIcons,
                color: colors.textMuted,
                bgColor: palette.gray100,
                label: 'Used',
            };
        case 'expired':
            return {
                icon: Time01FreeIcons,
                color: palette.red,
                bgColor: palette.redLight,
                label: 'Expired',
            };
    }
}

// ─── Coupon Card ──────────────────────────────────────────────────────────────
function CouponCard({ coupon }: { coupon: Coupon }): React.ReactElement {
    const config = getStatusConfig(coupon.status);
    const expiryDate = new Date(coupon.expires_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    return (
        <View style={cardStyles.card}>
            <View style={cardStyles.top}>
                <View style={[cardStyles.iconWrap, { backgroundColor: config.bgColor }]}>
                    <HugeiconsIcon icon={config.icon} size={20} color={config.color} />
                </View>
                <View style={cardStyles.content}>
                    <Text style={cardStyles.title} numberOfLines={1}>
                        {coupon.title}
                    </Text>
                    <Text style={cardStyles.description} numberOfLines={2}>
                        {coupon.description}
                    </Text>
                </View>
            </View>
            <View style={cardStyles.bottom}>
                <View style={cardStyles.meta}>
                    <Text style={cardStyles.code}>{coupon.code}</Text>
                    <Text style={cardStyles.dot}>·</Text>
                    <Text style={cardStyles.expiry}>
                        {coupon.status === 'used'
                            ? `Used ${new Date(coupon.used_at!).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`
                            : `Expires ${expiryDate}`}
                    </Text>
                </View>
                <View style={[cardStyles.badge, { backgroundColor: config.bgColor }]}>
                    <Text style={[cardStyles.badgeText, { color: config.color }]}>
                        {config.label}
                    </Text>
                </View>
            </View>
        </View>
    );
}

// ─── Coupon Ticket Graphic ────────────────────────────────────────────────────
function CouponGraphic(): React.ReactElement {
    return (
        <View style={gfx.outer}>
            {/* Ticket shape */}
            <View style={gfx.ticket}>
                {/* Left notch */}
                <View style={[gfx.notch, gfx.notchLeft]} />
                {/* Right notch */}
                <View style={[gfx.notch, gfx.notchRight]} />

                {/* Gift icon in a light circle */}
                <View style={gfx.iconCircle}>
                    <HugeiconsIcon icon={GiftFreeIcons} size={40} color="#FFFFFF" />
                </View>
            </View>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MyCouponsScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const { data: coupons, isLoading } = useCoupons();

    const [activeTab, setActiveTab] = useState<CouponStatus | 'all'>('active');

    const filtered =
        coupons?.filter((c) => (activeTab === 'all' ? true : c.status === activeTab)) ?? [];

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Go back"
                    testID="coupons-back"
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Coupons</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
                {TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                        onPress={() => setActiveTab(tab.key)}
                        activeOpacity={0.7}
                        testID={`coupons-tab-${tab.key}`}
                    >
                        <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : filtered.length === 0 ? (
                <View style={styles.emptyWrap}>
                    <View style={styles.emptyCard}>
                        <CouponGraphic />
                        <Text style={styles.emptyTitle}>No Coupons</Text>
                        <Text style={styles.emptySubtitle}>
                            Browse available coupons and apply{'\n'}them to save instantly
                        </Text>
                        <TouchableOpacity activeOpacity={0.7} testID="coupons-learn">
                            <Text style={styles.learnMore}>Learn more</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    {filtered.map((coupon) => (
                        <CouponCard key={coupon.id} coupon={coupon} />
                    ))}
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
    scroll: { paddingHorizontal: spacing.base, paddingTop: spacing.sm, gap: spacing.sm },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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

    // Tabs
    tabRow: {
        flexDirection: 'row', paddingHorizontal: spacing.base,
        gap: spacing.sm, marginBottom: spacing.lg,
    },
    tab: {
        paddingVertical: spacing.sm, paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border,
    },
    tabActive: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
    tabText: { ...typography.bodySm, color: colors.textMuted, fontWeight: '500' },
    tabTextActive: { color: colors.buttonText, fontWeight: '600' },

    // Empty
    emptyWrap: { flex: 1, paddingHorizontal: spacing.base, paddingTop: spacing.xl },
    emptyCard: {
        borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.card * 1.5,
        alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg,
    },
    emptyTitle: {
        ...typography.h3, color: colors.textPrimary, fontWeight: '800',
        marginTop: spacing.xl, marginBottom: spacing.sm,
    },
    emptySubtitle: {
        ...typography.bodySm, color: colors.textSecondary,
        textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg,
    },
    learnMore: { ...typography.bodyMd, color: colors.textPrimary, fontWeight: '700' },
});

// ─── Coupon Graphic Styles ────────────────────────────────────────────────────
const gfx = StyleSheet.create({
    outer: { alignItems: 'center' },
    ticket: {
        width: 200, height: 160, borderRadius: 24,
        backgroundColor: colors.primary,
        alignItems: 'center', justifyContent: 'center',
        overflow: 'visible',
    },
    notch: {
        position: 'absolute', width: 28, height: 28, borderRadius: 14,
        backgroundColor: colors.background, top: '50%', marginTop: -14,
    },
    notchLeft: { left: -14 },
    notchRight: { right: -14 },
    iconCircle: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center', justifyContent: 'center',
    },
});

// ─── Card Styles ──────────────────────────────────────────────────────────────
const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: colors.background, borderRadius: borderRadius.card,
        borderWidth: 1, borderColor: colors.border, padding: spacing.base,
    },
    top: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
    iconWrap: {
        width: 40, height: 40, borderRadius: borderRadius.md,
        alignItems: 'center', justifyContent: 'center',
    },
    content: { flex: 1 },
    title: { ...typography.bodyMd, color: colors.textPrimary, fontWeight: '600', marginBottom: 2 },
    description: { ...typography.bodySm, color: colors.textSecondary, lineHeight: 18 },
    bottom: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderTopWidth: 0.5, borderTopColor: colors.border, paddingTop: spacing.sm,
    },
    meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    code: { ...typography.caption, color: colors.textMuted, fontWeight: '600', letterSpacing: 0.5 },
    dot: { ...typography.caption, color: colors.textMuted },
    expiry: { ...typography.caption, color: colors.textMuted },
    badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
    badgeText: { ...typography.caption, fontWeight: '600' },
});
