import apiClient from './client';
import type { ApiResponse } from '@app-types/api.types';
import type {
    SendMethodsResponse,
    RecipientSearchResult,
    RecipientSearchResponse,
    DirectTransferRequest,
    QuickTransferRequest,
    CryptoTransferRequest,
    BankTransferRequest,
    QRPaymentRequest,
    TransferResponse,
    TransferPreview,
    TransferHistoryResponse,
} from '@app-types/send.types';

// ─── Get Send Methods ────────────────────────────────────────────────────────
export async function getSendMethods(): Promise<ApiResponse<SendMethodsResponse>> {
    const res = await apiClient.get<SendMethodsResponse>('/send/methods');
    return { success: true, data: res.data };
}

// ─── Search Recipients ───────────────────────────────────────────────────────
export async function searchRecipients(
    query: string,
): Promise<ApiResponse<RecipientSearchResponse>> {
    const res = await apiClient.get<RecipientSearchResult[]>('/send/search', {
        params: { query },
    });
    return { success: true, data: { recipients: res.data } };
}

// ─── Direct Transfer ─────────────────────────────────────────────────────────
export async function directTransfer(
    payload: DirectTransferRequest,
): Promise<ApiResponse<TransferResponse>> {
    const res = await apiClient.post<TransferResponse>('/send/direct', payload);
    return { success: true, data: res.data };
}

// ─── Quick Transfer ──────────────────────────────────────────────────────────
export async function quickTransfer(
    payload: QuickTransferRequest,
): Promise<ApiResponse<TransferResponse>> {
    const res = await apiClient.post<TransferResponse>('/send/quick', payload);
    return { success: true, data: res.data };
}

// ─── Crypto Transfer ─────────────────────────────────────────────────────────
export async function cryptoTransfer(
    payload: CryptoTransferRequest,
): Promise<ApiResponse<TransferResponse>> {
    const res = await apiClient.post<TransferResponse>('/send/crypto', payload);
    return { success: true, data: res.data };
}

// ─── Bank Transfer ───────────────────────────────────────────────────────────
export async function bankTransfer(
    payload: BankTransferRequest,
): Promise<ApiResponse<TransferResponse>> {
    const res = await apiClient.post<TransferResponse>('/send/bank', payload);
    return { success: true, data: res.data };
}

// ─── Transfer Preview ────────────────────────────────────────────────────────
export async function getTransferPreview(
    txId: string,
): Promise<ApiResponse<TransferPreview>> {
    const res = await apiClient.get<TransferPreview>(`/send/${txId}/preview`);
    return { success: true, data: res.data };
}

// ─── Transfer History ────────────────────────────────────────────────────────
export async function getTransferHistory(
    page?: number,
    limit?: number,
): Promise<ApiResponse<TransferHistoryResponse>> {
    const params: Record<string, number> = {};
    if (page !== undefined) params.page = page;
    if (limit !== undefined) params.limit = limit;
    const res = await apiClient.get<TransferHistoryResponse>('/send/history', {
        params: Object.keys(params).length ? params : undefined,
    });
    return { success: true, data: res.data };
}

// ─── QR Payment ──────────────────────────────────────────────────────────────
export async function qrPayment(
    payload: QRPaymentRequest,
): Promise<ApiResponse<TransferResponse>> {
    const res = await apiClient.post<TransferResponse>('/send/qr', payload);
    return { success: true, data: res.data };
}
