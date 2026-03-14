import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getSendMethods,
    searchRecipients,
    directTransfer,
    quickTransfer,
    cryptoTransfer,
    bankTransfer,
    getTransferPreview,
    getTransferHistory,
    qrPayment,
} from '@api/send';
import type {
    DirectTransferRequest,
    QuickTransferRequest,
    CryptoTransferRequest,
    BankTransferRequest,
    QRPaymentRequest,
} from '@app-types/send.types';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const sendKeys = {
    all: ['send'] as const,
    methods: () => [...sendKeys.all, 'methods'] as const,
    search: (query: string) => [...sendKeys.all, 'search', query] as const,
    preview: (txId: string) => [...sendKeys.all, 'preview', txId] as const,
    history: (page?: number, limit?: number) => [...sendKeys.all, 'history', page, limit] as const,
};

// ─── Send Methods ────────────────────────────────────────────────────────────
export function useSendMethods() {
    return useQuery({
        queryKey: sendKeys.methods(),
        queryFn: getSendMethods,
        select: (d) => d.data,
        staleTime: 30_000,
    });
}

// ─── Search Recipients ───────────────────────────────────────────────────────
export function useSearchRecipients(query: string) {
    return useQuery({
        queryKey: sendKeys.search(query),
        queryFn: () => searchRecipients(query),
        select: (d) => d.data,
        staleTime: 30_000,
        enabled: query.length >= 2,
    });
}

// ─── Direct Transfer ─────────────────────────────────────────────────────────
export function useDirectTransfer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: DirectTransferRequest) => directTransfer(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sendKeys.history() });
        },
    });
}

// ─── Quick Transfer ──────────────────────────────────────────────────────────
export function useQuickTransfer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: QuickTransferRequest) => quickTransfer(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sendKeys.history() });
        },
    });
}

// ─── Crypto Transfer ─────────────────────────────────────────────────────────
export function useCryptoTransfer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CryptoTransferRequest) => cryptoTransfer(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sendKeys.history() });
        },
    });
}

// ─── Bank Transfer ───────────────────────────────────────────────────────────
export function useBankTransfer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: BankTransferRequest) => bankTransfer(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sendKeys.history() });
        },
    });
}

// ─── Transfer Preview ────────────────────────────────────────────────────────
export function useTransferPreview(txId: string) {
    return useQuery({
        queryKey: sendKeys.preview(txId),
        queryFn: () => getTransferPreview(txId),
        select: (d) => d.data,
        staleTime: 30_000,
        enabled: !!txId,
    });
}

// ─── Transfer History ────────────────────────────────────────────────────────
export function useTransferHistory(page?: number, limit?: number) {
    return useQuery({
        queryKey: sendKeys.history(page, limit),
        queryFn: () => getTransferHistory(page, limit),
        select: (d) => d.data,
        staleTime: 30_000,
    });
}

// ─── QR Payment ──────────────────────────────────────────────────────────────
export function useQRPayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: QRPaymentRequest) => qrPayment(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sendKeys.history() });
        },
    });
}
