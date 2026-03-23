import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { SupportedCurrency } from '@utils/currency';
import i18n, { LANGUAGE_CODES } from '@i18n';

// ─── Types ────────────────────────────────────────────────────────────────────
export type AppTheme = 'light' | 'system';
export type AppLanguage =
    | 'English' | 'Spanish' | 'French' | 'German'
    | 'Portuguese' | 'Chinese' | 'Japanese' | 'Korean';
export type ChangeBasis = '24h' | 'utc';
export type DisplayMode = 'available' | 'total';
export type AssetTypeFilter = 'all' | 'fiat' | 'crypto';

interface DisplaySettings {
    theme: AppTheme;
    language: AppLanguage;
    currency: SupportedCurrency;
    changeBasis: ChangeBasis;
    displayMode: DisplayMode;
    assetTypeFilter: AssetTypeFilter;
}

interface AppState extends DisplaySettings {
    isMaintenanceMode: boolean;
    isHydrated: boolean;
}

interface AppActions {
    setTheme(theme: AppTheme): void;
    setLanguage(language: AppLanguage): void;
    setCurrency(currency: SupportedCurrency): void;
    setChangeBasis(basis: ChangeBasis): void;
    setDisplayMode(mode: DisplayMode): void;
    setAssetTypeFilter(filter: AssetTypeFilter): void;
    setMaintenanceMode(value: boolean): void;
    hydrate(): Promise<void>;
}

// ─── Persistence ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'livo_display_settings';

const DEFAULTS: DisplaySettings = {
    theme: 'light',
    language: 'English',
    currency: 'USD',
    changeBasis: '24h',
    displayMode: 'available',
    assetTypeFilter: 'all',
};

async function saveDisplaySettings(settings: DisplaySettings): Promise<void> {
    try {
        await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
}

async function loadDisplaySettings(): Promise<DisplaySettings | null> {
    try {
        const raw = await SecureStore.getItemAsync(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as DisplaySettings;
    } catch {
        return null;
    }
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAppStore = create<AppState & AppActions>((set, get) => ({
    ...DEFAULTS,
    isMaintenanceMode: false,
    isHydrated: false,

    setTheme(theme) {
        set({ theme });
        const { language, currency, changeBasis, displayMode, assetTypeFilter } = get();
        saveDisplaySettings({ theme, language, currency, changeBasis, displayMode, assetTypeFilter });
    },

    setLanguage(language) {
        set({ language });
        const { theme, currency, changeBasis, displayMode, assetTypeFilter } = get();
        saveDisplaySettings({ theme, language, currency, changeBasis, displayMode, assetTypeFilter });
        void i18n.changeLanguage(LANGUAGE_CODES[language]);
    },

    setCurrency(currency) {
        set({ currency });
        const { theme, language, changeBasis, displayMode, assetTypeFilter } = get();
        saveDisplaySettings({ theme, language, currency, changeBasis, displayMode, assetTypeFilter });
    },

    setChangeBasis(changeBasis) {
        set({ changeBasis });
        const { theme, language, currency, displayMode, assetTypeFilter } = get();
        saveDisplaySettings({ theme, language, currency, changeBasis, displayMode, assetTypeFilter });
    },

    setDisplayMode(displayMode) {
        set({ displayMode });
        const { theme, language, currency, changeBasis, assetTypeFilter } = get();
        saveDisplaySettings({ theme, language, currency, changeBasis, displayMode, assetTypeFilter });
    },

    setAssetTypeFilter(assetTypeFilter) {
        set({ assetTypeFilter });
        const { theme, language, currency, changeBasis, displayMode } = get();
        saveDisplaySettings({ theme, language, currency, changeBasis, displayMode, assetTypeFilter });
    },

    setMaintenanceMode(value) {
        set({ isMaintenanceMode: value });
    },

    async hydrate() {
        const saved = await loadDisplaySettings();
        const settings = saved ?? DEFAULTS;
        set({ ...settings, isHydrated: true });
        void i18n.changeLanguage(LANGUAGE_CODES[settings.language]);
    },
}));
