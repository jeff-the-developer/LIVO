// ─── Deposit Address ─────────────────────────────────────────────────────────
export interface DepositAddress {
    address: string;
    network: string;
    qr_code_url: string;
    tag?: string;
}

export interface DepositAddressResponse {
    addresses: DepositAddress[];
}

// ─── Receive QR ─────────────────────────────────────────────────────────────
export interface ReceiveSettings {
    currency: string;
    amount?: string;
    note?: string;
}

export interface QRReceiveData {
    qr_data: string;
    username: string;
    uid: string;
}

// ─── Deposit Methods (legacy crypto) ────────────────────────────────────────
export interface DepositMethod {
    id: string;
    name: string;
    type: string;
    description: string;
    enabled: boolean;
}

export interface DepositMethodsResponse {
    methods: DepositMethod[];
}

// ─── Fiat Deposit Methods ────────────────────────────────────────────────────
export interface FiatDepositMethod {
    id: string;
    name: string;
    type: 'bank' | 'card';
    currency: string;
    min_amount: string;
    max_amount: string;
    fee: string;
    process_time: string;
    enabled: boolean;
}

export interface FiatDepositMethodsResponse {
    methods: FiatDepositMethod[];
}

// ─── Bank Deposit ────────────────────────────────────────────────────────────
export interface BankDepositPayload {
    amount: string;
    currency: string;
    bank_details: string;
}

export interface BankDepositInstructions {
    bank_name: string;
    account_number: string;
    routing_number: string;
    reference_code: string;
    note: string;
}

export interface FiatDepositResponse {
    tx_id: string;
    status: 'pending' | 'completed' | 'failed';
    amount: string;
    currency: string;
    reference: string;
    instructions?: BankDepositInstructions;
}

// ─── Card Deposit ────────────────────────────────────────────────────────────
export interface CardDepositPayload {
    amount: string;
    currency: string;
    card_token: string;
}

// ─── Redeem Code ─────────────────────────────────────────────────────────────
export interface RedeemCodePayload {
    code: string;
}
