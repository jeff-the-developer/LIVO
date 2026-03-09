// ─── Notifications API Implementation ────────────────────────────────────────
// NOTE: Currently using only mock data until backend team completes endpoints
//
// Mock endpoints implemented:
// - GET /notifications/preferences (Get notification preferences)
// - PUT /notifications/preferences (Update notification preferences)

import type { ApiResponse } from '@app-types/api.types';

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Mock Helpers ─────────────────────────────────────────────────────────────
const mockDelay = <T>(data: T, ms = 800): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(data), ms));

// ─── Mock Data ────────────────────────────────────────────────────────────────
let mockPrefs: NotificationPreferences = {
    push_enabled: true,
    transaction_alerts: true,
    security_alerts: true,
    promotions: false,
    price_alerts: true,
    payment_reminders: true,
    newsletter: false,
};

// ─── Get Notification Preferences ─────────────────────────────────────────────
export async function getNotificationPreferences(): Promise<
    ApiResponse<NotificationPreferences>
> {
    return mockDelay({
        success: true,
        data: { ...mockPrefs },
    });
}

// ─── Update Notification Preferences ──────────────────────────────────────────
export async function updateNotificationPreferences(
    preferences: Partial<NotificationPreferences>,
): Promise<ApiResponse<NotificationPreferences>> {
    mockPrefs = { ...mockPrefs, ...preferences };
    return mockDelay(
        {
            success: true,
            data: { ...mockPrefs },
        },
        400,
    );
}
