import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    InformationCircleFreeIcons,
    Calendar01FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import { useCoupons } from '@hooks/api/useCoupons';
import type { Coupon, CouponStatus } from '@api/coupons';

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Tab Filters (Figma order: Active first) ─────────────────────────────────
const TABS: { key: CouponStatus | 'all'; label: string }[] = [
    { key: 'active', label: 'Active' },
    { key: 'all', label: 'All' },
    { key: 'used', label: 'Used' },
    { key: 'expired', label: 'Expired' },
];

// ─── Coupon Card ──────────────────────────────────────────────────────────────
function CouponCard({ coupon }: { coupon: Coupon }): React.ReactElement {
    const expiryDate = new Date(coupon.expires_at).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    return (
        <View style={cardStyles.card}>
            <View style={cardStyles.content}>
                <Text style={cardStyles.title} numberOfLines={1}>Card redemption coupon</Text>
                <Text style={cardStyles.subtitle} numberOfLines={1}>{coupon.title}</Text>

                <View style={cardStyles.metaRow}>
                    <View style={cardStyles.iconCircle}>
                        <HugeiconsIcon icon={Calendar01FreeIcons} size={12} color={colors.textPrimary} />
                    </View>
                    <Text style={cardStyles.metaText}>Valid until {expiryDate}</Text>
                </View>

                <View style={cardStyles.metaRow}>
                    <View style={cardStyles.iconCircle}>
                        <HugeiconsIcon icon={InformationCircleFreeIcons} size={12} color={colors.textPrimary} />
                    </View>
                    <Text style={cardStyles.metaText}>Not transferable</Text>
                </View>
            </View>
            <View style={cardStyles.imageWrap}>
                <Image
                    source={require('@assets/images/coupons/Frame 120.png')}
                    style={cardStyles.couponImage}
                    resizeMode="contain"
                />
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
                        <Image
                            source={require('@assets/images/coupons/Frame 120.png')}
                            style={styles.emptyImage}
                            resizeMode="contain"
                        />
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
    emptyImage: {
        width: 180,
        height: 180,
        marginBottom: spacing.md,
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

// ─── Card Styles ──────────────────────────────────────────────────────────────
const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.card,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
        minHeight: 125,
        // Match Figma card shadow/elevation pattern
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    content: {
        flex: 1,
        padding: spacing.base,
        justifyContent: 'center',
    },
    title: {
        ...typography.h4,
        color: colors.textPrimary,
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        ...typography.bodyMd,
        color: colors.textPrimary,
        marginBottom: spacing.lg,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    iconCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: palette.green50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metaText: {
        ...typography.bodyMd,
        color: colors.textSecondary,
    },
    imageWrap: {
        width: 125,
        height: 125,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 0, // Align exactly at the top of the padding/container bounds
        marginRight: 16, // Adjusted slightly right for perfect balance
    },
    couponImage: {
        width: '100%',
        height: '100%',
    },
});
