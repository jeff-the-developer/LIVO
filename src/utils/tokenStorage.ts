import * as SecureStore from 'expo-secure-store';

// ─── Key Constants ────────────────────────────────────────────────────────────
const TOKEN_KEY = 'livo_access_token';
const REFRESH_TOKEN_KEY = 'livo_refresh_token';
const USER_KEY = 'livo_user';

// ─── Access Token ─────────────────────────────────────────────────────────────
export async function saveToken(token: string): Promise<void> {
    try {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
        console.error('[TokenStorage] saveToken error:', error);
        throw error;
    }
}

export async function getToken(): Promise<string | null> {
    try {
        return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
        console.error('[TokenStorage] getToken error:', error);
        return null;
    }
}

// ─── Refresh Token ────────────────────────────────────────────────────────────
export async function saveRefreshToken(token: string): Promise<void> {
    try {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (error) {
        console.error('[TokenStorage] saveRefreshToken error:', error);
        throw error;
    }
}

export async function getRefreshToken(): Promise<string | null> {
    try {
        return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
        console.error('[TokenStorage] getRefreshToken error:', error);
        return null;
    }
}

// ─── User ─────────────────────────────────────────────────────────────────────
export async function saveUser(user: object): Promise<void> {
    try {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } catch (error) {
        console.error('[TokenStorage] saveUser error:', error);
        throw error;
    }
}

export async function getUser<T>(): Promise<T | null> {
    try {
        const raw = await SecureStore.getItemAsync(USER_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as T;
    } catch (error) {
        console.error('[TokenStorage] getUser error:', error);
        return null;
    }
}

// ─── Clear ────────────────────────────────────────────────────────────────────
export async function clearAll(): Promise<void> {
    try {
        await Promise.all([
            SecureStore.deleteItemAsync(TOKEN_KEY),
            SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
            SecureStore.deleteItemAsync(USER_KEY),
        ]);
    } catch (error) {
        console.error('[TokenStorage] clearAll error:', error);
        throw error;
    }
}
