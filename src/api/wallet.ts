import apiClient from './client';
import type { ApiResponse } from '@app-types/api.types';
import type {
    WalletDashboard,
    WalletAssetsResponse,
    WalletAsset,
    LedgerResponse,
    ExchangeRatesResponse,
    DisplayPrefs,
} from '@app-types/wallet.types';

// ─── Get Wallet Dashboard ────────────────────────────────────────────────────
export async function getWalletDashboard(
    currency?: string,
): Promise<ApiResponse<WalletDashboard>> {
    const params = currency ? { currency } : undefined;
    const res = await apiClient.get<WalletDashboard>('/wallet/dashboard', { params });
    return { success: true, data: res.data };
}

// ─── Get Wallet Assets ───────────────────────────────────────────────────────
export async function getWalletAssets(
    sort?: string,
    type?: string,
): Promise<ApiResponse<WalletAssetsResponse>> {
    const params: Record<string, string> = {};
    if (sort) params.sort = sort;
    if (type) params.type = type;
    const res = await apiClient.get<WalletAssetsResponse>('/wallet/assets', {
        params: Object.keys(params).length ? params : undefined,
    });
    return { success: true, data: res.data };
}

// ─── Get Single Asset ────────────────────────────────────────────────────────
export async function getWalletAsset(
    symbol: string,
): Promise<ApiResponse<WalletAsset>> {
    const res = await apiClient.get<WalletAsset>(`/wallet/assets/${symbol}`);
    return { success: true, data: res.data };
}

// ─── Get Wallet Ledger ───────────────────────────────────────────────────────
export interface LedgerParams {
    page?: number;
    limit?: number;
    asset?: string;
}

export async function getWalletLedger(
    params?: LedgerParams,
): Promise<ApiResponse<LedgerResponse>> {
    const res = await apiClient.get<LedgerResponse>('/wallet/ledger', { params });
    return { success: true, data: res.data };
}

// ─── Get Exchange Rates ──────────────────────────────────────────────────────
export async function getExchangeRates(
    base?: string,
): Promise<ApiResponse<ExchangeRatesResponse>> {
    const params = base ? { base } : undefined;
    const res = await apiClient.get<ExchangeRatesResponse>('/wallet/exchange-rates', { params });
    return { success: true, data: res.data };
}

// ─── Update Display Preferences ─────────────────────────────────────────────
export async function updateDisplayPrefs(
    prefs: DisplayPrefs,
): Promise<ApiResponse<DisplayPrefs>> {
    const res = await apiClient.put<DisplayPrefs>('/wallet/display', prefs);
    return { success: true, data: res.data };
}
