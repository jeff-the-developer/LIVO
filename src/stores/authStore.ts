import axios from 'axios';
import { create } from 'zustand';
import * as tokenStorage from '@utils/tokenStorage';
import { ENV } from '@config/env';

function isJwtExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
    user_id: string;
    username: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    account_type: 'individual' | 'corporate';
    kyc_level: 0 | 1 | 2 | 3;
    membership_tier: string;
    svid?: string;
    date_of_birth?: string;
    email_verified?: boolean;
    biometric_enabled?: boolean;
    mfa_enabled?: boolean;
    /** From GET /user/profile & login — `false` means user must complete PIN setup */
    pin_enabled?: boolean;
    status?: string;
    balance?: string;
    created_at?: string;
    updated_at?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    isHydrated: boolean;
    pinVerified: boolean;
}

interface AuthActions {
    login(token: string, refreshToken: string, user: User): Promise<void>;
    logout(): Promise<void>;
    setUser(user: User): void;
    setPinVerified(value: boolean): void;
    setLoading(value: boolean): void;
    hydrate(): Promise<void>;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isLoggedIn: false,
    isLoading: false,
    isHydrated: false,
    pinVerified: false,
};

// ─── Store ────────────────────────────────────────────────────────────────────
// Timestamp of last login — prevents stale 401s from logging out a fresh session
let _lastLoginAt = 0;

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
    ...initialState,

    async login(token, refreshToken, user) {
        await tokenStorage.saveToken(token);
        await tokenStorage.saveRefreshToken(refreshToken);
        await tokenStorage.saveUser(user);
        _lastLoginAt = Date.now();
        set({
            token,
            user,
            isLoggedIn: true,
            pinVerified: false,
        });
    },

    async logout() {
        // Ignore logout calls within 10 seconds of a fresh login —
        // these are caused by stale 401 responses from before login
        if (Date.now() - _lastLoginAt < 10_000) {
            return;
        }
        // Fire-and-forget logout to backend using raw axios (not apiClient)
        // to avoid the response interceptor triggering another logout loop
        const token = get().token;
        if (token) {
            axios.post(`${ENV.BASE_URL}/auth/logout`, null, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000,
            }).catch(() => {});
        }
        await tokenStorage.clearAll();
        set({
            ...initialState,
            isHydrated: get().isHydrated,
        });
    },

    setUser(user) {
        set({ user });
        void tokenStorage.saveUser(user).catch(() => {});
    },

    setPinVerified(value) {
        set({ pinVerified: value });
    },

    setLoading(value) {
        set({ isLoading: value });
    },

    async hydrate() {
        set({ isLoading: true });
        try {
            const storedToken = await tokenStorage.getToken();
            const refreshToken = await tokenStorage.getRefreshToken();
            const user = await tokenStorage.getUser<User>();

            if (!storedToken || !user) {
                await get().logout();
                return;
            }

            if (!isJwtExpired(storedToken)) {
                set({ token: storedToken, user, isLoggedIn: true });
                return;
            }

            // Access token expired — try to refresh silently
            if (!refreshToken) {
                await get().logout();
                return;
            }
            try {
                const { data } = await axios.post<{ token: string; refresh_token?: string }>(
                    `${ENV.BASE_URL}/auth/refresh`,
                    { refresh_token: refreshToken },
                    { headers: { 'Content-Type': 'application/json' }, timeout: 10000 },
                );
                const newToken = data.token;
                await tokenStorage.saveToken(newToken);
                if (data.refresh_token) {
                    await tokenStorage.saveRefreshToken(data.refresh_token);
                }
                set({ token: newToken, user, isLoggedIn: true });
            } catch (err: any) {
                // If rate limited or network error, keep user logged in with
                // stale token — the response interceptor will retry refresh later
                const status = err?.response?.status;
                if (status === 429 || !err?.response) {
                    set({ token: storedToken, user, isLoggedIn: true });
                } else {
                    await get().logout();
                }
            }
        } catch {
            await get().logout();
        } finally {
            set({ isHydrated: true, isLoading: false });
        }
    },
}));
