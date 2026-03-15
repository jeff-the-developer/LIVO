import { useQuery, useMutation } from '@tanstack/react-query';
import {
    getDepositMethods,
    getDepositAddresses,
    getReceiveQR,
    createReceiveRequest,
} from '@api/deposit';
import type { ReceiveSettings } from '@app-types/deposit.types';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const depositKeys = {
    all: ['deposit'] as const,
    methods: () => [...depositKeys.all, 'methods'] as const,
    addresses: (symbol: string) => [...depositKeys.all, 'addresses', symbol] as const,
    receiveQR: (settings?: ReceiveSettings) => [...depositKeys.all, 'receive-qr', settings] as const,
};

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
