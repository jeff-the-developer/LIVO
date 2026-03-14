import apiClient from './client';
import { ENV } from '@config/env';
import type { ApiResponse } from '@app-types/api.types';

// ─── Public Types ─────────────────────────────────────────────────────────────
export interface NotificationPreferences {
    push_enabled: boolean;
    transaction_alerts: boolean;
    security_alerts: boolean;
    promotions: boolean;
    price_alerts: boolean;
    payment_reminders: boolean;
    newsletter: boolean;
}

export type NotificationKey = keyof NotificationPreferences;

// ─── Internal Backend Types ───────────────────────────────────────────────────
interface BackendNotificationSettings {
    push: boolean;
    email: boolean;
    sms: boolean;
    categories: Record<string, boolean>;
}

function mapBackendToPrefs(s: BackendNotificationSettings): NotificationPreferences {
    const c = s.categories ?? {};
    return {
        push_enabled: s.push,
        transaction_alerts: c.transaction ?? true,
        security_alerts: c.security ?? true,
        promotions: c.promotions ?? false,
        price_alerts: c.price_alerts ?? true,
        payment_reminders: c.payment_reminders ?? true,
        newsletter: c.newsletter ?? false,
    };
}

function mapPrefsToBackend(
    prefs: Partial<NotificationPreferences>,
): Partial<BackendNotificationSettings> {
    const result: Partial<BackendNotificationSettings> = {};
    if (prefs.push_enabled !== undefined) result.push = prefs.push_enabled;

    const categories: Record<string, boolean> = {};
    if (prefs.transaction_alerts !== undefined) categories.transaction = prefs.transaction_alerts;
    if (prefs.security_alerts !== undefined) categories.security = prefs.security_alerts;
    if (prefs.promotions !== undefined) categories.promotions = prefs.promotions;
    if (prefs.price_alerts !== undefined) categories.price_alerts = prefs.price_alerts;
    if (prefs.payment_reminders !== undefined) categories.payment_reminders = prefs.payment_reminders;
    if (prefs.newsletter !== undefined) categories.newsletter = prefs.newsletter;
    if (Object.keys(categories).length > 0) result.categories = categories;

    return result;
}

// ─── Mock Helpers ─────────────────────────────────────────────────────────────
const mockDelay = <T>(data: T, ms = 800): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(data), ms));

let mockPrefs: NotificationPreferences = {
    push_enabled: true,
    transaction_alerts: true,
    security_alerts: true,
    promotions: false,
    price_alerts: true,
    payment_reminders: true,
    newsletter: false,
};

// ─── Get Notification Preferences ────────────────────────────────────────────
export async function getNotificationPreferences(): Promise<
    ApiResponse<NotificationPreferences>
> {
    if (ENV.MOCK_MODE) {
        return mockDelay({ success: true, data: { ...mockPrefs } });
    }
    const res = await apiClient.get<BackendNotificationSettings>('/user/notifications/settings');
    return { success: true, data: mapBackendToPrefs(res.data) };
}

// ─── Update Notification Preferences ─────────────────────────────────────────
export async function updateNotificationPreferences(
    preferences: Partial<NotificationPreferences>,
): Promise<ApiResponse<NotificationPreferences>> {
    if (ENV.MOCK_MODE) {
        mockPrefs = { ...mockPrefs, ...preferences };
        return mockDelay({ success: true, data: { ...mockPrefs } }, 400);
    }
    const body = mapPrefsToBackend(preferences);
    const res = await apiClient.put<BackendNotificationSettings>(
        '/user/notifications/settings',
        body,
    );
    return { success: true, data: mapBackendToPrefs(res.data) };
}

// ─── Notification List API ──────────────────────────────────────────────────
import type { NotificationListResponse } from '@app-types/notification.types';

export async function getNotifications(
    page = 1,
    limit = 20,
): Promise<ApiResponse<NotificationListResponse>> {
    const res = await apiClient.get<NotificationListResponse>('/notifications', {
        params: { page, limit },
    });
    return { success: true, data: res.data };
}

export async function markNotificationRead(
    id: string,
): Promise<ApiResponse<{ success: boolean }>> {
    const res = await apiClient.put<{ success: boolean }>(`/notifications/${id}/read`);
    return { success: true, data: res.data };
}

export async function markAllNotificationsRead(): Promise<ApiResponse<{ success: boolean }>> {
    const res = await apiClient.put<{ success: boolean }>('/notifications/read-all');
    return { success: true, data: res.data };
}
