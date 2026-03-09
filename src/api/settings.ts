// ─── Settings API Implementation ─────────────────────────────────────────────
// NOTE: Currently using only mock data until backend team completes endpoints
//
// Mock endpoints implemented:
// - GET /settings/security (Get security settings)
// - PUT /settings/security (Update security settings)
// - POST /settings/change-password (Change password)
// - GET /settings/appearance (Get appearance preferences)
// - PUT /settings/appearance (Update appearance preferences)
// - GET /referral (Get referral info)
// - POST /referral/send (Send referral invite)

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

// ─── Mock Helpers ─────────────────────────────────────────────────────────────
const mockDelay = <T>(data: T, ms = 800): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(data), ms));

// ─── Mock Data ────────────────────────────────────────────────────────────────
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
        {
            id: 'ref_001',
            friend_username: 'alice_w',
            amount: 10,
            currency: 'USDT',
            status: 'credited',
            created_at: '2026-02-20T14:30:00Z',
        },
        {
            id: 'ref_002',
            friend_username: 'bob_m',
            amount: 10,
            currency: 'USDT',
            status: 'credited',
            created_at: '2026-02-18T09:15:00Z',
        },
        {
            id: 'ref_003',
            friend_username: 'carol_t',
            amount: 10,
            currency: 'USDT',
            status: 'credited',
            created_at: '2026-02-10T16:45:00Z',
        },
        {
            id: 'ref_004',
            friend_username: 'dave_k',
            amount: 10,
            currency: 'USDT',
            status: 'pending',
            created_at: '2026-03-01T11:00:00Z',
        },
        {
            id: 'ref_005',
            friend_username: 'eve_j',
            amount: 10,
            currency: 'USDT',
            status: 'pending',
            created_at: '2026-03-05T08:30:00Z',
        },
    ],
};

// ─── Security ─────────────────────────────────────────────────────────────────
export async function getSecuritySettings(): Promise<ApiResponse<SecuritySettings>> {
    return mockDelay({ success: true, data: { ...mockSecurity } });
}

export async function updateSecuritySettings(
    settings: Partial<SecuritySettings>,
): Promise<ApiResponse<SecuritySettings>> {
    mockSecurity = { ...mockSecurity, ...settings };
    return mockDelay({ success: true, data: { ...mockSecurity } }, 400);
}

export async function changePassword(
    payload: ChangePasswordPayload,
): Promise<ApiResponse<{ message: string }>> {
    if (payload.current_password === 'wrong') {
        return mockDelay(
            { success: false, data: { message: 'Current password is incorrect' }, message: 'Current password is incorrect' },
            600,
        );
    }
    mockSecurity.last_password_change = new Date().toISOString();
    return mockDelay({ success: true, data: { message: 'Password changed successfully' } });
}

// ─── Appearance ───────────────────────────────────────────────────────────────
export async function getAppearanceSettings(): Promise<ApiResponse<AppearanceSettings>> {
    return mockDelay({ success: true, data: { ...mockAppearance } });
}

export async function updateAppearanceSettings(
    settings: Partial<AppearanceSettings>,
): Promise<ApiResponse<AppearanceSettings>> {
    mockAppearance = { ...mockAppearance, ...settings };
    return mockDelay({ success: true, data: { ...mockAppearance } }, 400);
}

// ─── Referral ─────────────────────────────────────────────────────────────────
export async function getReferralInfo(): Promise<ApiResponse<ReferralInfo>> {
    return mockDelay({ success: true, data: MOCK_REFERRAL });
}

export async function sendInvite(
    payload: SendInvitePayload,
): Promise<ApiResponse<{ message: string }>> {
    return mockDelay({ success: true, data: { message: 'Invite sent successfully!' } });
}
