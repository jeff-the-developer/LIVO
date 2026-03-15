// ─── Swap Quote ─────────────────────────────────────────────────────────────
export interface SwapQuote {
    from_currency: string;
    to_currency: string;
    from_amount: string;
    to_amount: string;
    rate: string;
    min_amount: string;
    max_amount: string;
    fee: string;
}

// ─── Swap Request / Response ────────────────────────────────────────────────
export interface SwapRequest {
    from_currency: string;
    to_currency: string;
    amount: string;
}

export interface SwapResponse {
    tx_id: string;
    status: string;
    from_currency: string;
    to_currency: string;
    from_amount: string;
    to_amount: string;
    rate: string;
    fee: string;
}

// ─── Swap Records ───────────────────────────────────────────────────────────
export interface SwapRecord {
    id: string;
    from_currency: string;
    to_currency: string;
    from_amount: string;
    to_amount: string;
    rate: string;
    fee: string;
    status: string;
    created_at: string;
}

export interface SwapRecordsResponse {
    records: SwapRecord[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        has_more: boolean;
    };
}

// ─── Swap Pairs ─────────────────────────────────────────────────────────────
export interface SwapPair {
    from: string;
    to: string;
    rate: string;
    min_amount: string;
    max_amount: string;
}

export interface SwapPairsResponse {
    pairs: SwapPair[];
}
