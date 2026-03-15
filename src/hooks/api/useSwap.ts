import { useQuery, useMutation } from '@tanstack/react-query';
import {
    getSwapPairs,
    getSwapQuote,
    executeSwap,
    getSwapRecords,
    getSwapRate,
} from '@api/swap';
import type { SwapRequest } from '@app-types/swap.types';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const swapKeys = {
    all: ['swap'] as const,
    pairs: () => [...swapKeys.all, 'pairs'] as const,
    quote: (from: string, to: string, amount: string) =>
        [...swapKeys.all, 'quote', from, to, amount] as const,
    records: (page?: number, limit?: number) =>
        [...swapKeys.all, 'records', page, limit] as const,
    rate: (from: string, to: string) =>
        [...swapKeys.all, 'rate', from, to] as const,
};

// ─── Swap Pairs ─────────────────────────────────────────────────────────────
export function useSwapPairs() {
    return useQuery({
        queryKey: swapKeys.pairs(),
        queryFn: getSwapPairs,
        select: (d) => d.data,
        staleTime: 30_000,
    });
}

// ─── Swap Quote ─────────────────────────────────────────────────────────────
export function useSwapQuote(from: string, to: string, amount: string) {
    return useQuery({
        queryKey: swapKeys.quote(from, to, amount),
        queryFn: () => getSwapQuote(from, to, amount),
        select: (d) => d.data,
        staleTime: 10_000,
        enabled: !!from && !!to && parseFloat(amount) > 0,
    });
}

// ─── Execute Swap ───────────────────────────────────────────────────────────
export function useExecuteSwap() {
    return useMutation({
        mutationFn: (payload: SwapRequest) => executeSwap(payload),
    });
}

// ─── Swap Records ───────────────────────────────────────────────────────────
export function useSwapRecords(page?: number, limit?: number) {
    return useQuery({
        queryKey: swapKeys.records(page, limit),
        queryFn: () => getSwapRecords(page, limit),
        select: (d) => d.data,
        staleTime: 30_000,
    });
}

// ─── Swap Rate ──────────────────────────────────────────────────────────────
export function useSwapRate(from: string, to: string) {
    return useQuery({
        queryKey: swapKeys.rate(from, to),
        queryFn: () => getSwapRate(from, to),
        select: (d) => d.data,
        staleTime: 10_000,
        enabled: !!from && !!to,
    });
}
