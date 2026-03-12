// ─── Cards API Implementation ────────────────────────────────────────────────
// NOTE: Currently using only mock data until backend team completes cards endpoints
//
// Mock endpoints implemented:
// - GET /cards (Get user's cards)
// - POST /cards (Create a new card)

import type { ApiResponse } from '@app-types/api.types';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Card tier determines visual design and benefits */
export type CardTier = 'basic' | 'standard' | 'premium' | 'elite' | 'prestige';

/** Card lifecycle status */
export type CardStatus = 'active' | 'frozen' | 'expired' | 'pending';

/** Supported card currencies */
export type CardCurrency = 'USD' | 'HKD';

/** Billing address associated with a card */
export interface BillingAddress {
    same_as_residential: boolean;
    state_province?: string;
    state_province_2?: string;
    city?: string;
    detailed_address?: string;
    postal_code?: string;
}

/** A single card object */
export interface Card {
    id: string;
    tier: CardTier;
    currency: CardCurrency;
    note: string;
    status: CardStatus;
    last_four: string;
    created_at: string;
}

/** Payload for creating a new card */
export interface AddCardPayload {
    currency: CardCurrency;
    note: string;
    mobile_country_code: string;
    mobile_number: string;
    email: string;
    billing_address: BillingAddress;
}

/** Response from the create card endpoint */
export interface AddCardResponse {
    card: Card;
    message: string;
}

// ─── Mock Helpers ─────────────────────────────────────────────────────────────
const mockDelay = <T>(data: T, ms = 800): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(data), ms));

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_CARDS: Card[] = [];

// ─── Get User's Cards ─────────────────────────────────────────────────────────
export async function getCards(): Promise<ApiResponse<Card[]>> {
    return mockDelay({
        success: true,
        data: MOCK_CARDS,
    });
}

// ─── Create a New Card ────────────────────────────────────────────────────────
export async function addCard(
    payload: AddCardPayload,
): Promise<ApiResponse<AddCardResponse>> {
    const newCard: Card = {
        id: `card_${Date.now()}`,
        tier: 'basic',
        currency: payload.currency,
        note: payload.note,
        status: 'pending',
        last_four: String(Math.floor(1000 + Math.random() * 9000)),
        created_at: new Date().toISOString(),
    };

    MOCK_CARDS.push(newCard);

    return mockDelay({
        success: true,
        data: {
            card: newCard,
            message: 'Card created successfully! It will be activated shortly.',
        },
    });
}
