import React from 'react';
import { Image, View, Text, StyleSheet, ImageSourcePropType } from 'react-native';

// ─── Country Flag Icons (local assets) ──────────────────────────────────────
// Production-grade: all flags bundled as @1x/@2x/@3x PNGs for crisp rendering.

/** Currency code → local flag asset mapping */
const FLAG_ICONS: Record<string, ImageSourcePropType> = {
    US: require('@assets/images/icons/country_flags/united states.png'),
    HK: require('@assets/images/icons/country_flags/hong kong.png'),
    CN: require('@assets/images/icons/country_flags/china.png'),
    AU: require('@assets/images/icons/country_flags/australia.png'),
    CA: require('@assets/images/icons/country_flags/canada.png'),
    CH: require('@assets/images/icons/country_flags/switzerland.png'),
    EU: require('@assets/images/icons/country_flags/european union.png'),
    GB: require('@assets/images/icons/country_flags/united kingdom.png'),
    JP: require('@assets/images/icons/country_flags/japan.png'),
    SG: require('@assets/images/icons/country_flags/singapore.png'),
    // Additional countries
    AE: require('@assets/images/icons/country_flags/united arab emirates.png'),
    AF: require('@assets/images/icons/country_flags/afghanistan.png'),
    AR: require('@assets/images/icons/country_flags/argentina.png'),
    AT: require('@assets/images/icons/country_flags/austria.png'),
    BD: require('@assets/images/icons/country_flags/bangladesh.png'),
    BE: require('@assets/images/icons/country_flags/belgium.png'),
    BH: require('@assets/images/icons/country_flags/bahrain.png'),
    BR: require('@assets/images/icons/country_flags/brazil.png'),
    CL: require('@assets/images/icons/country_flags/chile.png'),
    CO: require('@assets/images/icons/country_flags/colombia.png'),
    CZ: require('@assets/images/icons/country_flags/czech republic.png'),
    DE: require('@assets/images/icons/country_flags/germany.png'),
    DK: require('@assets/images/icons/country_flags/denmark.png'),
    EG: require('@assets/images/icons/country_flags/egypt.png'),
    ES: require('@assets/images/icons/country_flags/spain.png'),
    FI: require('@assets/images/icons/country_flags/finland.png'),
    FR: require('@assets/images/icons/country_flags/france.png'),
    GH: require('@assets/images/icons/country_flags/ghana.png'),
    GR: require('@assets/images/icons/country_flags/greece.png'),
    HU: require('@assets/images/icons/country_flags/hungary.png'),
    ID: require('@assets/images/icons/country_flags/indonesia.png'),
    IE: require('@assets/images/icons/country_flags/ireland.png'),
    IL: require('@assets/images/icons/country_flags/israel.png'),
    IN: require('@assets/images/icons/country_flags/india.png'),
    IQ: require('@assets/images/icons/country_flags/iraq.png'),
    IR: require('@assets/images/icons/country_flags/iran.png'),
    IS: require('@assets/images/icons/country_flags/iceland.png'),
    IT: require('@assets/images/icons/country_flags/italy.png'),
    JO: require('@assets/images/icons/country_flags/jordan.png'),
    KE: require('@assets/images/icons/country_flags/kenya.png'),
    KR: require('@assets/images/icons/country_flags/south korea.png'),
    KW: require('@assets/images/icons/country_flags/kuwait.png'),
    LB: require('@assets/images/icons/country_flags/lebanon.png'),
    LK: require('@assets/images/icons/country_flags/sri lanka.png'),
    MA: require('@assets/images/icons/country_flags/morocco.png'),
    MX: require('@assets/images/icons/country_flags/mexico.png'),
    MY: require('@assets/images/icons/country_flags/malaysia.png'),
    NG: require('@assets/images/icons/country_flags/nigeria.png'),
    NL: require('@assets/images/icons/country_flags/netherlands.png'),
    NO: require('@assets/images/icons/country_flags/norway.png'),
    NZ: require('@assets/images/icons/country_flags/new zealand.png'),
    OM: require('@assets/images/icons/country_flags/oman.png'),
    PE: require('@assets/images/icons/country_flags/peru.png'),
    PH: require('@assets/images/icons/country_flags/philippines.png'),
    PK: require('@assets/images/icons/country_flags/pakistan.png'),
    PL: require('@assets/images/icons/country_flags/poland.png'),
    PT: require('@assets/images/icons/country_flags/portugal.png'),
    QA: require('@assets/images/icons/country_flags/qatar.png'),
    RO: require('@assets/images/icons/country_flags/romania.png'),
    RU: require('@assets/images/icons/country_flags/russia.png'),
    SA: require('@assets/images/icons/country_flags/saudi arabia.png'),
    SE: require('@assets/images/icons/country_flags/sweden.png'),
    TH: require('@assets/images/icons/country_flags/thailand.png'),
    TR: require('@assets/images/icons/country_flags/turkey.png'),
    TW: require('@assets/images/icons/country_flags/taiwan.png'),
    UA: require('@assets/images/icons/country_flags/ukraine.png'),
    VN: require('@assets/images/icons/country_flags/vietnam.png'),
    ZA: require('@assets/images/icons/country_flags/south africa.png'),
};

/** Currency code → ISO country code */
const CURRENCY_TO_COUNTRY: Record<string, string> = {
    USD: 'US', HKD: 'HK', CNY: 'CN', AUD: 'AU', CAD: 'CA',
    CHF: 'CH', EUR: 'EU', GBP: 'GB', JPY: 'JP', SGD: 'SG',
    AED: 'AE', ARS: 'AR', BHD: 'BH', BRL: 'BR', CLP: 'CL',
    COP: 'CO', CZK: 'CZ', DKK: 'DK', EGP: 'EG', GHS: 'GH',
    HUF: 'HU', IDR: 'ID', ILS: 'IL', INR: 'IN', ISK: 'IS',
    JOD: 'JO', KES: 'KE', KRW: 'KR', KWD: 'KW', LBP: 'LB',
    LKR: 'LK', MAD: 'MA', MXN: 'MX', MYR: 'MY', NGN: 'NG',
    NOK: 'NO', NZD: 'NZ', OMR: 'OM', PEN: 'PE', PHP: 'PH',
    PKR: 'PK', PLN: 'PL', QAR: 'QA', RON: 'RO', RUB: 'RU',
    SAR: 'SA', SEK: 'SE', THB: 'TH', TRY: 'TR', TWD: 'TW',
    UAH: 'UA', VND: 'VN', ZAR: 'ZA',
};

interface FlagIconProps {
    /** ISO country code (US, GB) or currency code (USD, GBP) */
    code: string;
    size?: number;
}

export function FlagIcon({ code, size = 28 }: FlagIconProps): React.ReactElement {
    const upper = code.toUpperCase();
    const countryCode = CURRENCY_TO_COUNTRY[upper] ?? upper;
    const source = FLAG_ICONS[countryCode];

    if (source) {
        return (
            <Image
                source={source}
                style={[styles.flagIcon, { width: size, height: size, borderRadius: size / 2 }]}
                resizeMode="cover"
            />
        );
    }

    // Fallback: initials in grey circle
    return (
        <View style={[styles.cryptoFallback, { width: size, height: size, borderRadius: size / 2 }]}>
            <Text style={[styles.cryptoFallbackText, { fontSize: size * 0.35 }]}>
                {countryCode.substring(0, 2)}
            </Text>
        </View>
    );
}

// ─── Crypto Icons (local assets) ────────────────────────────────────────────
// Production-grade: all crypto icons bundled as @1x/@2x/@3x PNGs.

/** Token symbol → local crypto icon asset */
const CRYPTO_ICONS: Record<string, ImageSourcePropType> = {
    BTC: require('@assets/images/icons/crypto_icon/Bitcoin (BTC).png'),
    ETH: require('@assets/images/icons/crypto_icon/Ethereum (ETH).png'),
    USDT: require('@assets/images/icons/crypto_icon/Tether (USDT).png'),
    USDC: require('@assets/images/icons/crypto_icon/USD Coin (USDC).png'),
    BNB: require('@assets/images/icons/crypto_icon/Binance Coin (BNB).png'),
    XRP: require('@assets/images/icons/crypto_icon/XRP (XRP).png'),
    ADA: require('@assets/images/icons/crypto_icon/Cardano (ADA).png'),
    DOGE: require('@assets/images/icons/crypto_icon/Dogecoin (DOGE).png'),
    SOL: require('@assets/images/icons/crypto_icon/Solana (SOL).png'),
    DOT: require('@assets/images/icons/crypto_icon/Polkadot (DOT).png'),
    MATIC: require('@assets/images/icons/crypto_icon/Polygon (MATIC).png'),
    LTC: require('@assets/images/icons/crypto_icon/Litecoin (LTC).png'),
    AVAX: require('@assets/images/icons/crypto_icon/Avalanche (AVAX).png'),
    LINK: require('@assets/images/icons/crypto_icon/Chainlink (LINK).png'),
    UNI: require('@assets/images/icons/crypto_icon/Uniswap (UNI).png'),
    ATOM: require('@assets/images/icons/crypto_icon/Cosmos (ATOM).png'),
    XLM: require('@assets/images/icons/crypto_icon/Stellar (XLM).png'),
    ALGO: require('@assets/images/icons/crypto_icon/Algorand (ALGO).png'),
    AAVE: require('@assets/images/icons/crypto_icon/Aave (AAVE).png'),
    ETC: require('@assets/images/icons/crypto_icon/Ethereum Classic (ETC).png'),
    BCH: require('@assets/images/icons/crypto_icon/Bitcoin Cash (BCH).png'),
    BUSD: require('@assets/images/icons/crypto_icon/Binance USD (BUSD).png'),
    '1INCH': require('@assets/images/icons/crypto_icon/1inch (1INCH).png'),
    ZRX: require('@assets/images/icons/crypto_icon/0x (ZRX).png'),
};

interface CryptoIconProps {
    /** Token symbol (BTC, ETH, USDT, etc.) */
    symbol: string;
    size?: number;
}

export function CryptoIcon({ symbol, size = 32 }: CryptoIconProps): React.ReactElement {
    const source = CRYPTO_ICONS[symbol.toUpperCase()];

    if (source) {
        return (
            <Image
                source={source}
                style={{ width: size, height: size, borderRadius: size / 2 }}
                resizeMode="cover"
            />
        );
    }

    // Fallback: first 2 letters in a colored circle
    return (
        <View style={[styles.cryptoFallback, { width: size, height: size, borderRadius: size / 2 }]}>
            <Text style={[styles.cryptoFallbackText, { fontSize: size * 0.35 }]}>
                {symbol.substring(0, 2).toUpperCase()}
            </Text>
        </View>
    );
}

// ─── Combined: auto-detect fiat vs crypto ────────────────────────────────────

const FIAT_CURRENCIES = new Set([
    'USD', 'HKD', 'CNY', 'AUD', 'CAD', 'CHF', 'EUR', 'GBP', 'JPY', 'SGD',
    'AED', 'ARS', 'BHD', 'BRL', 'CLP', 'COP', 'CZK', 'DKK', 'EGP', 'GHS',
    'HUF', 'IDR', 'ILS', 'INR', 'ISK', 'JOD', 'KES', 'KRW', 'KWD', 'LBP',
    'LKR', 'MAD', 'MXN', 'MYR', 'NGN', 'NOK', 'NZD', 'OMR', 'PEN', 'PHP',
    'PKR', 'PLN', 'QAR', 'RON', 'RUB', 'SAR', 'SEK', 'THB', 'TRY', 'TWD',
    'UAH', 'VND', 'ZAR',
]);

interface CurrencyIconProps {
    /** Currency/token symbol */
    symbol: string;
    size?: number;
}

/** Renders a flag for fiat currencies, crypto icon for tokens */
export function CurrencyIcon({ symbol, size = 32 }: CurrencyIconProps): React.ReactElement {
    if (FIAT_CURRENCIES.has(symbol.toUpperCase())) {
        return <FlagIcon code={symbol} size={size} />;
    }
    return <CryptoIcon symbol={symbol} size={size} />;
}

const styles = StyleSheet.create({
    flagIcon: {
        backgroundColor: '#F0F0F0',
    },
    cryptoFallback: {
        backgroundColor: '#E8E8E8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cryptoFallbackText: {
        fontWeight: '700',
        color: '#242424',
    },
});
