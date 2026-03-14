import apiClient from './client';
import { ENV } from '@config/env';
import type { ApiResponse } from '@app-types/api.types';
import type { User } from '@stores/authStore';

// ─── Public Types ─────────────────────────────────────────────────────────────
export interface RegisterPayload {
    identifier: string;
    invite_code?: string;
}

export interface VerifyOTPPayload {
    identifier: string;
    code: string;
}

export interface SetPasswordPayload {
    email: string;
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
export interface SetupPINPayload {
    pin: string;
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
    user_id?: string;
    verified: boolean;
}

export interface CheckUsernameResult {
    available: boolean;
    suggestion?: string;
}

// ─── Internal Backend Response Types ─────────────────────────────────────────
interface BackendUser {
    id: string;
    email: string;
    phone?: string;
    username?: string;
    svid?: string;
    account_type: 'individual' | 'corporate';
    kyc_level: number;
    membership_tier: string;
    email_verified?: boolean;
    biometric_enabled?: boolean;
    mfa_enabled?: boolean;
    status?: string;
    balance?: string;
    created_at?: string;
    updated_at?: string;
}

interface BackendAuthResponse {
    token: string;
    refresh_token: string;
    user: BackendUser;
}

function mapAuthResponse(raw: BackendAuthResponse): AuthTokens {
    return {
        access_token: raw.token,
        refresh_token: raw.refresh_token,
        user: {
            user_id: raw.user.id,
            username: raw.user.username ?? '',
            email: raw.user.email,
            phone: raw.user.phone,
            account_type: raw.user.account_type,
            kyc_level: raw.user.kyc_level as 0 | 1 | 2 | 3,
            membership_tier: raw.user.membership_tier,
            svid: raw.user.svid,
            email_verified: raw.user.email_verified,
            biometric_enabled: raw.user.biometric_enabled,
            mfa_enabled: raw.user.mfa_enabled,
            status: raw.user.status,
            balance: raw.user.balance,
            created_at: raw.user.created_at,
            updated_at: raw.user.updated_at,
        },
    };
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
const MOCK_OTP = '777777';

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
    const res = await apiClient.post<{ user_id: string; message: string }>(
        '/auth/register',
        { email: payload.identifier, invite_code: payload.invite_code },
    );
    return {
        success: true,
        message: res.data.message,
        data: { user_id: res.data.user_id, identifier: payload.identifier },
    };
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
    const res = await apiClient.post<{ verified: boolean }>(
        '/auth/verify-email',
        { email: payload.identifier, code: payload.code },
    );
    return { success: true, data: { verified: res.data.verified } };
}

// ─── Resend OTP ───────────────────────────────────────────────────────────────
// TODO(backend): add POST /auth/resend-otp endpoint — mocked until available
export async function resendOTP(
    _identifier: string,
): Promise<ApiResponse<null>> {
    return mockDelay({
        success: true,
        data: null,
        message: 'Verification code resent',
    });
}

// ─── Set Password ─────────────────────────────────────────────────────────────
export async function setPassword(
    payload: SetPasswordPayload,
): Promise<ApiResponse<AuthTokens>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({
            success: true,
            data: { ...MOCK_TOKENS, user: { ...MOCK_USER, email: payload.email } },
        });
    }
    await apiClient.post<{ success: boolean }>('/auth/set-password', {
        email: payload.email,
        password: payload.password,
        confirm_password: payload.confirm_password,
    });
    // Tokens are obtained at the subsequent createUsername / login step
    return { success: true, data: null as unknown as AuthTokens };
}

// ─── Check Username Availability ──────────────────────────────────────────────
// TODO(backend): add GET /auth/check-username endpoint — mocked until available
export async function checkUsername(
    username: string,
): Promise<ApiResponse<CheckUsernameResult>> {
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

// ─── Create Username ──────────────────────────────────────────────────────────
// TODO(backend): add POST /auth/create-username endpoint — mocked until available
export async function createUsername(
    payload: CreateUsernamePayload,
): Promise<ApiResponse<AuthTokens>> {
    return mockDelay({
        success: true,
        data: { ...MOCK_TOKENS, user: { ...MOCK_USER, username: payload.username } },
    });
}

// ─── Setup PIN ───────────────────────────────────────────────────────────────
// TODO(backend): add POST /auth/setup-pin endpoint — mocked until available
export async function setupPIN(
    payload: SetupPINPayload,
): Promise<ApiResponse<null>> {
    return mockDelay({
        success: true,
        data: null,
        message: 'PIN configured successfully',
    });
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function loginUser(
    payload: LoginPayload,
): Promise<ApiResponse<AuthTokens>> {
    if (ENV.MOCK_MODE) {
        const validEmail = payload.identifier.toLowerCase() === MOCK_EMAIL.toLowerCase();
        const validPassword = payload.password === MOCK_PASSWORD;
        if (!validEmail || !validPassword) {
            return mockError(
                'PIN_INCORRECT',
                'Invalid credentials. Try demo@livo.com / Demo1234!',
            );
        }
        return mockDelay({ success: true, data: MOCK_TOKENS });
    }
    const res = await apiClient.post<BackendAuthResponse>('/auth/login', payload);
    return { success: true, data: mapAuthResponse(res.data) };
}

// ─── Google Login ─────────────────────────────────────────────────────────────
export async function loginWithGoogle(
    idToken: string,
): Promise<ApiResponse<AuthTokens>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({ success: true, data: MOCK_TOKENS });
    }
    const res = await apiClient.post<BackendAuthResponse>('/auth/google', {
        id_token: idToken,
    });
    return { success: true, data: mapAuthResponse(res.data) };
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logoutUser(): Promise<void> {
    await apiClient.post('/auth/logout');
}

// ─── Forgot Password ──────────────────────────────────────────────────────────
export async function forgotPassword(
    identifier: string,
): Promise<ApiResponse<null>> {
    if (ENV.MOCK_MODE) {
        return mockDelay({ success: true, data: null, message: 'Reset email sent' });
    }
    await apiClient.post<{ success: boolean }>('/auth/forgot-password', {
        email: identifier,
    });
    return { success: true, data: null };
}
