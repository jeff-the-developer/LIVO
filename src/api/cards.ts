// ─── Cards API Implementation ────────────────────────────────────────────────
// NOTE: Currently using only mock data until backend team completes cards endpoints
//
// Mock endpoints implemented:
// - GET /cards (Get user's cards)
// - POST /cards (Create a new card)
// - GET /cards/:id/transactions (Get card transactions)
// - POST /cards/:id/freeze (Freeze a card)
// - POST /cards/:id/unfreeze (Unfreeze a card)

import type { ApiResponse } from '@app-types/api.types';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Card tier determines visual design and benefits */
export type CardTier = 'basic' | 'standard' | 'premium' | 'elite' | 'prestige';

/** Card lifecycle status */
export type CardStatus = 'active' | 'frozen' | 'expired' | 'pending' | 'disabled';

/** Supported card currencies */
export type CardCurrency = 'USD' | 'HKD';

/** Transaction status */
export type TransactionStatus =
    | 'Pending'
    | 'Executed'
    | 'Settled'
    | 'Rejected'
    | 'Refunded';

/** Icon type for transaction list items */
export type TransactionIconType =
    | 'lock'         // Pending / held
    | 'download'     // Withdraw
    | 'atm'          // ATM
    | 'alert'        // Rejected
    | 'upload';      // Deposit / refund

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
    name: string;
    tier: CardTier;
    currency: CardCurrency;
    note: string;
    status: CardStatus;
    last_four: string;
    balance: number;
    created_at: string;
}

/** A single transaction */
export interface CardTransaction {
    id: string;
    card_id: string;
    title: string;
    date: string;
    amount: number;
    status: TransactionStatus;
    icon_type: TransactionIconType;
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
const MOCK_CARDS: Card[] = [
    {
        id: 'card_demo_001',
        name: 'Infinite Card',
        tier: 'basic',
        currency: 'USD',
        note: '',
        status: 'active',
        last_four: '7723',
        balance: 364_789.17,
        created_at: '2025-11-15T10:00:00Z',
    },
];

const MOCK_TRANSACTIONS: CardTransaction[] = [
    {
        id: 'txn_001',
        card_id: 'card_demo_001',
        title: 'RAKUTENPAY HYOUNBOO',
        date: '01/09 21:27',
        amount: 0.0,
        status: 'Pending',
        icon_type: 'lock',
    },
    {
        id: 'txn_002',
        card_id: 'card_demo_001',
        title: 'Withdraw to cash account',
        date: '01/08 21:27',
        amount: -200.0,
        status: 'Executed',
        icon_type: 'download',
    },
    {
        id: 'txn_003',
        card_id: 'card_demo_001',
        title: 'ATM OF TAIWAN',
        date: '01/08 21:27',
        amount: -97.61,
        status: 'Settled',
        icon_type: 'atm',
    },
    {
        id: 'txn_004',
        card_id: 'card_demo_001',
        title: 'ALIPAY',
        date: '01/08 21:27',
        amount: -3700.0,
        status: 'Rejected',
        icon_type: 'alert',
    },
    {
        id: 'txn_005',
        card_id: 'card_demo_001',
        title: 'Cash account deposit',
        date: '01/08 21:27',
        amount: 6250.0,
        status: 'Refunded',
        icon_type: 'upload',
    },
];

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
        name: 'Basic Card',
        tier: 'basic',
        currency: payload.currency,
        note: payload.note,
        status: 'pending',
        last_four: String(Math.floor(1000 + Math.random() * 9000)),
        balance: 0,
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

// ─── Get Card Transactions ────────────────────────────────────────────────────
export async function getCardTransactions(
    cardId: string,
): Promise<ApiResponse<CardTransaction[]>> {
    const txns = MOCK_TRANSACTIONS.filter((t) => t.card_id === cardId);
    return mockDelay({
        success: true,
        data: txns,
    });
}

// ─── Freeze Card ──────────────────────────────────────────────────────────────
export async function freezeCard(
    cardId: string,
): Promise<ApiResponse<Card>> {
    const card = MOCK_CARDS.find((c) => c.id === cardId);
    if (card) card.status = 'frozen';
    return mockDelay({
        success: true,
        data: card!,
    }, 400);
}

// ─── Unfreeze Card ────────────────────────────────────────────────────────────
export async function unfreezeCard(
    cardId: string,
): Promise<ApiResponse<Card>> {
    const card = MOCK_CARDS.find((c) => c.id === cardId);
    if (card) card.status = 'active';
    return mockDelay({
        success: true,
        data: card!,
    }, 400);
}
