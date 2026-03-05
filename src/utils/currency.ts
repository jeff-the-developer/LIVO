// ─── Supported Currencies ─────────────────────────────────────────────────────
export type SupportedCurrency =
    | 'USD'
    | 'HKD'
    | 'CNY'
    | 'AUD'
    | 'CAD'
    | 'CHF'
    | 'EUR'
    | 'GBP'
    | 'JPY'
    | 'SGD';

// ─── Symbols Map ──────────────────────────────────────────────────────────────
const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
    USD: '$',
    HKD: 'HK$',
    CNY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'Fr',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    SGD: 'S$',
};

// ─── Locale Map ───────────────────────────────────────────────────────────────
const CURRENCY_LOCALES: Record<SupportedCurrency, string> = {
    USD: 'en-US',
    HKD: 'en-HK',
    CNY: 'zh-CN',
    AUD: 'en-AU',
    CAD: 'en-CA',
    CHF: 'de-CH',
    EUR: 'de-DE',
    GBP: 'en-GB',
    JPY: 'ja-JP',
    SGD: 'en-SG',
};

// ─── Exports ──────────────────────────────────────────────────────────────────
export function getCurrencySymbol(currency: SupportedCurrency): string {
    return CURRENCY_SYMBOLS[currency];
}

export function formatAmount(amount: number, currency: SupportedCurrency): string {
    const symbol = CURRENCY_SYMBOLS[currency];
    const locale = CURRENCY_LOCALES[currency];

    // JPY has no decimals
    const decimals = currency === 'JPY' ? 0 : 2;

    const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(amount);

    return `${symbol}${formatted}`;
}

export function formatChange(pct: number): string {
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(2)}%`;
}

export function isPositiveChange(pct: number): boolean {
    return pct >= 0;
}

export function parseCurrencyInput(input: string): number {
    const cleaned = input.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
}
