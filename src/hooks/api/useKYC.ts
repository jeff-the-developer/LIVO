import { useMutation, useQuery } from '@tanstack/react-query';
import { handleApiError } from '@utils/errorHandler';
import {
    getKYCOverview,
    startKYC,
    getKYCStatus,
    submitDocument,
    getCountries,
    type StartKYCPayload,
    type SubmitDocumentPayload,
} from '@api/kyc';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const kycKeys = {
    all: ['kyc'] as const,
    overview: ['kyc', 'overview'] as const,
    status: ['kyc', 'status'] as const,
    countries: ['kyc', 'countries'] as const,
};

// ─── Get KYC Overview (levels, privileges, requirements) ──────────────────────
export function useKYCOverview() {
    return useQuery({
        queryKey: kycKeys.overview,
        queryFn: getKYCOverview,
        select: (data) => data.data,
    });
}

// ─── Start KYC Verification ───────────────────────────────────────────────────
export function useStartKYC() {
    return useMutation({
        mutationFn: (payload: StartKYCPayload) => startKYC(payload),
    });
}

// ─── Get KYC Status ───────────────────────────────────────────────────────────
export function useKYCStatus() {
    return useQuery({
        queryKey: kycKeys.status,
        queryFn: getKYCStatus,
        select: (data) => data.data,
    });
}

// ─── Submit Document ──────────────────────────────────────────────────────────
export function useSubmitDocument() {
    return useMutation({
        mutationFn: (payload: SubmitDocumentPayload) => submitDocument(payload),
    });
}

// ─── Get Countries ────────────────────────────────────────────────────────────
export function useCountries() {
    return useQuery({
        queryKey: kycKeys.countries,
        queryFn: getCountries,
        select: (data) => data.data,
        staleTime: 1000 * 60 * 60, // Cache for 1 hour
    });
}

// ─── Error Helper (re-export) ─────────────────────────────────────────────────
export { handleApiError };
