import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@utils/errorHandler';
import {
    getSecuritySettings,
    updateSecuritySettings,
    changePassword,
    getAppearanceSettings,
    updateAppearanceSettings,
    getReferralInfo,
    sendInvite,
    getWithdrawalSettings,
    updateWithdrawalSettings,
    type SecuritySettings,
    type ChangePasswordPayload,
    type AppearanceSettings,
    type SendInvitePayload,
    type WithdrawalSettings,
    type UpdateWithdrawalSettingsPayload,
} from '@api/settings';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const settingsKeys = {
    all: ['settings'] as const,
    security: ['settings', 'security'] as const,
    appearance: ['settings', 'appearance'] as const,
    referral: ['settings', 'referral'] as const,
    withdrawal: ['settings', 'withdrawal'] as const,
};

// ─── Security ─────────────────────────────────────────────────────────────────
export function useSecuritySettings() {
    return useQuery({
        queryKey: settingsKeys.security,
        queryFn: getSecuritySettings,
        select: (data) => data.data,
    });
}

export function useUpdateSecuritySettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (settings: Partial<SecuritySettings>) =>
            updateSecuritySettings(settings),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.security });
        },
    });
}

export function useChangePassword() {
    return useMutation({
        mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
    });
}

// ─── Appearance ───────────────────────────────────────────────────────────────
export function useAppearanceSettings() {
    return useQuery({
        queryKey: settingsKeys.appearance,
        queryFn: getAppearanceSettings,
        select: (data) => data.data,
    });
}

export function useUpdateAppearanceSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (settings: Partial<AppearanceSettings>) =>
            updateAppearanceSettings(settings),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.appearance });
        },
    });
}

// ─── Referral ─────────────────────────────────────────────────────────────────
export function useReferralInfo() {
    return useQuery({
        queryKey: settingsKeys.referral,
        queryFn: getReferralInfo,
        select: (data) => data.data,
    });
}

export function useSendInvite() {
    return useMutation({
        mutationFn: (payload: SendInvitePayload) => sendInvite(payload),
    });
}

// ─── Withdrawal Settings ──────────────────────────────────────────────────────
export function useWithdrawalSettings() {
    return useQuery({
        queryKey: settingsKeys.withdrawal,
        queryFn: getWithdrawalSettings,
        select: (data) => data.data,
    });
}

export function useUpdateWithdrawalSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateWithdrawalSettingsPayload) =>
            updateWithdrawalSettings(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.withdrawal });
        },
    });
}

// ─── Error Helper (re-export) ─────────────────────────────────────────────────
export { handleApiError };
