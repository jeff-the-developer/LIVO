import { useQuery } from '@tanstack/react-query';
import {
    getTransactions,
    getTransaction,
    type TransactionListParams,
} from '@api/transactions';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const txKeys = {
    all: ['transactions'] as const,
    list: (params?: TransactionListParams) => [...txKeys.all, 'list', params] as const,
    detail: (id: string) => [...txKeys.all, 'detail', id] as const,
};

// ─── Transaction List ────────────────────────────────────────────────────────
export function useTransactions(params?: TransactionListParams) {
    return useQuery({
        queryKey: txKeys.list(params),
        queryFn: () => getTransactions(params),
        select: (d) => d.data,
        staleTime: 30_000,
    });
}

// ─── Transaction Detail ──────────────────────────────────────────────────────
export function useTransactionDetail(id: string) {
    return useQuery({
        queryKey: txKeys.detail(id),
        queryFn: () => getTransaction(id),
        select: (d) => d.data,
        staleTime: 30_000,
        enabled: !!id,
    });
}
