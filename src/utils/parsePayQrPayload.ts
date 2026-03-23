/**
 * Parse QR / deep-link payloads for pay flows (scanner, future universal links).
 * Keep in sync with QuickReceiveScreen JSON QR and livopay.com share links.
 */

export type LivoReceiveV1 = {
    type: 'livo_receive';
    user_id?: string;
    username?: string;
    uid?: string;
    currency?: string;
    amount?: string;
    note?: string;
};

export type DirectTransferPrefill = {
    prefillSearchQuery?: string;
    prefillCurrency?: string;
    prefillAmount?: string;
    prefillNote?: string;
};

export type QrScanPayResolution =
    | { action: 'direct_transfer'; prefill: DirectTransferPrefill; source: 'json_receive' | 'https_pay' | 'livo_scheme' }
    | { action: 'livopay_web_non_pay'; url: string }
    | { action: 'none' };

const LIVO_HOSTS = new Set(['livopay.com', 'www.livopay.com']);

function normalizePayUsername(s: string | undefined | null): string | undefined {
    if (s == null || !String(s).trim()) return undefined;
    return String(s).trim().replace(/^@+/, '');
}

/** Try Quick Receive JSON payload */
function tryParseLivoReceiveJson(raw: string): DirectTransferPrefill | null {
    const t = raw.trim();
    if (!t.startsWith('{')) return null;
    try {
        const o = JSON.parse(t) as LivoReceiveV1;
        if (o?.type !== 'livo_receive') return null;
        const q =
            normalizePayUsername(o.username) ||
            (o.uid && String(o.uid).trim()) ||
            (o.user_id && String(o.user_id).trim());
        if (!q) return null;
        return {
            prefillSearchQuery: q,
            prefillCurrency: o.currency?.trim() || undefined,
            prefillAmount: o.amount?.trim() || undefined,
            prefillNote: o.note?.trim() || undefined,
        };
    } catch {
        return null;
    }
}

/** https://livopay.com/pay/@user or /pay/user (+ optional query) */
function tryParseHttpsPayUrl(raw: string): DirectTransferPrefill | null {
    const t = raw.trim();
    if (!/^https?:\/\//i.test(t)) return null;
    let url: URL;
    try {
        url = new URL(t);
    } catch {
        return null;
    }
    const host = url.hostname.toLowerCase();
    if (!LIVO_HOSTS.has(host)) return null;

    const parts = url.pathname.split('/').filter(Boolean);
    if (parts[0]?.toLowerCase() !== 'pay') return null;

    const userSeg = parts[1];
    const username = normalizePayUsername(userSeg);
    if (!username) return null;

    const amount = url.searchParams.get('amount')?.trim() || undefined;
    const currency = url.searchParams.get('currency')?.trim() || undefined;
    const note = url.searchParams.get('note')?.trim() || undefined;

    return {
        prefillSearchQuery: username,
        prefillCurrency: currency,
        prefillAmount: amount,
        prefillNote: note,
    };
}

/**
 * livo://pay/@user, livo://pay/user, livo://pay?username=x&amount=...
 * Host "pay" with path, or path pay/...
 */
function tryParseLivoScheme(raw: string): DirectTransferPrefill | null {
    const t = raw.trim();
    if (!t.toLowerCase().startsWith('livo://')) return null;

    const without = t.slice('livo://'.length);
    const qIdx = without.indexOf('?');
    const pathPart = (qIdx >= 0 ? without.slice(0, qIdx) : without).replace(/^\/+/, '');
    const queryPart = qIdx >= 0 ? without.slice(qIdx + 1) : '';

    let params: URLSearchParams;
    try {
        params = new URLSearchParams(queryPart);
    } catch {
        params = new URLSearchParams();
    }

    const segments = pathPart.split('/').filter(Boolean);
    let username: string | undefined;

    if (segments[0]?.toLowerCase() === 'pay') {
        username = normalizePayUsername(segments[1]);
    } else if (segments.length === 1 && segments[0]) {
        // livo://@user (unusual) or livo://username
        username = normalizePayUsername(segments[0]);
    }

    username =
        username ||
        normalizePayUsername(params.get('username') || params.get('user') || params.get('to') || undefined);

    if (!username) return null;

    const amount = params.get('amount')?.trim() || undefined;
    const currency = params.get('currency')?.trim() || undefined;
    const note = params.get('note')?.trim() || undefined;

    return {
        prefillSearchQuery: username,
        prefillCurrency: currency,
        prefillAmount: amount,
        prefillNote: note,
    };
}

export function isLikelyLivopayWebUrl(raw: string): boolean {
    const t = raw.trim().toLowerCase();
    return t.startsWith('https://livopay.com') || t.startsWith('https://www.livopay.com');
}

export function isLivoScheme(raw: string): boolean {
    return raw.trim().toLowerCase().startsWith('livo://');
}

/**
 * Decide how to route a scanned string for in-app pay flows.
 */
export function resolveQrPayPayload(raw: string): QrScanPayResolution {
    const trimmed = raw.trim();
    if (!trimmed) return { action: 'none' };

    const fromJson = tryParseLivoReceiveJson(trimmed);
    if (fromJson) {
        return { action: 'direct_transfer', prefill: fromJson, source: 'json_receive' };
    }

    const fromHttps = tryParseHttpsPayUrl(trimmed);
    if (fromHttps) {
        return { action: 'direct_transfer', prefill: fromHttps, source: 'https_pay' };
    }

    const fromLivo = tryParseLivoScheme(trimmed);
    if (fromLivo) {
        return { action: 'direct_transfer', prefill: fromLivo, source: 'livo_scheme' };
    }

    if (isLikelyLivopayWebUrl(trimmed)) {
        return { action: 'livopay_web_non_pay', url: trimmed };
    }

    if (isLivoScheme(trimmed)) {
        // livo://… but not a recognized pay pattern — show copy / unsupported UX
        return { action: 'livopay_web_non_pay', url: trimmed };
    }

    return { action: 'none' };
}
