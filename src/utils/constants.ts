import type { SupportedCurrency } from './currency';

export const APP_NAME = 'Livo';
export const SUPPORT_EMAIL = 'Hello@LIVOPay.com';

export const PIN_LENGTH = 6;
export const OTP_LENGTH = 6;
export const MAX_PIN_ATTEMPTS = 5;
export const TRANSFER_LOCK_HOURS = 12;
export const CARD_NOTE_MAX_LENGTH = 8;
export const SVID_MIN_LENGTH = 5;
export const SVID_MAX_LENGTH = 12;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 32;

export type KycLevel = 0 | 1 | 2 | 3;

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
    'USD',
    'HKD',
    'CNY',
    'AUD',
    'CAD',
    'CHF',
    'EUR',
    'GBP',
    'JPY',
    'SGD',
];

export const CARD_TIERS = [
    'Basic',
    'Standard',
    'Premium',
    'Elite',
    'Prestige',
] as const;

export type CardTier = (typeof CARD_TIERS)[number];

export const CARD_STATUSES = [
    'active',
    'frozen',
    'cancelled',
    'pending',
    'expired',
] as const;

export type CardStatus = (typeof CARD_STATUSES)[number];
