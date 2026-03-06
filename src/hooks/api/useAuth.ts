import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@app-types/navigation.types';
import { useAuthStore } from '@stores/authStore';
import { handleApiError } from '@utils/errorHandler';
import {
    registerUser,
    loginUser,
    forgotPassword,
    setPassword,
    loginWithGoogle,
    type RegisterPayload,
    type LoginPayload,
    type SetPasswordPayload,
} from '@api/auth';

type AuthNav = NativeStackNavigationProp<AuthStackParamList>;

// ─── Register ─────────────────────────────────────────────────────────────────
export function useRegister() {
    const navigation = useNavigation<AuthNav>();

    return useMutation({
        mutationFn: (payload: RegisterPayload) => registerUser(payload),
        onSuccess: (data) => {
            navigation.navigate('SetPassword', {
                // pass user_id so SetPassword screen can complete registration
                email: data.data.identifier,
            } as never);
        },
    });
}

// ─── Set Password ─────────────────────────────────────────────────────────────
export function useSetPassword() {
    const authStore = useAuthStore();

    return useMutation({
        mutationFn: (payload: SetPasswordPayload) => setPassword(payload),
        onSuccess: async (data) => {
            const { access_token, refresh_token, user } = data.data;
            await authStore.login(access_token, refresh_token, user);
        },
    });
}

// ─── Login ────────────────────────────────────────────────────────────────────
export function useLogin() {
    const authStore = useAuthStore();

    return useMutation({
        mutationFn: (payload: LoginPayload) => loginUser(payload),
        onSuccess: async (data) => {
            const { access_token, refresh_token, user } = data.data;
            await authStore.login(access_token, refresh_token, user);
        },
    });
}

// ─── Google Login ─────────────────────────────────────────────────────────────
export function useGoogleLogin() {
    const authStore = useAuthStore();

    return useMutation({
        mutationFn: (idToken: string) => loginWithGoogle(idToken),
        onSuccess: async (data) => {
            const { access_token, refresh_token, user } = data.data;
            await authStore.login(access_token, refresh_token, user);
        },
    });
}

// ─── Forgot Password ──────────────────────────────────────────────────────────
export function useForgotPassword() {
    return useMutation({
        mutationFn: (identifier: string) => forgotPassword(identifier),
    });
}

// ─── Error Helper ─────────────────────────────────────────────────────────────
export { handleApiError };
