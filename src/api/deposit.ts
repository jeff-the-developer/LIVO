import apiClient from './client';
import type { ApiResponse } from '@app-types/api.types';
import type {
    DepositAddressResponse,
    DepositMethodsResponse,
    QRReceiveData,
    ReceiveSettings,
    FiatDepositMethodsResponse,
    BankDepositPayload,
    CardDepositPayload,
    RedeemCodePayload,
    FiatDepositResponse,
} from '@app-types/deposit.types';

// ─── Get Deposit Methods ────────────────────────────────────────────────────
export async function getDepositMethods(): Promise<ApiResponse<DepositMethodsResponse>> {
    const res = await apiClient.get<DepositMethodsResponse>('/deposit/methods');
    return { success: true, data: res.data };
}

// ─── Get Deposit Addresses ──────────────────────────────────────────────────
export async function getDepositAddresses(
    symbol: string,
): Promise<ApiResponse<DepositAddressResponse>> {
    const res = await apiClient.get<DepositAddressResponse>(`/deposit/addresses/${symbol}`);
    return { success: true, data: res.data };
}

// ─── Get Receive QR ─────────────────────────────────────────────────────────
export async function getReceiveQR(
    settings?: ReceiveSettings,
): Promise<ApiResponse<QRReceiveData>> {
    const res = await apiClient.get<QRReceiveData>('/deposit/receive-qr', { params: settings });
    return { success: true, data: res.data };
}

// ─── Create Receive Request ─────────────────────────────────────────────────
export async function createReceiveRequest(
    settings: ReceiveSettings,
): Promise<ApiResponse<QRReceiveData>> {
    const res = await apiClient.post<QRReceiveData>('/deposit/receive', settings);
    return { success: true, data: res.data };
}

// ─── Get Fiat Deposit Methods ────────────────────────────────────────────────
export async function getFiatDepositMethods(): Promise<ApiResponse<FiatDepositMethodsResponse>> {
    const res = await apiClient.get<FiatDepositMethodsResponse>('/deposit/fiat/methods');
    return { success: true, data: res.data };
}

// ─── Submit Bank Transfer Deposit ────────────────────────────────────────────
export async function submitBankDeposit(
    payload: BankDepositPayload,
): Promise<ApiResponse<FiatDepositResponse>> {
    const res = await apiClient.post<FiatDepositResponse>('/deposit/fiat/bank', payload);
    return { success: true, data: res.data };
}

// ─── Submit Card Deposit ─────────────────────────────────────────────────────
export async function submitCardDeposit(
    payload: CardDepositPayload,
): Promise<ApiResponse<FiatDepositResponse>> {
    const res = await apiClient.post<FiatDepositResponse>('/deposit/fiat/card', payload);
    return { success: true, data: res.data };
}

// ─── Redeem Deposit Code ─────────────────────────────────────────────────────
export async function redeemDepositCode(
    payload: RedeemCodePayload,
): Promise<ApiResponse<FiatDepositResponse>> {
    const res = await apiClient.post<FiatDepositResponse>('/deposit/fiat/redeem', payload);
    return { success: true, data: res.data };
}

// ─── Get Deposit History ────────────────────────────────────────────────────
export async function getDepositHistory(
    page?: number,
    limit?: number,
): Promise<ApiResponse<{ deposits: any[]; pagination: any }>> {
    const params: Record<string, number> = {};
    if (page !== undefined) params.page = page;
    if (limit !== undefined) params.limit = limit;
    const res = await apiClient.get('/deposit/history', {
        params: Object.keys(params).length ? params : undefined,
    });
    return { success: true, data: res.data };
}
