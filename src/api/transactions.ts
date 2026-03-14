import apiClient from './client';
import type { ApiResponse } from '@app-types/api.types';
import type {
    Transaction,
    TransactionListResponse,
    TxType,
    TxStatus,
} from '@app-types/transaction.types';

// ─── Params ──────────────────────────────────────────────────────────────────
export interface TransactionListParams {
    page?: number;
    limit?: number;
    type?: TxType;
    status?: TxStatus;
}

export interface TransactionSearchParams extends TransactionListParams {
    query?: string;
    from_date?: string;
    to_date?: string;
}

// ─── Get Transactions ────────────────────────────────────────────────────────
export async function getTransactions(
    params?: TransactionListParams,
): Promise<ApiResponse<TransactionListResponse>> {
    const res = await apiClient.get<TransactionListResponse>('/transactions', { params });
    return { success: true, data: res.data };
}

// ─── Get Single Transaction ──────────────────────────────────────────────────
export async function getTransaction(
    id: string,
): Promise<ApiResponse<Transaction>> {
    const res = await apiClient.get<Transaction>(`/transactions/${id}`);
    return { success: true, data: res.data };
}

// ─── Search Transactions ─────────────────────────────────────────────────────
export async function searchTransactions(
    params?: TransactionSearchParams,
): Promise<ApiResponse<TransactionListResponse>> {
    const res = await apiClient.get<TransactionListResponse>('/transactions/search', { params });
    return { success: true, data: res.data };
}
