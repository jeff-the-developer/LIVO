// ─── Error Codes ──────────────────────────────────────────────────────────────
export enum ErrorCode {
    AUTH_EXPIRED = 'AUTH_EXPIRED',
    AUTH_REQUIRED = 'AUTH_REQUIRED',
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
    ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
    EMAIL_EXISTS = 'EMAIL_EXISTS',
    INVALID_CODE = 'INVALID_CODE',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    WEAK_PASSWORD = 'WEAK_PASSWORD',
    KYC_REQUIRED = 'KYC_REQUIRED',
    INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
    CARD_FROZEN = 'CARD_FROZEN',
    DAILY_LIMIT_EXCEEDED = 'DAILY_LIMIT_EXCEEDED',
    PIN_INCORRECT = 'PIN_INCORRECT',
    TRANSFER_LOCKED = 'TRANSFER_LOCKED',
    OPERATION_FAILED = 'OPERATION_FAILED',
    CARD_ACTIVATION_REQUIRED = 'CARD_ACTIVATION_REQUIRED',
    CARD_DISCONTINUED = 'CARD_DISCONTINUED',
    CARD_TEMPORARILY_UNAVAILABLE = 'CARD_TEMPORARILY_UNAVAILABLE',
    CARD_ADD_BLOCKED = 'CARD_ADD_BLOCKED',
    CARD_ACTIVATION_LOCKED = 'CARD_ACTIVATION_LOCKED',
    CASHBACK_ERROR = 'CASHBACK_ERROR',
    UNKNOWN = 'UNKNOWN',
}

// ─── Generic Responses ────────────────────────────────────────────────────────
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    has_more: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}

// ─── Error ────────────────────────────────────────────────────────────────────
export interface ApiError {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
}

// ─── Misc ─────────────────────────────────────────────────────────────────────
export type SortOrder = 'asc' | 'desc';
