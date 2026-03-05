import { ErrorCode } from '@app-types/api.types';

// ─── Interface ────────────────────────────────────────────────────────────────
export interface UserFacingError {
    title: string;
    message: string;
    retryable: boolean;
}

// ─── Internal ApiError shape ─────────────────────────────────────────────────
interface RawApiError {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
}

// ─── Error Map ────────────────────────────────────────────────────────────────
const ERROR_MAP: Record<ErrorCode, UserFacingError> = {
    [ErrorCode.AUTH_EXPIRED]: {
        title: 'Session Expired',
        message: 'Please log in again to continue.',
        retryable: false,
    },
    [ErrorCode.KYC_REQUIRED]: {
        title: 'Verification Required',
        message: 'Complete identity verification to unlock this feature.',
        retryable: false,
    },
    [ErrorCode.INSUFFICIENT_BALANCE]: {
        title: 'Insufficient Balance',
        message: 'Add funds to your account to continue.',
        retryable: false,
    },
    [ErrorCode.CARD_FROZEN]: {
        title: 'Card Frozen',
        message: 'Unfreeze your card to use it.',
        retryable: false,
    },
    [ErrorCode.DAILY_LIMIT_EXCEEDED]: {
        title: 'Daily Limit Reached',
        message: 'You have reached your daily transaction limit.',
        retryable: false,
    },
    [ErrorCode.PIN_INCORRECT]: {
        title: 'Incorrect PIN',
        message: 'Please try again.',
        retryable: true,
    },
    [ErrorCode.TRANSFER_LOCKED]: {
        title: 'Transfers Locked',
        message: 'Transfers are locked for 12 hours after a password change.',
        retryable: false,
    },
    [ErrorCode.OPERATION_FAILED]: {
        title: 'Operation Failed',
        message: 'Something went wrong. Please try again or contact support.',
        retryable: true,
    },
    [ErrorCode.CARD_ACTIVATION_REQUIRED]: {
        title: 'Activation Required',
        message: 'Activate your existing card before applying for a new one.',
        retryable: false,
    },
    [ErrorCode.CARD_DISCONTINUED]: {
        title: 'Card Discontinued',
        message: 'This card has been discontinued. Please withdraw remaining funds.',
        retryable: false,
    },
    [ErrorCode.CARD_TEMPORARILY_UNAVAILABLE]: {
        title: 'Card Unavailable',
        message: 'Your card is temporarily unavailable for security review.',
        retryable: false,
    },
    [ErrorCode.CARD_ADD_BLOCKED]: {
        title: 'Cannot Add Card',
        message: 'Activate your existing cards before adding a new one.',
        retryable: false,
    },
    [ErrorCode.CARD_ACTIVATION_LOCKED]: {
        title: 'Account Locked',
        message: 'Too many incorrect attempts. Try again in 1 hour.',
        retryable: false,
    },
    [ErrorCode.CASHBACK_ERROR]: {
        title: 'Cashback Error',
        message: 'Unable to add card to cashback program. Please contact support.',
        retryable: false,
    },
    [ErrorCode.UNKNOWN]: {
        title: 'Unexpected Error',
        message: 'Something went wrong. Please try again.',
        retryable: true,
    },
};

// ─── Exports ──────────────────────────────────────────────────────────────────
export function handleApiError(error: unknown): UserFacingError {
    if (
        error !== null &&
        typeof error === 'object' &&
        'code' in error
    ) {
        const raw = error as RawApiError;
        const mapped = ERROR_MAP[raw.code];
        if (mapped) return mapped;
    }
    return ERROR_MAP[ErrorCode.UNKNOWN];
}

export function isRetryable(code: ErrorCode): boolean {
    return ERROR_MAP[code]?.retryable ?? true;
}
