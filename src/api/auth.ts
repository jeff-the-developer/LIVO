import apiClient from './client';
import { ENV } from '@config/env';
import type { ApiResponse } from '@app-types/api.types';
import type { User } from '@stores/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface RegisterPayload {
    identifier: string;
    invite_code?: string;
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

export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    user: User;
}

export interface RegisterResult {
    user_id: string;
    identifier: string;
}

// ─── Mock Helpers ─────────────────────────────────────────────────────────────
const mockDelay = <T>(data: T, ms = 800): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(data), ms));

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

// Demo credentials for mock login
const MOCK_EMAIL = 'demo@livo.com';
const MOCK_PASSWORD = 'Demo1234!';

// ─── Register ─────────────────────────────────────────────────────────────────
export async function registerUser(
    payload: RegisterPayload,
): Promise<ApiResponse<RegisterResult>> {
    if (ENV.MOCK_MODE) {
        // Simulate duplicate email error for testing
        if (payload.identifier === 'taken@livo.com') {
            return mockDelay<never>(
                Promise.reject({
                    code: 'OPERATION_FAILED',
                    message: 'Email already registered',
                }) as never,
                600,
            );
        }
        return mockDelay({
            success: true,
            data: { user_id: 'mock-user-001', identifier: payload.identifier },
            message: 'Account created',
        });
    }
    const res = await apiClient.post<ApiResponse<RegisterResult>>(
        '/auth/register',
        payload,
    );
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

// ─── Login ────────────────────────────────────────────────────────────────────
export async function loginUser(
    payload: LoginPayload,
): Promise<ApiResponse<AuthTokens>> {
    if (ENV.MOCK_MODE) {
        const validEmail =
            payload.identifier.toLowerCase() === MOCK_EMAIL.toLowerCase();
        const validPassword = payload.password === MOCK_PASSWORD;

        if (!validEmail || !validPassword) {
            return mockDelay<never>(
                Promise.reject({
                    code: 'PIN_INCORRECT',
                    message: 'Invalid credentials. Try demo@livo.com / Demo1234!',
                }) as never,
                700,
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
