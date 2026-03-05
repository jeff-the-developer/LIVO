import { create } from 'zustand';
import * as tokenStorage from '@utils/tokenStorage';

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
export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
    ...initialState,

    async login(token, refreshToken, user) {
        await tokenStorage.saveToken(token);
        await tokenStorage.saveRefreshToken(refreshToken);
        await tokenStorage.saveUser(user);
        set({
            token,
            user,
            isLoggedIn: true,
            pinVerified: false,
        });
    },

    async logout() {
        await tokenStorage.clearAll();
        set({
            ...initialState,
            isHydrated: get().isHydrated,
        });
    },

    setUser(user) {
        set({ user });
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
            const token = await tokenStorage.getToken();
            const user = await tokenStorage.getUser<User>();
            if (token && user) {
                set({ token, user, isLoggedIn: true });
            } else {
                await get().logout();
            }
        } catch {
            await get().logout();
        } finally {
            set({ isHydrated: true, isLoading: false });
        }
    },
}));
