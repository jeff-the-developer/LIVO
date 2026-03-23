import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01FreeIcons,
    Calendar03FreeIcons,
    UserGroupFreeIcons,
    Gif01FreeIcons,
} from '@hugeicons/core-free-icons';
import { colors, palette } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { borderRadius } from '@theme/borderRadius';
import { typography } from '@theme/typography';
import type { AppStackParamList } from '@app-types/navigation.types';
import { useEvents } from '@hooks/api/useEvents';
import type { AppEvent, EventStatus, EventCategory } from '@api/events';
import StatusBadge from '@components/common/StatusBadge';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const livoIcon = require('@assets/images/branding/logo_gradient_icon.png');

type Nav = NativeStackNavigationProp<AppStackParamList>;

// ─── Tab Filters ──────────────────────────────────────────────────────────────
const TABS: { key: EventStatus | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'live', label: '🔴 Live' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'ended', label: 'Past' },
];

// ─── Category Config ──────────────────────────────────────────────────────────
function getCategoryConfig(category: EventCategory) {
    switch (category) {
        case 'promotion':
            return { color: colors.primary, bgColor: palette.green50, label: 'Promotion' };
        case 'airdrop':
            return { color: palette.orange, bgColor: palette.orange + '20', label: 'Airdrop' };
        case 'community':
            return { color: palette.blue, bgColor: palette.blue + '20', label: 'Community' };
        case 'webinar':
            return { color: palette.blue, bgColor: palette.blue + '20', label: 'Webinar' };
        case 'challenge':
            return { color: palette.red, bgColor: palette.redLight, label: 'Challenge' };
    }
}

function getEventStatusTone(status: EventStatus) {
    switch (status) {
        case 'live':
            return 'error' as const;
        case 'upcoming':
            return 'success' as const;
        case 'ended':
            return 'neutral' as const;
    }
}

// ─── Format Date ──────────────────────────────────────────────────────────────
function formatEventDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event }: { event: AppEvent }): React.ReactElement {
    const catConfig = getCategoryConfig(event.category);

    const onCTA = () => {
        if (event.cta_url) {
            Linking.openURL(event.cta_url).catch(() =>
                Alert.alert('Error', 'Unable to open link'),
            );
        } else {
            Alert.alert(event.title, event.description);
        }
    };

    return (
        <View style={cardStyles.card}>
            {/* Category + Status Row */}
            <View style={cardStyles.tagRow}>
                <View style={[cardStyles.tag, { backgroundColor: catConfig.bgColor }]}>
                    <Text style={[cardStyles.tagText, { color: catConfig.color }]}>
                        {catConfig.label}
                    </Text>
                </View>
                <StatusBadge
                    label={event.status === 'ended' ? 'Ended' : event.status === 'live' ? 'Live' : 'Upcoming'}
                    tone={getEventStatusTone(event.status)}
                />
            </View>

            {/* Title + Description */}
            <Text style={cardStyles.title}>{event.title}</Text>
            <Text style={cardStyles.description} numberOfLines={3}>
                {event.description}
            </Text>

            {/* Meta Row */}
            <View style={cardStyles.metaRow}>
                <View style={cardStyles.metaItem}>
                    <HugeiconsIcon
                        icon={Calendar03FreeIcons}
                        size={14}
                        color={colors.textMuted}
                    />
                    <Text style={cardStyles.metaText}>
                        {formatEventDate(event.starts_at)}
                        {event.ends_at !== event.starts_at &&
                            ` — ${formatEventDate(event.ends_at)}`}
                    </Text>
                </View>
                {event.participants_count != null && (
                    <View style={cardStyles.metaItem}>
                        <HugeiconsIcon
                            icon={UserGroupFreeIcons}
                            size={14}
                            color={colors.textMuted}
                        />
                        <Text style={cardStyles.metaText}>
                            {event.participants_count.toLocaleString()}
                        </Text>
                    </View>
                )}
            </View>

            {/* Reward Chip */}
            {event.reward && (
                <View style={cardStyles.rewardChip}>
                    <HugeiconsIcon
                        icon={Gif01FreeIcons}
                        size={14}
                        color={colors.primary}
                    />
                    <Text style={cardStyles.rewardText}>{event.reward}</Text>
                </View>
            )}

            {/* CTA Button */}
            {event.cta_label && event.status !== 'ended' && (
                <TouchableOpacity
                    style={cardStyles.ctaBtn}
                    onPress={onCTA}
                    activeOpacity={0.85}
                    accessibilityLabel={event.cta_label}
                    accessibilityRole="button"
                    testID={`event-cta-${event.id}`}
                >
                    <Text style={cardStyles.ctaText}>{event.cta_label}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function EventsScreen(): React.ReactElement {
    const navigation = useNavigation<Nav>();
    const { data: events, isLoading } = useEvents();

    const [activeTab, setActiveTab] = useState<EventStatus | 'all'>('all');

    const filtered = useMemo(
        () =>
            events?.filter((e) =>
                activeTab === 'all' ? true : e.status === activeTab,
            ) ?? [],
        [events, activeTab],
    );

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
                    testID="events-back"
                >
                    <HugeiconsIcon
                        icon={ArrowLeft01FreeIcons}
                        size={24}
                        color={colors.textPrimary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Events</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* ─── Tabs ────────────────────────────────────────── */}
            <View style={styles.tabRow}>
                {TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                        onPress={() => setActiveTab(tab.key)}
                        activeOpacity={0.7}
                        accessibilityLabel={`${tab.label} events`}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: activeTab === tab.key }}
                        testID={`events-tab-${tab.key}`}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === tab.key && styles.tabTextActive,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ─── Content ─────────────────────────────────────── */}
            {isLoading ? (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : filtered.length === 0 ? (
                <View style={styles.emptyWrap}>
                    <Image source={livoIcon} style={styles.emptyIcon} resizeMode="contain" />
                    <Text style={styles.emptyTitle}>No Records</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    {filtered.map((event) => (
                        <EventCard key={event.id} event={event} />
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
    scroll: {
        paddingHorizontal: spacing.base,
        paddingTop: spacing.sm,
        gap: spacing.base,
    },
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

    // Tabs
    tabRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.base,
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    tab: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.base,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surfaceAlt,
    },
    tabActive: {
        backgroundColor: colors.buttonPrimary,
    },
    tabText: {
        ...typography.bodySm,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    tabTextActive: {
        color: colors.buttonText,
        fontWeight: '600',
    },

    // Empty
    emptyWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xxl,
    },
    emptyIcon: { width: 80, height: 80, borderRadius: 20, marginBottom: spacing.base },
    emptyTitle: {
        ...typography.bodyMd,
        color: colors.textSecondary,
    },
});

// ─── Card Styles ──────────────────────────────────────────────────────────────
const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.card,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.base,
    },
    tagRow: {
        flexDirection: 'row',
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },
    tag: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    tagText: {
        ...typography.caption,
        fontWeight: '600',
    },
    title: {
        ...typography.h4,
        color: colors.textPrimary,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    description: {
        ...typography.bodySm,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    metaRow: {
        flexDirection: 'row',
        gap: spacing.base,
        marginBottom: spacing.sm,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    metaText: {
        ...typography.caption,
        color: colors.textMuted,
    },
    rewardChip: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: spacing.xs,
        backgroundColor: palette.green50,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        marginBottom: spacing.md,
    },
    rewardText: {
        ...typography.caption,
        color: colors.primary,
        fontWeight: '600',
    },
    ctaBtn: {
        backgroundColor: colors.buttonPrimary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaText: {
        ...typography.bodySm,
        color: colors.buttonText,
        fontWeight: '600',
    },
});
