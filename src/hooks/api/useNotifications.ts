import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@utils/errorHandler';
import {
    getNotificationPreferences,
    updateNotificationPreferences,
    type NotificationPreferences,
} from '@api/notifications';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const notificationKeys = {
    all: ['notifications'] as const,
    preferences: ['notifications', 'preferences'] as const,
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

// ─── Error Helper (re-export) ─────────────────────────────────────────────────
export { handleApiError };
