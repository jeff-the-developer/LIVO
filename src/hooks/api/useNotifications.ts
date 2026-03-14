import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@utils/errorHandler';
import {
    getNotificationPreferences,
    updateNotificationPreferences,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    type NotificationPreferences,
} from '@api/notifications';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const notificationKeys = {
    all: ['notifications'] as const,
    preferences: ['notifications', 'preferences'] as const,
    list: (page?: number, limit?: number) => ['notifications', 'list', page, limit] as const,
};

// ─── Get Notification Preferences ─────────────────────────────────────────────
export function useNotificationPreferences() {
    return useQuery({
        queryKey: notificationKeys.preferences,
        queryFn: getNotificationPreferences,
        select: (data) => data.data,
    });
}

// ─── Update Notification Preferences ──────────────────────────────────────────
export function useUpdateNotificationPreferences() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (prefs: Partial<NotificationPreferences>) =>
            updateNotificationPreferences(prefs),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.preferences });
        },
    });
}

// ─── Get Notifications List ──────────────────────────────────────────────────
export function useNotifications(page = 1, limit = 20) {
    return useQuery({
        queryKey: notificationKeys.list(page, limit),
        queryFn: () => getNotifications(page, limit),
        select: (data) => data.data,
        staleTime: 60_000,
    });
}

// ─── Mark Notification Read ──────────────────────────────────────────────────
export function useMarkNotificationRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => markNotificationRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}

// ─── Mark All Notifications Read ─────────────────────────────────────────────
export function useMarkAllRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAllNotificationsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}

// ─── Error Helper (re-export) ─────────────────────────────────────────────────
export { handleApiError };
