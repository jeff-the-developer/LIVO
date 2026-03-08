import apiClient from './client';
import { ENV } from '@config/env';
import type { ApiResponse } from '@app-types/api.types';
import type { User } from '@stores/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface UpdateAvatarPayload {
    /** Base64-encoded image data or URI from camera/library */
    image_data: string;
    /** MIME type, e.g. "image/jpeg" */
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

export interface UserProfile {
    user: User;
}

// ─── Mock Helpers ─────────────────────────────────────────────────────────────
const mockDelay = <T>(data: T, ms = 800): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(data), ms));

// ─── Update Avatar ────────────────────────────────────────────────────────────
export async function updateAvatar(
    payload: UpdateAvatarPayload,
): Promise<ApiResponse<UpdateAvatarResult>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({
            success: true,
            data: {
                avatar_url: `https://api.dicebear.com/7.x/avataaars/png?seed=${Date.now()}`,
            },
            message: 'Avatar updated successfully',
        });
    }
    const res = await apiClient.put<ApiResponse<UpdateAvatarResult>>(
        '/user/avatar',
        payload,
    );
    return res.data;
}

// ─── Reset Avatar to Default ──────────────────────────────────────────────────
export async function resetAvatar(): Promise<ApiResponse<UpdateAvatarResult>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({
            success: true,
            data: { avatar_url: '' },
            message: 'Avatar reset to default',
        });
    }
    const res = await apiClient.delete<ApiResponse<UpdateAvatarResult>>(
        '/user/avatar',
    );
    return res.data;
}

// ─── Update Phone Number ──────────────────────────────────────────────────────
export async function updatePhone(
    payload: UpdatePhonePayload,
): Promise<ApiResponse<null>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({
            success: true,
            data: null,
            message: 'Verification code sent to your phone',
        });
    }
    const res = await apiClient.put<ApiResponse<null>>(
        '/user/phone',
        payload,
    );
    return res.data;
}

// ─── Update Email ─────────────────────────────────────────────────────────────
export async function updateEmail(
    payload: UpdateEmailPayload,
): Promise<ApiResponse<null>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({
            success: true,
            data: null,
            message: 'Verification code sent to your new email',
        });
    }
    const res = await apiClient.put<ApiResponse<null>>(
        '/user/email',
        payload,
    );
    return res.data;
}

// ─── Get User Address ─────────────────────────────────────────────────────────
export async function getAddress(): Promise<ApiResponse<AddressResult | null>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({
            success: true,
            data: null, // No address saved yet
        });
    }
    const res = await apiClient.get<ApiResponse<AddressResult | null>>(
        '/user/address',
    );
    return res.data;
}

// ─── Save / Update Address ────────────────────────────────────────────────────
export async function saveAddress(
    payload: AddressPayload,
): Promise<ApiResponse<AddressResult>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({
            success: true,
            data: {
                address_id: `addr-${Date.now()}`,
                ...payload,
            },
            message: 'Address saved successfully',
        });
    }
    const res = await apiClient.put<ApiResponse<AddressResult>>(
        '/user/address',
        payload,
    );
    return res.data;
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
    const res = await apiClient.get<ApiResponse<UserProfile>>('/user/profile');
    return res.data;
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
    const res = await apiClient.delete<ApiResponse<null>>('/user/account');
    return res.data;
}
