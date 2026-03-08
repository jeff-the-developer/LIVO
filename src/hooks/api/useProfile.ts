import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@stores/authStore';
import { handleApiError } from '@utils/errorHandler';
import {
    updateAvatar,
    resetAvatar,
    updatePhone,
    updateEmail,
    getAddress,
    saveAddress,
    getUserProfile,
    deleteAccount,
    type UpdateAvatarPayload,
    type UpdatePhonePayload,
    type UpdateEmailPayload,
    type AddressPayload,
} from '@api/user';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const profileKeys = {
    all: ['profile'] as const,
    address: ['profile', 'address'] as const,
};

// ─── Get User Profile ─────────────────────────────────────────────────────────
export function useUserProfile() {
    return useQuery({
        queryKey: profileKeys.all,
        queryFn: getUserProfile,
        select: (data) => data.data.user,
    });
}

// ─── Update Avatar ────────────────────────────────────────────────────────────
export function useUpdateAvatar() {
    const queryClient = useQueryClient();
    const setUser = useAuthStore((s) => s.setUser);
    const user = useAuthStore((s) => s.user);

    return useMutation({
        mutationFn: (payload: UpdateAvatarPayload) => updateAvatar(payload),
        onSuccess: (data) => {
            if (user) {
                setUser({ ...user, avatar_url: data.data.avatar_url });
            }
            queryClient.invalidateQueries({ queryKey: profileKeys.all });
        },
    });
}

// ─── Reset Avatar ─────────────────────────────────────────────────────────────
export function useResetAvatar() {
    const queryClient = useQueryClient();
    const setUser = useAuthStore((s) => s.setUser);
    const user = useAuthStore((s) => s.user);

    return useMutation({
        mutationFn: () => resetAvatar(),
        onSuccess: () => {
            if (user) {
                setUser({ ...user, avatar_url: '' });
            }
            queryClient.invalidateQueries({ queryKey: profileKeys.all });
        },
    });
}

// ─── Update Phone ─────────────────────────────────────────────────────────────
export function useUpdatePhone() {
    return useMutation({
        mutationFn: (payload: UpdatePhonePayload) => updatePhone(payload),
    });
}

// ─── Update Email ─────────────────────────────────────────────────────────────
export function useUpdateEmail() {
    return useMutation({
        mutationFn: (payload: UpdateEmailPayload) => updateEmail(payload),
    });
}

// ─── Get Address ──────────────────────────────────────────────────────────────
export function useAddress() {
    return useQuery({
        queryKey: profileKeys.address,
        queryFn: getAddress,
        select: (data) => data.data,
    });
}

// ─── Save Address ─────────────────────────────────────────────────────────────
export function useSaveAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AddressPayload) => saveAddress(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: profileKeys.address });
        },
    });
}

// ─── Delete Account ───────────────────────────────────────────────────────────
export function useDeleteAccount() {
    const authStore = useAuthStore();

    return useMutation({
        mutationFn: () => deleteAccount(),
        onSuccess: async () => {
            await authStore.logout();
        },
    });
}

// ─── Error Helper (re-export) ─────────────────────────────────────────────────
export { handleApiError };
