import { create } from 'zustand';
import type { SupportedCurrency } from '@utils/currency';

// ─── Types ────────────────────────────────────────────────────────────────────
type AppTheme = 'dark' | 'light';
type AppLanguage = 'en' | 'zh-TW' | 'zh-CN' | 'ja';

interface AppState {
    theme: AppTheme;
    language: AppLanguage;
    currency: SupportedCurrency;
    isMaintenanceMode: boolean;
}

interface AppActions {
    setTheme(theme: AppTheme): void;
    setLanguage(language: AppLanguage): void;
    setCurrency(currency: SupportedCurrency): void;
    setMaintenanceMode(value: boolean): void;
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAppStore = create<AppState & AppActions>((set) => ({
    theme: 'dark',
    language: 'en',
    currency: 'USD',
    isMaintenanceMode: false,

    setTheme: (theme) => set({ theme }),
    setLanguage: (language) => set({ language }),
    setCurrency: (currency) => set({ currency }),
    setMaintenanceMode: (value) => set({ isMaintenanceMode: value }),
}));
