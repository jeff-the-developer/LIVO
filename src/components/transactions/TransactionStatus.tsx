import React from 'react';
import StatusBadge from '@components/common/StatusBadge';

type TxStatus = 'pending' | 'settled' | 'executed' | 'failed' | 'completed' | 'processing' | 'rejected';
type TransactionStatusDomain = 'wallet' | 'card';

interface TransactionStatusProps {
    status: TxStatus | string;
    domain?: TransactionStatusDomain;
}

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    settled: 'Completed',
    executed: 'Completed',
    completed: 'Completed',
    failed: 'Failed',
    rejected: 'Declined',
    refunded: 'Refunded',
};

function formatStatusLabel(status: string): string {
    const trimmed = status.trim();
    if (!trimmed) return 'Unknown';
    const key = trimmed.toLowerCase().replace(/_/g, ' ');
    if (STATUS_LABELS[key]) return STATUS_LABELS[key];
    return trimmed.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeTone(status: string, domain: TransactionStatusDomain) {
    const normalized = status.toLowerCase();

    if (domain === 'card') {
        switch (normalized) {
            case 'rejected':
                return 'error' as const;
            case 'settled':
            case 'executed':
            case 'refunded':
                return 'neutral' as const;
            case 'pending':
                return 'warning' as const;
            default:
                return 'neutral' as const;
        }
    }

    switch (normalized) {
        case 'settled':
        case 'executed':
        case 'completed':
            return 'success' as const;
        case 'pending':
        case 'processing':
            return 'warning' as const;
        case 'failed':
        case 'rejected':
            return 'error' as const;
        default:
            return 'neutral' as const;
    }
}

export default function TransactionStatus({
    status,
    domain = 'wallet',
}: TransactionStatusProps): React.ReactElement {
    const label = formatStatusLabel(status);
    return <StatusBadge label={label} tone={normalizeTone(status, domain)} />;
}
