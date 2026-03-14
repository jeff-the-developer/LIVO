import { useQuery } from '@tanstack/react-query';
import {
    getWalletDashboard,
    getWalletAssets,
    getWalletAsset,
    getWalletLedger,
    getExchangeRates,
    type LedgerParams,
} from '@api/wallet';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const walletKeys = {
    all: ['wallet'] as const,
    dashboard: (currency?: string) => [...walletKeys.all, 'dashboard', currency] as const,
    assets: (sort?: string, type?: string) => [...walletKeys.all, 'assets', sort, type] as const,
    asset: (symbol: string) => [...walletKeys.all, 'asset', symbol] as const,
    ledger: (params?: LedgerParams) => [...walletKeys.all, 'ledger', params] as const,
    rates: (base?: string) => [...walletKeys.all, 'rates', base] as const,
};

// ─── Wallet Dashboard ────────────────────────────────────────────────────────
export function useWalletDashboard(currency?: string) {
    return useQuery({
        queryKey: walletKeys.dashboard(currency),
        queryFn: () => getWalletDashboard(currency),
        select: (d) => d.data,
        staleTime: 30_000,
    });
}

// ─── Wallet Assets ───────────────────────────────────────────────────────────
export function useWalletAssets(sort?: string, type?: string) {
    return useQuery({
        queryKey: walletKeys.assets(sort, type),
        queryFn: () => getWalletAssets(sort, type),
        select: (d) => d.data,
        staleTime: 30_000,
    });
}

// ─── Single Asset ────────────────────────────────────────────────────────────
export function useWalletAsset(symbol: string) {
    return useQuery({
        queryKey: walletKeys.asset(symbol),
        queryFn: () => getWalletAsset(symbol),
        select: (d) => d.data,
        staleTime: 30_000,
        enabled: !!symbol,
    });
}

// ─── Wallet Ledger ───────────────────────────────────────────────────────────
export function useWalletLedger(params?: LedgerParams) {
    return useQuery({
        queryKey: walletKeys.ledger(params),
        queryFn: () => getWalletLedger(params),
        select: (d) => d.data,
        staleTime: 30_000,
    });
}

// ─── Exchange Rates ──────────────────────────────────────────────────────────
export function useExchangeRates(base?: string) {
    return useQuery({
        queryKey: walletKeys.rates(base),
        queryFn: () => getExchangeRates(base),
        select: (d) => d.data,
        staleTime: 30_000,
    });
}
