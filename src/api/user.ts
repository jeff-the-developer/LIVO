import apiClient from './client';
import { ENV } from '@config/env';
import type { ApiResponse } from '@app-types/api.types';
import type { User } from '@stores/authStore';

// ─── Public Types ─────────────────────────────────────────────────────────────
export interface UpdateAvatarPayload {
    image_data: string;
    mime_type: string;
}

export interface UpdateAvatarResult {
    avatar_url: string;
}

export interface UpdatePhonePayload {
    country_code: string;
    phone_number: string;
}

export interface UpdateEmailPayload {
    email: string;
}

export interface AddressPayload {
    street: string;
    apartment?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
}

export interface AddressResult {
    address_id: string;
    street: string;
    apartment?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
}

export interface UpdateUsernamePayload {
    username: string;
}

export interface UpdateProfilePayload {
    username?: string;
    avatar_url?: string;
    date_of_birth?: string;
}

export interface SessionInfo {
    id: string;
    device: string;
    date: string;
    location: string;
    ip: string;
    is_current: boolean;
}

export interface SessionsResult {
    current_session: SessionInfo | null;
    other_sessions: SessionInfo[];
}

export interface UserProfile {
    user: User;
}

// ─── Internal Backend Types ───────────────────────────────────────────────────
interface BackendAddress {
    id: string;
    label: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
}

interface BackendProfile {
    user_id: string;
    username: string;
    svid: string;
    email: string;
    phone: string;
    avatar_url: string;
    account_type: 'individual' | 'corporate';
    kyc_level: number;
    membership_tier: string;
    date_of_birth?: string;
    created_at?: string;
    updated_at?: string;
}

interface BackendSession {
    id: string;
    user_id: string;
    device: string;
    date: string;
    location: string;
    ip: string;
    is_current: boolean;
}

interface BackendSessionsResponse {
    current_session: BackendSession | null;
    other_sessions: BackendSession[];
}

function mapBackendAddress(a: BackendAddress): AddressResult {
    return {
        address_id: a.id,
        street: a.line1,
        apartment: a.line2,
        city: a.city,
        state: a.state || undefined,
        postal_code: a.zip_code,
        country: a.country,
    };
}

// ─── Mock Helpers ─────────────────────────────────────────────────────────────
const mockDelay = <T>(data: T, ms = 800): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(data), ms));

// ─── Update Avatar ────────────────────────────────────────────────────────────
// TODO(backend): requires POST /upload endpoint then PUT /user/profile with avatar_url
export async function updateAvatar(
    payload: UpdateAvatarPayload,
): Promise<ApiResponse<UpdateAvatarResult>> {
    return mockDelay({
        success: true,
        data: { avatar_url: `https://api.dicebear.com/7.x/avataaars/png?seed=${Date.now()}` },
        message: 'Avatar updated successfully',
    });
}

// ─── Reset Avatar to Default ──────────────────────────────────────────────────
// TODO(backend): add DELETE /user/avatar endpoint
export async function resetAvatar(): Promise<ApiResponse<UpdateAvatarResult>> {
    return mockDelay({
        success: true,
        data: { avatar_url: '' },
        message: 'Avatar reset to default',
    });
}

// ─── Update Phone Number ──────────────────────────────────────────────────────
// TODO(backend): add PUT /user/phone endpoint
export async function updatePhone(
    payload: UpdatePhonePayload,
): Promise<ApiResponse<null>> {
    return mockDelay({
        success: true,
        data: null,
        message: 'Verification code sent to your phone',
    });
}

// ─── Update Email ─────────────────────────────────────────────────────────────
// TODO(backend): add PUT /user/email endpoint
export async function updateEmail(
    payload: UpdateEmailPayload,
): Promise<ApiResponse<null>> {
    return mockDelay({
        success: true,
        data: null,
        message: 'Verification code sent to your new email',
    });
}

// ─── Get User Address ─────────────────────────────────────────────────────────
export async function getAddress(): Promise<ApiResponse<AddressResult | null>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({ success: true, data: null });
    }
    const res = await apiClient.get<{ addresses: BackendAddress[] }>('/user/addresses');
    const first = res.data.addresses?.[0] ?? null;
    return { success: true, data: first ? mapBackendAddress(first) : null };
}

// ─── Save / Update Address ────────────────────────────────────────────────────
export async function saveAddress(
    payload: AddressPayload,
): Promise<ApiResponse<AddressResult>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({
            success: true,
            data: { address_id: `addr-${Date.now()}`, ...payload },
            message: 'Address saved successfully',
        });
    }
    const res = await apiClient.post<BackendAddress>('/user/addresses', {
        label: 'Home',
        line1: payload.street,
        line2: payload.apartment,
        city: payload.city,
        state: payload.state ?? '',
        zip_code: payload.postal_code,
        country: payload.country,
    });
    return { success: true, data: mapBackendAddress(res.data) };
}

// ─── Get User Profile ─────────────────────────────────────────────────────────
export async function getUserProfile(): Promise<ApiResponse<UserProfile>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({
            success: true,
            data: {
                user: {
                    user_id: 'mock-user-001',
                    username: 'demouser',
                    email: 'demo@livo.com',
                    phone: '+85212345678',
                    avatar_url: '',
                    account_type: 'individual',
                    kyc_level: 0,
                    membership_tier: 'Basic',
                    svid: 'LIVO12345',
                },
            },
        });
    }
    const res = await apiClient.get<BackendProfile>('/user/profile');
    const p = res.data;
    return {
        success: true,
        data: {
            user: {
                user_id: p.user_id,
                username: p.username,
                email: p.email,
                phone: p.phone || undefined,
                avatar_url: p.avatar_url || undefined,
                account_type: p.account_type,
                kyc_level: p.kyc_level as 0 | 1 | 2 | 3,
                membership_tier: p.membership_tier,
                svid: p.svid || undefined,
                date_of_birth: p.date_of_birth || undefined,
                created_at: p.created_at,
                updated_at: p.updated_at,
            },
        },
    };
}

// ─── Update Profile ───────────────────────────────────────────────────────────
// TODO(backend): blocked — user/repository.go uses WHERE user_id instead of WHERE id
export async function updateProfile(
    payload: UpdateProfilePayload,
): Promise<ApiResponse<UserProfile>> {
    return mockDelay({
        success: true,
        data: {
            user: {
                user_id: 'mock-user-001',
                username: payload.username ?? 'demouser',
                email: 'demo@livo.com',
                account_type: 'individual',
                kyc_level: 0,
                membership_tier: 'Basic',
                avatar_url: payload.avatar_url,
                date_of_birth: payload.date_of_birth,
            },
        },
    });
}

// ─── Set Anti-Phishing Code ───────────────────────────────────────────────────
// TODO(backend): blocked — user/repository.go uses WHERE user_id instead of WHERE id
export async function setAntiPhishing(
    code: string,
): Promise<ApiResponse<null>> {
    void code;
    return mockDelay({ success: true, data: null });
}

// ─── Get Sessions ─────────────────────────────────────────────────────────────
export async function getSessions(): Promise<ApiResponse<SessionsResult>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({
            success: true,
            data: {
                current_session: {
                    id: 'session-001',
                    device: 'iPhone (Mock)',
                    date: new Date().toISOString(),
                    location: 'Mock City',
                    ip: '0.0.0.0',
                    is_current: true,
                },
                other_sessions: [],
            },
        });
    }
    const res = await apiClient.get<BackendSessionsResponse>('/user/sessions');
    const mapSession = (s: BackendSession): SessionInfo => ({
        id: s.id,
        device: s.device,
        date: s.date,
        location: s.location,
        ip: s.ip,
        is_current: s.is_current,
    });
    return {
        success: true,
        data: {
            current_session: res.data.current_session
                ? mapSession(res.data.current_session)
                : null,
            other_sessions: (res.data.other_sessions ?? []).map(mapSession),
        },
    };
}

// ─── Terminate Session ────────────────────────────────────────────────────────
export async function terminateSession(
    sessionId: string,
): Promise<ApiResponse<null>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({ success: true, data: null });
    }
    await apiClient.delete(`/user/sessions/${sessionId}`);
    return { success: true, data: null };
}

// ─── Delete Account ───────────────────────────────────────────────────────────
export async function deleteAccount(): Promise<ApiResponse<null>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({
            success: true,
            data: null,
            message: 'Account scheduled for deletion',
        }, 1200);
    }
    await apiClient.post('/user/account/close', { reason: 'User requested account closure' });
    return { success: true, data: null };
}
