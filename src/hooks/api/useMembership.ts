// ─── Membership Hooks ────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
    MembershipTierData, 
    GetMembershipResponse, 
    UpgradeRequest, 
    UpgradeResponse, 
    BenefitInfoModal, 
    MembershipTier 
} from '@app-types/membership.types';
import type { ApiResponse } from '@app-types/api.types';
import { 
    getMembershipTiers, 
    getCurrentMembership, 
    upgradeMembership, 
    getBenefitInfo, 
    getUpgradeOptions 
} from '@api/membership';

// ─── Query Keys ──────────────────────────────────────────────────────────────
const membershipKeys = {
    all: ['membership'] as const,
    tiers: () => [...membershipKeys.all, 'tiers'] as const,
    current: () => [...membershipKeys.all, 'current'] as const,
    benefitInfo: () => [...membershipKeys.all, 'benefit-info'] as const,
    upgradeOptions: (tier: MembershipTier) => [...membershipKeys.all, 'upgrade-options', tier] as const,
};

// ─── Get All Membership Tiers ────────────────────────────────────────────────
export function useMembershipTiers() {
    return useQuery({
        queryKey: membershipKeys.tiers(),
        queryFn: () => getMembershipTiers(),
        select: (response: ApiResponse<MembershipTierData[]>) => response.data,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// ─── Get Current Membership Status ───────────────────────────────────────────
export function useCurrentMembership() {
    return useQuery({
        queryKey: membershipKeys.current(),
        queryFn: () => getCurrentMembership(),
        select: (response: ApiResponse<GetMembershipResponse>) => response.data,
        staleTime: 30 * 1000, // 30 seconds
    });
}

// ─── Get Benefit Information Modals ─────────────────────────────────────────
export function useBenefitInfo() {
    return useQuery({
        queryKey: membershipKeys.benefitInfo(),
        queryFn: () => getBenefitInfo(),
        select: (response: ApiResponse<BenefitInfoModal[]>) => response.data,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

// ─── Get Upgrade Options for Specific Tier ──────────────────────────────────
export function useUpgradeOptions(targetTier: MembershipTier) {
    return useQuery({
        queryKey: membershipKeys.upgradeOptions(targetTier),
        queryFn: () => getUpgradeOptions(targetTier),
        select: (response) => response.data,
        enabled: !!targetTier,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

// ─── Upgrade Membership ──────────────────────────────────────────────────────
export function useUpgradeMembership() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (request: UpgradeRequest) => upgradeMembership(request),
        onSuccess: (response: ApiResponse<UpgradeResponse>) => {
            if (response.success && response.data.success) {
                // Invalidate and refetch membership data
                queryClient.invalidateQueries({ queryKey: membershipKeys.current() });
                queryClient.invalidateQueries({ queryKey: membershipKeys.all });
            }
        },
    });
}
