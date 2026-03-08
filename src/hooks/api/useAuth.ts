import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@app-types/navigation.types';
import { useAuthStore } from '@stores/authStore';
import { handleApiError } from '@utils/errorHandler';
import {
    registerUser,
    verifyOTP,
    resendOTP,
    loginUser,
    forgotPassword,
    setPassword,
    loginWithGoogle,
    checkUsername,
    createUsername,
    type RegisterPayload,
    type LoginPayload,
    type SetPasswordPayload,
    type VerifyOTPPayload,
    type CreateUsernamePayload,
} from '@api/auth';

type AuthNav = NativeStackNavigationProp<AuthStackParamList>;

// ─── Register ─────────────────────────────────────────────────────────────────
export function useRegister() {
    const navigation = useNavigation<AuthNav>();

    return useMutation({
        mutationFn: (payload: RegisterPayload) => registerUser(payload),
        onSuccess: (data, variables) => {
            // Determine if identifier looks like email or phone
            const isPhone = /^\+?\d{7,}$/.test(variables.identifier.replace(/[\s-]/g, ''));
            navigation.navigate('VerifyOTP', {
                mode: 'register',
                identifier: variables.identifier,
                identifierType: isPhone ? 'phone' : 'email',
            });
        },
    });
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────
export function useVerifyOTP() {
    return useMutation({
        mutationFn: (payload: VerifyOTPPayload) => verifyOTP(payload),
    });
}

// ─── Resend OTP ───────────────────────────────────────────────────────────────
export function useResendOTP() {
    return useMutation({
        mutationFn: (identifier: string) => resendOTP(identifier),
    });
}

// ─── Set Password ─────────────────────────────────────────────────────────────
export function useSetPassword() {
    return useMutation({
        mutationFn: (payload: SetPasswordPayload) => setPassword(payload),
    });
}

// ─── Check Username ───────────────────────────────────────────────────────────
export function useCheckUsername() {
    return useMutation({
        mutationFn: (username: string) => checkUsername(username),
    });
}

// ─── Create Username ──────────────────────────────────────────────────────────
export function useCreateUsername() {
    const authStore = useAuthStore();

    return useMutation({
        mutationFn: (payload: CreateUsernamePayload) => createUsername(payload),
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
