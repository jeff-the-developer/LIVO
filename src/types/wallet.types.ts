export interface ChartPoint {
    timestamp: string;
    value: string;
}

export interface WalletAsset {
    symbol: string;
    name: string;
    balance: string;
    available: string;
    frozen: string;
    price: string;
    change_24h: string;
    chart_data: ChartPoint[];
    icon_url: string;
}

export interface WalletDashboard {
    total_balance: string;
    available_balance: string;
    currency: string;
    assets: WalletAsset[];
}

export interface WalletAssetsResponse {
    assets: WalletAsset[];
}

export interface LedgerEntry {
    id: string;
    wallet_id: string;
    type: 'credit' | 'debit';
    amount: string;
    balance_after: string;
    reference_id: string;
    description: string;
    created_at: string;
}

export interface LedgerResponse {
    entries: LedgerEntry[];
    pagination: { total: number; page: number; limit: number; has_more: boolean };
}

export interface ExchangeRate {
    base: string;
    quote: string;
    rate: string;
}

export interface ExchangeRatesResponse {
    rates: ExchangeRate[];
}

export interface DisplayPrefs {
    currency: string;
    display: string;
    type: string;
}
