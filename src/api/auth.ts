import apiClient from './client';
import { ENV } from '@config/env';
import type { ApiResponse } from '@app-types/api.types';
import type { User } from '@stores/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface RegisterPayload {
    identifier: string;
    invite_code?: string;
}

export interface VerifyOTPPayload {
    identifier: string;
    code: string;
}

export interface SetPasswordPayload {
    user_id: string;
    password: string;
    confirm_password: string;
}

export interface LoginPayload {
    identifier: string;
    password: string;
}

export interface CheckUsernamePayload {
    username: string;
}

export interface CreateUsernamePayload {
    user_id: string;
    username: string;
}

export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    user: User;
}

export interface RegisterResult {
    user_id: string;
    identifier: string;
}

export interface VerifyOTPResult {
    user_id: string;
    verified: boolean;
}

export interface CheckUsernameResult {
    available: boolean;
    suggestion?: string;
}

// ─── Mock Helpers ─────────────────────────────────────────────────────────────
const mockDelay = <T>(data: T, ms = 800): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(data), ms));

const mockError = (code: string, message: string, ms = 600): Promise<never> =>
    new Promise((_, reject) => setTimeout(() => reject({ code, message }), ms));

const MOCK_USER: User = {
    user_id: 'mock-user-001',
    username: 'demouser',
    email: 'demo@livo.com',
    account_type: 'individual',
    kyc_level: 0,
    membership_tier: 'Basic',
    svid: 'LIVO12345',
};

const MOCK_TOKENS: AuthTokens = {
    access_token: 'mock-access-token-xyz',
    refresh_token: 'mock-refresh-token-abc',
    user: MOCK_USER,
};

const MOCK_EMAIL = 'demo@livo.com';
const MOCK_PASSWORD = 'Demo1234!';
const MOCK_OTP = '777777'; // 6-digit mock OTP

// ─── Register ─────────────────────────────────────────────────────────────────
export async function registerUser(
    payload: RegisterPayload,
): Promise<ApiResponse<RegisterResult>> {
    if (ENV.MOCK_MODE) {
        if (payload.identifier === 'taken@livo.com') {
            return mockError('OPERATION_FAILED', 'Email already registered');
        }
        return mockDelay({
            success: true,
            data: { user_id: 'mock-user-001', identifier: payload.identifier },
            message: 'Verification code sent',
        });
    }
    const res = await apiClient.post<ApiResponse<RegisterResult>>(
        '/auth/register',
        payload,
    );
    return res.data;
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────
export async function verifyOTP(
    payload: VerifyOTPPayload,
): Promise<ApiResponse<VerifyOTPResult>> {
    if (ENV.MOCK_MODE) {
        if (payload.code !== MOCK_OTP) {
            return mockError(
                'INVALID_OTP',
                'Wrong authentication code, please try again',
            );
        }
        return mockDelay({
            success: true,
            data: { user_id: 'mock-user-001', verified: true },
        });
    }
    const res = await apiClient.post<ApiResponse<VerifyOTPResult>>(
        '/auth/verify-otp',
        payload,
    );
    return res.data;
}

// ─── Resend OTP ───────────────────────────────────────────────────────────────
export async function resendOTP(
    identifier: string,
): Promise<ApiResponse<null>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({
            success: true,
            data: null,
            message: 'Verification code resent',
        });
    }
    const res = await apiClient.post<ApiResponse<null>>('/auth/resend-otp', {
        identifier,
    });
    return res.data;
}

// ─── Set Password ─────────────────────────────────────────────────────────────
export async function setPassword(
    payload: SetPasswordPayload,
): Promise<ApiResponse<AuthTokens>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({
            success: true,
            data: {
                ...MOCK_TOKENS,
                user: { ...MOCK_USER, email: 'demo@livo.com' },
            },
        });
    }
    const res = await apiClient.post<ApiResponse<AuthTokens>>(
        '/auth/set-password',
        payload,
    );
    return res.data;
}

// ─── Check Username Availability ──────────────────────────────────────────────
export async function checkUsername(
    username: string,
): Promise<ApiResponse<CheckUsernameResult>> {
    if (ENV.MOCK_MODE) {
        const taken = ['admin', 'livo', 'support', 'demo'].includes(
            username.toLowerCase(),
        );
        return mockDelay(
            {
                success: true,
                data: {
                    available: !taken,
                    suggestion: taken ? `${username}_${Math.floor(Math.random() * 99)}` : undefined,
                },
            },
            400,
        );
    }
    const res = await apiClient.get<ApiResponse<CheckUsernameResult>>(
        `/auth/check-username?username=${encodeURIComponent(username)}`,
    );
    return res.data;
}

// ─── Create Username ──────────────────────────────────────────────────────────
export async function createUsername(
    payload: CreateUsernamePayload,
): Promise<ApiResponse<AuthTokens>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({
            success: true,
            data: {
                ...MOCK_TOKENS,
                user: { ...MOCK_USER, username: payload.username },
            },
        });
    }
    const res = await apiClient.post<ApiResponse<AuthTokens>>(
        '/auth/create-username',
        payload,
    );
    return res.data;
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function loginUser(
    payload: LoginPayload,
): Promise<ApiResponse<AuthTokens>> {
    if (ENV.MOCK_MODE) {
        const validEmail =
            payload.identifier.toLowerCase() === MOCK_EMAIL.toLowerCase();
        const validPassword = payload.password === MOCK_PASSWORD;

        if (!validEmail || !validPassword) {
            return mockError(
                'PIN_INCORRECT',
                'Invalid credentials. Try demo@livo.com / Demo1234!',
            );
        }
        return mockDelay({ success: true, data: MOCK_TOKENS });
    }
    const res = await apiClient.post<ApiResponse<AuthTokens>>(
        '/auth/login',
        payload,
    );
    return res.data;
}

// ─── Google Login ─────────────────────────────────────────────────────────────
export async function loginWithGoogle(
    idToken: string,
): Promise<ApiResponse<AuthTokens>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({ success: true, data: MOCK_TOKENS });
    }
    const res = await apiClient.post<ApiResponse<AuthTokens>>('/auth/google', {
        id_token: idToken,
    });
    return res.data;
}

// ─── Forgot Password ──────────────────────────────────────────────────────────
export async function forgotPassword(
    identifier: string,
): Promise<ApiResponse<null>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({ success: true, data: null, message: 'Reset email sent' });
    }
    const res = await apiClient.post<ApiResponse<null>>(
        '/auth/forgot-password',
        { identifier },
    );
    return res.data;
}
