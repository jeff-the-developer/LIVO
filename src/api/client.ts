import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ENV } from '@config/env';
import { ErrorCode } from '@app-types/api.types';
import * as tokenStorage from '@utils/tokenStorage';

let _onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(fn: () => void): void {
    _onSessionExpired = fn;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface QueueItem {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}

// Extend config to support _retry flag
interface RetryableConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

// ─── Refresh Queue State ──────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null): void {
    failedQueue.forEach((item) => {
        if (error) {
            item.reject(error);
        } else if (token) {
            item.resolve(token);
        }
    });
    failedQueue = [];
}

// ─── Axios Instance ───────────────────────────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
    baseURL: ENV.BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await tokenStorage.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: unknown) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableConfig | undefined;

        if (error.response?.status === 401 && originalRequest) {
            // Pass business-logic 401s through directly — don't trigger token refresh
            // for errors like INVALID_CREDENTIALS, ACCOUNT_LOCKED, etc.
            const responseData = error.response?.data as Record<string, unknown> | undefined;
            const apiError = responseData?.error as Record<string, unknown> | undefined;
            const errorCode = apiError?.code as string | undefined;
            if (errorCode && errorCode !== 'AUTH_EXPIRED' && errorCode !== 'AUTH_REQUIRED') {
                return Promise.reject(apiError);
            }

            if (originalRequest._retry) {
                return Promise.reject({
                    code: ErrorCode.AUTH_EXPIRED,
                    message: 'Session expired. Please log in again.',
                });
            }

            if (isRefreshing) {
                return new Promise<AxiosResponse>((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token) => {
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                            }
                            resolve(apiClient(originalRequest));
                        },
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await tokenStorage.getRefreshToken();
                if (!refreshToken) throw new Error('No refresh token');

                const { data } = await axios.post<{ token: string; refresh_token: string }>(
                    `${ENV.BASE_URL}/auth/refresh`,
                    { refresh_token: refreshToken },
                    { headers: { 'Content-Type': 'application/json' } },
                );

                const newToken = data.token;
                await tokenStorage.saveToken(newToken);
                if (data.refresh_token) {
                    await tokenStorage.saveRefreshToken(data.refresh_token);
                }
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

                processQueue(null, newToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }

                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                await tokenStorage.clearAll();
                _onSessionExpired?.();
                return Promise.reject({
                    code: ErrorCode.AUTH_EXPIRED,
                    message: 'Session expired. Please log in again.',
                });
            } finally {
                isRefreshing = false;
            }
        }

        // ── Non-401 errors ──
        const responseData = error.response?.data as Record<string, unknown> | undefined;
        const apiError = responseData?.error as Record<string, unknown> | undefined;

        if (apiError && 'code' in apiError) {
            return Promise.reject(apiError);
        }

        return Promise.reject({
            code: ErrorCode.UNKNOWN,
            message: error.message ?? 'An unexpected error occurred',
        });
    },
);

export default apiClient;
