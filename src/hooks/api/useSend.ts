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
import { txKeys } from '@hooks/api/useTransactions';
import { walletKeys } from '@hooks/api/useWallet';
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
    const trimmed = query.trim();
    return useQuery({
        queryKey: sendKeys.search(trimmed),
        queryFn: () => searchRecipients(trimmed),
        select: (d) => {
            const inner = d.data;
            // Backend returns a plain array; normalize to { recipients: [...] }
            if (Array.isArray(inner)) return { recipients: inner };
            return inner;
        },
        staleTime: 30_000,
        enabled: trimmed.length >= 1,
        /** Smooth list updates while typing (no flash to empty between queries) */
        placeholderData: (previousData) => previousData,
    });
}

// Invalidate all transfer-related caches after any send
function invalidateAfterTransfer(queryClient: ReturnType<typeof useQueryClient>) {
    queryClient.invalidateQueries({ queryKey: sendKeys.history() });
    queryClient.invalidateQueries({ queryKey: txKeys.all });
    queryClient.invalidateQueries({ queryKey: walletKeys.all });
}

// ─── Direct Transfer ─────────────────────────────────────────────────────────
export function useDirectTransfer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: DirectTransferRequest) => directTransfer(payload),
        onSuccess: () => invalidateAfterTransfer(queryClient),
    });
}

// ─── Quick Transfer ──────────────────────────────────────────────────────────
export function useQuickTransfer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: QuickTransferRequest) => quickTransfer(payload),
        onSuccess: () => invalidateAfterTransfer(queryClient),
    });
}

// ─── Crypto Transfer ─────────────────────────────────────────────────────────
export function useCryptoTransfer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CryptoTransferRequest) => cryptoTransfer(payload),
        onSuccess: () => invalidateAfterTransfer(queryClient),
    });
}

// ─── Bank Transfer ───────────────────────────────────────────────────────────
export function useBankTransfer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: BankTransferRequest) => bankTransfer(payload),
        onSuccess: () => invalidateAfterTransfer(queryClient),
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
        onSuccess: () => invalidateAfterTransfer(queryClient),
    });
}
