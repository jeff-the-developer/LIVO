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

// ─── Deposit Methods ────────────────────────────────────────────────────────
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
