import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@utils/errorHandler';
import {
    getKYCOverview,
    getKYCPrivileges,
    submitKYCLevel0,
    submitKYCLevel1Individual,
    submitKYCLevel1Corporate,
    submitKYCLevel2,
    submitKYCLevel3,
    getCountries,
    deriveKYCStatusFromOverview,
    type KYCLevel1IndividualPayload,
    type KYCLevel1CorporatePayload,
    type KYCLevel2Payload,
    type KYCLevel3Payload,
} from '@api/kyc';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const kycKeys = {
    all: ['kyc'] as const,
    overview: ['kyc', 'overview'] as const,
    privileges: ['kyc', 'privileges'] as const,
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

// ─── Get KYC Status (derived — current level's status for ProfileScreen) ──────
export function useKYCStatus() {
    return useQuery({
        queryKey: kycKeys.overview,
        queryFn: getKYCOverview,
        select: (data) => deriveKYCStatusFromOverview(data.data),
    });
}

// ─── Submit KYC Level 0 ───────────────────────────────────────────────────────
export function useSubmitKYCLevel0() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: submitKYCLevel0,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: kycKeys.overview });
        },
    });
}

// ─── Submit KYC Level 1 — Individual ─────────────────────────────────────────
export function useSubmitKYCLevel1Individual() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: KYCLevel1IndividualPayload) =>
            submitKYCLevel1Individual(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: kycKeys.overview });
        },
    });
}

// ─── Submit KYC Level 1 — Corporate ──────────────────────────────────────────
export function useSubmitKYCLevel1Corporate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: KYCLevel1CorporatePayload) =>
            submitKYCLevel1Corporate(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: kycKeys.overview });
        },
    });
}

// ─── Submit KYC Level 2 ───────────────────────────────────────────────────────
export function useSubmitKYCLevel2() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: KYCLevel2Payload) => submitKYCLevel2(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: kycKeys.overview });
        },
    });
}

// ─── Submit KYC Level 3 ───────────────────────────────────────────────────────
export function useSubmitKYCLevel3() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: KYCLevel3Payload) => submitKYCLevel3(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: kycKeys.overview });
        },
    });
}

// ─── Get KYC Privileges (static tier → privilege map, no user context) ────────
export function useKYCPrivileges() {
    return useQuery({
        queryKey: kycKeys.privileges,
        queryFn: getKYCPrivileges,
        select: (data) => data.data,
        staleTime: 1000 * 60 * 60, // Static data — cache for 1 hour
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
