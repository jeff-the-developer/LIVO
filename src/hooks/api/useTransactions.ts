import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
    getTransactions,
    getTransaction,
    type TransactionListParams,
} from '@api/transactions';
import type { TransactionListResponse } from '@app-types/transaction.types';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const txKeys = {
    all: ['transactions'] as const,
    list: (params?: TransactionListParams) => [...txKeys.all, 'list', params] as const,
    infiniteList: (params?: Omit<TransactionListParams, 'page'>) => [...txKeys.all, 'infinite-list', params] as const,
    detail: (id: string) => [...txKeys.all, 'detail', id] as const,
};

// ─── Transaction List ────────────────────────────────────────────────────────
interface UseTransactionsOptions {
    enabled?: boolean;
}

export function useTransactions(
    params?: TransactionListParams,
    options?: UseTransactionsOptions,
) {
    return useQuery({
        queryKey: txKeys.list(params),
        queryFn: () => getTransactions(params),
        select: (d) => d.data,
        staleTime: 30_000,
        enabled: options?.enabled ?? true,
    });
}

export function useInfiniteTransactions(params?: Omit<TransactionListParams, 'page'>) {
    return useInfiniteQuery({
        queryKey: txKeys.infiniteList(params),
        queryFn: ({ pageParam }) => getTransactions({ ...params, page: pageParam }).then((d) => d.data),
        initialPageParam: 1,
        staleTime: 30_000,
        getNextPageParam: (lastPage: TransactionListResponse) =>
            lastPage.pagination.has_more ? lastPage.pagination.page + 1 : undefined,
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
