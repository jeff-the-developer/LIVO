// ─── Send Method ─────────────────────────────────────────────────────────────
export interface SendMethod {
    id: string;
    name: string;
    type: string;
    description: string;
    enabled: boolean;
}

export interface SendMethodsResponse {
    methods: SendMethod[];
}

// ─── Recipient Search ────────────────────────────────────────────────────────
export interface RecipientSearchResult {
    id: string;
    name: string;
    email: string;
    phone: string;
    username: string;
    avatar: string;
}

export interface RecipientSearchResponse {
    recipients: RecipientSearchResult[];
}

// ─── Transfer Requests ───────────────────────────────────────────────────────
export interface DirectTransferRequest {
    recipient_id: string;
    currency: string;
    amount: string;
    remark?: string;
}

export interface QuickTransferRequest {
    recipient_id: string;
    currency: string;
    amount: string;
}

export interface CryptoTransferRequest {
    symbol: string;
    amount: string;
    to_address: string;
    network: string;
}

export interface BankTransferRequest {
    amount: string;
    currency: string;
    recipient_bank: string;
    swift: string;
    reference: string;
}

export interface QRPaymentRequest {
    qr_data: string;
    amount: string;
    currency: string;
}

// ─── Transfer Responses ──────────────────────────────────────────────────────
export interface TransferResponse {
    tx_id: string;
    status: string;
    amount: string;
    fee: string;
    currency: string;
    reference: string;
    eta?: string;
}

export interface TransferPreview {
    id: string;
    from: string;
    to: string;
    amount: string;
    fee: string;
    total: string;
    currency: string;
    eta: string;
}

// ─── Transfer History ────────────────────────────────────────────────────────
export interface Transfer {
    tx_id: string;
    status: string;
    amount: string;
    fee: string;
    currency: string;
    reference: string;
    eta?: string;
    from: string;
    to: string;
    type: string;
    created_at: string;
}

export interface TransferHistoryResponse {
    transfers: Transfer[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        has_more: boolean;
    };
}
