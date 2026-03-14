import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01FreeIcons } from '@hugeicons/core-free-icons';
import { colors } from '@theme/colors';
import { useNotifications, useMarkAllRead } from '@hooks/api/useNotifications';
import type { Notification } from '@app-types/notification.types';

function formatDateHeader(dateStr: string): string {
    const d = new Date(dateStr);
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `${day} ${months[d.getMonth()]}, ${days[d.getDay()]}`;
}

function formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
}

function getDateKey(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

interface GroupedNotifications {
    dateLabel: string;
    items: Notification[];
}

export default function NotificationsListScreen(): React.ReactElement {
    const navigation = useNavigation();
    const notifications = useNotifications(1, 50);
    const markAllRead = useMarkAllRead();
    const hasMarkedRef = useRef(false);

    useEffect(() => {
        if (!hasMarkedRef.current && (notifications.data?.unread_count ?? 0) > 0) {
            hasMarkedRef.current = true;
            markAllRead.mutate();
        }
    }, [notifications.data?.unread_count]);

    const grouped = useMemo<GroupedNotifications[]>(() => {
        const items = notifications.data?.notifications ?? [];
        const map = new Map<string, GroupedNotifications>();
        for (const n of items) {
            const key = getDateKey(n.created_at);
            if (!map.has(key)) {
                map.set(key, { dateLabel: formatDateHeader(n.created_at), items: [] });
            }
            map.get(key)!.items.push(n);
        }
        return Array.from(map.values());
    }, [notifications.data]);

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.6}
                >
                    <HugeiconsIcon icon={ArrowLeft01FreeIcons} size={24} color="#242424" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={notifications.isRefetching}
                        onRefresh={() => notifications.refetch()}
                    />
                }
            >
                {grouped.length === 0 && !notifications.isLoading && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No notifications yet</Text>
                    </View>
                )}

                {notifications.isLoading && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Loading...</Text>
                    </View>
                )}

                {grouped.map((group) => (
                    <View key={group.dateLabel} style={styles.group}>
                        <Text style={styles.dateLabel}>{group.dateLabel}</Text>
                        <View style={styles.cardList}>
                            {group.items.map((notif) => (
                                <View key={notif.id} style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardCategory}>
                                            {notif.category || 'Transaction Alert'}
                                        </Text>
                                        <Text style={styles.cardSeparator}>//</Text>
                                        <Text style={styles.cardTime}>
                                            {formatTime(notif.created_at)}
                                        </Text>
                                    </View>
                                    <Text style={styles.cardBody}>{notif.body || notif.title}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    backBtn: {
        width: 36,
        height: 33,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#242424',
        lineHeight: 24,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 22,
        paddingBottom: 40,
    },
    emptyState: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#B2B2B2',
        lineHeight: 21,
    },
    group: {
        marginBottom: 27,
    },
    dateLabel: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
        color: '#B2B2B2',
        lineHeight: 21,
        marginBottom: 28,
    },
    cardList: {
        gap: 8,
    },
    card: {
        backgroundColor: '#F0F0F0',
        borderRadius: 16,
        padding: 10,
        gap: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },
    cardCategory: {
        fontSize: 12,
        fontWeight: '500',
        color: '#B2B2B2',
        lineHeight: 18,
    },
    cardSeparator: {
        fontSize: 12,
        fontWeight: '500',
        color: '#B2B2B2',
        lineHeight: 18,
    },
    cardTime: {
        fontSize: 12,
        fontWeight: '500',
        color: '#B2B2B2',
        lineHeight: 18,
    },
    cardBody: {
        fontSize: 14,
        fontWeight: '500',
        color: '#242424',
        lineHeight: 21,
    },
});
