export type TxType = 'deposit' | 'withdrawal' | 'transfer' | 'swap' | 'card_topup' | 'card_withdraw' | 'earning';
export type TxStatus = 'pending' | 'settled' | 'executed';

export interface Transaction {
    id: string;
    user_id: string;
    type: TxType;
    status: TxStatus;
    amount: string;
    fee: string;
    currency: string;
    from: string;
    to: string;
    timestamp: string;
    reference: string;
    notes: string;
}

export interface TransactionListResponse {
    transactions: Transaction[];
    pagination: { total: number; page: number; limit: number; has_more: boolean };
}
