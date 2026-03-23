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

// ─── Transfer shape from /send/history ──────────────────────────────────────
interface TransferRecord {
    id: string;
    user_id: string;
    type: string;
    recipient_id?: string;
    amount: string;
    currency: string;
    fee: string;
    status: string;
    remark?: string;
    reference: string;
    created_at: string;
}

interface TransferHistoryResponse {
    transfers: TransferRecord[];
    pagination: { total: number; page: number; limit: number; has_more: boolean };
}

const TRANSFER_HISTORY_TYPES: TxType[] = ['transfer', 'withdrawal'];

function mapTransferToTransaction(t: TransferRecord): Transaction {
    const typeLabel = t.type === 'direct' ? 'transfer' : t.type === 'crypto' ? 'withdrawal' : 'transfer';
    const toLabel = t.type === 'direct'
        ? `Direct Transfer`
        : t.type === 'crypto'
            ? `Crypto Withdrawal`
            : t.type === 'bank'
                ? `Bank Transfer`
                : `Transfer`;
    return {
        id: t.id,
        user_id: t.user_id,
        type: typeLabel as TxType,
        status: (t.status === 'settled' ? 'settled' : 'pending') as TxStatus,
        amount: t.amount,
        fee: t.fee || '0',
        currency: t.currency,
        from: 'Wallet',
        to: toLabel,
        timestamp: t.created_at,
        reference: t.reference,
        notes: t.remark || '',
    };
}

function shouldFetchTransferHistory(type?: TxType): boolean {
    return !type || TRANSFER_HISTORY_TYPES.includes(type);
}

function filterMergedTransactions(
    transactions: Transaction[],
    params?: TransactionListParams,
): Transaction[] {
    return transactions.filter((transaction) => {
        if (params?.type && transaction.type !== params.type) return false;
        if (params?.status && transaction.status !== params.status) return false;
        return true;
    });
}

// ─── Get Transactions (merged with transfer history) ────────────────────────
export async function getTransactions(
    params?: TransactionListParams,
): Promise<ApiResponse<TransactionListResponse>> {
    const page = Math.max(params?.page ?? 1, 1);
    const limit = Math.max(params?.limit ?? 20, 1);
    const mergedWindowSize = page * limit;

    const [txRes, transferRes] = await Promise.all([
        apiClient.get<TransactionListResponse>('/transactions', {
            params: {
                ...params,
                page: 1,
                limit: mergedWindowSize,
            },
        }),
        shouldFetchTransferHistory(params?.type)
            ? apiClient.get<TransferHistoryResponse>('/send/history', {
                params: { page: 1, limit: mergedWindowSize },
            }).catch(() => null)
            : Promise.resolve(null),
    ]);

    const transactions = txRes.data.transactions ?? [];
    const transfers = (transferRes?.data?.transfers ?? [])
        .map(mapTransferToTransaction);

    // Fetching the first N rows from both feeds lets us produce a coherent
    // merged page without changing backend contracts.
    const merged = filterMergedTransactions(
        [...transactions, ...transfers],
        params,
    ).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    const start = (page - 1) * limit;
    const end = start + limit;
    const sliced = merged.slice(start, end);
    const txHasMore = txRes.data.pagination?.has_more ?? false;
    const transferHasMore = transferRes?.data?.pagination?.has_more ?? false;

    return {
        success: true,
        data: {
            transactions: sliced,
            pagination: {
                total: merged.length,
                page,
                limit,
                has_more: merged.length > end || txHasMore || transferHasMore,
            },
        },
    };
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
