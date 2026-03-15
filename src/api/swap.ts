import apiClient from './client';
import type { ApiResponse } from '@app-types/api.types';
import type {
    SwapPairsResponse,
    SwapQuote,
    SwapRequest,
    SwapResponse,
    SwapRecordsResponse,
} from '@app-types/swap.types';

// ─── Get Swap Pairs ─────────────────────────────────────────────────────────
export async function getSwapPairs(): Promise<ApiResponse<SwapPairsResponse>> {
    const res = await apiClient.get<SwapPairsResponse>('/swap/pairs');
    return { success: true, data: res.data };
}

// ─── Get Swap Quote ─────────────────────────────────────────────────────────
export async function getSwapQuote(
    from: string,
    to: string,
    amount: string,
): Promise<ApiResponse<SwapQuote>> {
    const res = await apiClient.get<SwapQuote>('/swap/quote', {
        params: { from, to, amount },
    });
    return { success: true, data: res.data };
}

// ─── Execute Swap ───────────────────────────────────────────────────────────
export async function executeSwap(
    payload: SwapRequest,
): Promise<ApiResponse<SwapResponse>> {
    const res = await apiClient.post<SwapResponse>('/swap/execute', payload);
    return { success: true, data: res.data };
}

// ─── Get Swap Records ───────────────────────────────────────────────────────
export async function getSwapRecords(
    page?: number,
    limit?: number,
): Promise<ApiResponse<SwapRecordsResponse>> {
    const params: Record<string, number> = {};
    if (page !== undefined) params.page = page;
    if (limit !== undefined) params.limit = limit;
    const res = await apiClient.get<SwapRecordsResponse>('/swap/records', {
        params: Object.keys(params).length ? params : undefined,
    });
    return { success: true, data: res.data };
}

// ─── Get Swap Rate ──────────────────────────────────────────────────────────
export async function getSwapRate(
    from: string,
    to: string,
): Promise<ApiResponse<{ rate: string }>> {
    const res = await apiClient.get<{ rate: string }>('/swap/rate', {
        params: { from, to },
    });
    return { success: true, data: res.data };
}
