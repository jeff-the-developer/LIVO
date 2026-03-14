import apiClient from './client';
import { ENV } from '@config/env';
import type { ApiResponse } from '@app-types/api.types';

// ─── Security Types ───────────────────────────────────────────────────────────
export interface SecuritySettings {
    biometric_enabled: boolean;
    pin_enabled: boolean;
    two_factor_enabled: boolean;
    last_password_change: string;
    active_sessions: number;
}

export interface ChangePasswordPayload {
    current_password: string;
    new_password: string;
}

// ─── Appearance Types ─────────────────────────────────────────────────────────
export type ThemeMode = 'light' | 'dark' | 'system';
export type CurrencyDisplay = 'symbol' | 'code';

export interface AppearanceSettings {
    theme: ThemeMode;
    language: string;
    currency_display: CurrencyDisplay;
    compact_mode: boolean;
}

// ─── Referral Types ───────────────────────────────────────────────────────────
export interface ReferralInfo {
    referral_code: string;
    referral_link: string;
    total_invites: number;
    successful_invites: number;
    pending_invites: number;
    total_earned: number;
    currency: string;
    rewards: ReferralReward[];
}

export interface ReferralReward {
    id: string;
    friend_username: string;
    amount: number;
    currency: string;
    status: 'pending' | 'credited' | 'expired';
    created_at: string;
}

export interface SendInvitePayload {
    method: 'email' | 'sms' | 'share';
    recipient?: string;
}

// ─── Withdrawal Settings Types ────────────────────────────────────────────────
export interface WithdrawalSettings {
    whitelist_enabled: boolean;
    cooldown_hours: number;
}

export interface UpdateWithdrawalSettingsPayload {
    whitelist_enabled?: boolean;
    cooldown_hours?: number;
}

// ─── Internal Backend Types ───────────────────────────────────────────────────
interface BackendWithdrawalSettings {
    user_id: string;
    whitelist_enabled: boolean;
    addresses: string[] | null;
    cooldown_hours: number;
    updated_at: string;
}

interface BackendPreferences {
    language: string;
    currency: string;
    theme: string;
}

interface BackendMyInvites {
    total_invited: number;
    rewards_earned: string;
    invitees: Array<{
        id: string;
        name: string;
        joined_at: string;
        reward: string;
    }>;
}

interface BackendInviteResponse {
    invite_link: string;
    invite_code: string;
}

// ─── Mock Helpers ─────────────────────────────────────────────────────────────
const mockDelay = <T>(data: T, ms = 800): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(data), ms));

let mockSecurity: SecuritySettings = {
    biometric_enabled: true,
    pin_enabled: true,
    two_factor_enabled: false,
    last_password_change: '2026-02-15T10:00:00Z',
    active_sessions: 2,
};

let mockAppearance: AppearanceSettings = {
    theme: 'light',
    language: 'English',
    currency_display: 'symbol',
    compact_mode: false,
};

const MOCK_REFERRAL: ReferralInfo = {
    referral_code: 'JOHNDOE2026',
    referral_link: 'https://livopay.com/invite/JOHNDOE2026',
    total_invites: 8,
    successful_invites: 5,
    pending_invites: 3,
    total_earned: 50,
    currency: 'USDT',
    rewards: [
        { id: 'ref_001', friend_username: 'alice_w', amount: 10, currency: 'USDT', status: 'credited', created_at: '2026-02-20T14:30:00Z' },
        { id: 'ref_002', friend_username: 'bob_m', amount: 10, currency: 'USDT', status: 'credited', created_at: '2026-02-18T09:15:00Z' },
        { id: 'ref_003', friend_username: 'carol_t', amount: 10, currency: 'USDT', status: 'credited', created_at: '2026-02-10T16:45:00Z' },
        { id: 'ref_004', friend_username: 'dave_k', amount: 10, currency: 'USDT', status: 'pending', created_at: '2026-03-01T11:00:00Z' },
        { id: 'ref_005', friend_username: 'eve_j', amount: 10, currency: 'USDT', status: 'pending', created_at: '2026-03-05T08:30:00Z' },
    ],
};

// ─── Security (no single backend endpoint — keep as mock) ─────────────────────
export async function getSecuritySettings(): Promise<ApiResponse<SecuritySettings>> {
    return mockDelay({ success: true, data: { ...mockSecurity } });
}

export async function updateSecuritySettings(
    settings: Partial<SecuritySettings>,
): Promise<ApiResponse<SecuritySettings>> {
    mockSecurity = { ...mockSecurity, ...settings };
    return mockDelay({ success: true, data: { ...mockSecurity } }, 400);
}

// ─── Change Password ──────────────────────────────────────────────────────────
export async function changePassword(
    payload: ChangePasswordPayload,
): Promise<ApiResponse<{ message: string }>> {
    if (ENV.MOCK_MODE) {
        if (payload.current_password === 'wrong') {
            return mockDelay(
                { success: false, data: { message: 'Current password is incorrect' }, message: 'Current password is incorrect' },
                600,
            );
        }
        mockSecurity.last_password_change = new Date().toISOString();
        return mockDelay({ success: true, data: { message: 'Password changed successfully' } });
    }
    await apiClient.put('/user/password', {
        verify_method: 'password',
        old_password: payload.current_password,
        new_password: payload.new_password,
    });
    return { success: true, data: { message: 'Password changed successfully' } };
}

// ─── Appearance ───────────────────────────────────────────────────────────────
export async function getAppearanceSettings(): Promise<ApiResponse<AppearanceSettings>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({ success: true, data: { ...mockAppearance } });
    }
    const res = await apiClient.get<BackendPreferences>('/user/preferences');
    const p = res.data;
    return {
        success: true,
        data: {
            theme: (p.theme as ThemeMode) ?? 'light',
            language: p.language ?? 'English',
            currency_display: 'symbol',  // UI-only preference, not stored on backend
            compact_mode: false,          // UI-only preference, not stored on backend
        },
    };
}

export async function updateAppearanceSettings(
    settings: Partial<AppearanceSettings>,
): Promise<ApiResponse<AppearanceSettings>> {
    if (ENV.MOCK_MODE) {
        mockAppearance = { ...mockAppearance, ...settings };
        return mockDelay({ success: true, data: { ...mockAppearance } }, 400);
    }
    // Only send fields the backend supports
    const body: Record<string, string> = {};
    if (settings.theme) body.theme = settings.theme;
    if (settings.language) body.language = settings.language;

    const res = await apiClient.put<BackendPreferences>('/user/preferences', body);
    const p = res.data;
    return {
        success: true,
        data: {
            theme: (p.theme as ThemeMode) ?? settings.theme ?? 'light',
            language: p.language ?? settings.language ?? 'English',
            currency_display: settings.currency_display ?? 'symbol',
            compact_mode: settings.compact_mode ?? false,
        },
    };
}

// ─── Referral ─────────────────────────────────────────────────────────────────
export async function getReferralInfo(): Promise<ApiResponse<ReferralInfo>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({ success: true, data: MOCK_REFERRAL });
    }
    const [statsRes, inviteRes] = await Promise.all([
        apiClient.get<BackendMyInvites>('/referral/my-invites'),
        apiClient.post<BackendInviteResponse>('/referral/invite', { method: 'link' }),
    ]);

    const stats = statsRes.data;
    const invite = inviteRes.data;

    return {
        success: true,
        data: {
            referral_code: invite.invite_code,
            referral_link: invite.invite_link,
            total_invites: stats.total_invited,
            successful_invites: stats.invitees.length,
            pending_invites: 0,
            total_earned: parseFloat(stats.rewards_earned) || 0,
            currency: 'USDT',
            rewards: stats.invitees.map((i) => ({
                id: i.id,
                friend_username: i.name,
                amount: parseFloat(i.reward) || 0,
                currency: 'USDT',
                status: 'credited' as const,
                created_at: i.joined_at,
            })),
        },
    };
}

export async function sendInvite(
    payload: SendInvitePayload,
): Promise<ApiResponse<{ message: string }>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({ success: true, data: { message: 'Invite sent successfully!' } });
    }
    await apiClient.post('/referral/invite', { method: payload.method });
    return { success: true, data: { message: 'Invite sent successfully!' } };
}

// ─── Withdrawal Settings ──────────────────────────────────────────────────────
export async function getWithdrawalSettings(): Promise<ApiResponse<WithdrawalSettings>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({
            success: true,
            data: { whitelist_enabled: false, cooldown_hours: 24 },
        });
    }
    const res = await apiClient.get<BackendWithdrawalSettings>('/user/withdrawal-settings');
    return {
        success: true,
        data: {
            whitelist_enabled: res.data.whitelist_enabled,
            cooldown_hours: res.data.cooldown_hours,
        },
    };
}

export async function updateWithdrawalSettings(
    payload: UpdateWithdrawalSettingsPayload,
): Promise<ApiResponse<WithdrawalSettings>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({
            success: true,
            data: {
                whitelist_enabled: payload.whitelist_enabled ?? false,
                cooldown_hours: payload.cooldown_hours ?? 24,
            },
        }, 400);
    }
    const res = await apiClient.put<BackendWithdrawalSettings>(
        '/user/withdrawal-settings',
        payload,
    );
    return {
        success: true,
        data: {
            whitelist_enabled: res.data.whitelist_enabled,
            cooldown_hours: res.data.cooldown_hours,
        },
    };
}
