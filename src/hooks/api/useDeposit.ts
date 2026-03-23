import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getDepositMethods,
    getDepositAddresses,
    getReceiveQR,
    createReceiveRequest,
    getFiatDepositMethods,
    submitBankDeposit,
    submitCardDeposit,
    redeemDepositCode,
} from '@api/deposit';
import type {
    ReceiveSettings,
    BankDepositPayload,
    CardDepositPayload,
    RedeemCodePayload,
} from '@app-types/deposit.types';
import { txKeys } from '@hooks/api/useTransactions';
import { walletKeys } from '@hooks/api/useWallet';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const depositKeys = {
    all: ['deposit'] as const,
    methods: () => [...depositKeys.all, 'methods'] as const,
    fiatMethods: () => [...depositKeys.all, 'fiat-methods'] as const,
    addresses: (symbol: string) => [...depositKeys.all, 'addresses', symbol] as const,
    receiveQR: (settings?: ReceiveSettings) => [...depositKeys.all, 'receive-qr', settings] as const,
};

function invalidateAfterDeposit(queryClient: ReturnType<typeof useQueryClient>) {
    queryClient.invalidateQueries({ queryKey: depositKeys.all });
    queryClient.invalidateQueries({ queryKey: txKeys.all });
    queryClient.invalidateQueries({ queryKey: walletKeys.all });
}

// ─── Deposit Methods ────────────────────────────────────────────────────────
export function useDepositMethods() {
    return useQuery({
        queryKey: depositKeys.methods(),
        queryFn: getDepositMethods,
        select: (d) => d.data,
        staleTime: 30_000,
    });
}

// ─── Deposit Addresses ──────────────────────────────────────────────────────
export function useDepositAddresses(symbol: string) {
    return useQuery({
        queryKey: depositKeys.addresses(symbol),
        queryFn: () => getDepositAddresses(symbol),
        select: (d) => d.data,
        staleTime: 30_000,
        enabled: !!symbol,
    });
}

// ─── Receive QR ─────────────────────────────────────────────────────────────
export function useReceiveQR(settings?: ReceiveSettings) {
    return useQuery({
        queryKey: depositKeys.receiveQR(settings),
        queryFn: () => getReceiveQR(settings),
        select: (d) => d.data,
        staleTime: 30_000,
    });
}

// ─── Create Receive Request ─────────────────────────────────────────────────
export function useCreateReceiveRequest() {
    return useMutation({
        mutationFn: (settings: ReceiveSettings) => createReceiveRequest(settings),
    });
}

// ─── Fiat Deposit Methods ────────────────────────────────────────────────────
export function useFiatDepositMethods() {
    return useQuery({
        queryKey: depositKeys.fiatMethods(),
        queryFn: getFiatDepositMethods,
        select: (d) => d.data.methods,
        staleTime: 60_000,
    });
}

// ─── Submit Bank Deposit ─────────────────────────────────────────────────────
export function useSubmitBankDeposit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: BankDepositPayload) => submitBankDeposit(payload),
        onSuccess: () => invalidateAfterDeposit(queryClient),
    });
}

// ─── Submit Card Deposit ─────────────────────────────────────────────────────
export function useSubmitCardDeposit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CardDepositPayload) => submitCardDeposit(payload),
        onSuccess: () => invalidateAfterDeposit(queryClient),
    });
}

// ─── Redeem Deposit Code ─────────────────────────────────────────────────────
export function useRedeemCode() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: RedeemCodePayload) => redeemDepositCode(payload),
        onSuccess: () => invalidateAfterDeposit(queryClient),
    });
}
