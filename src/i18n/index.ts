import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { AppLanguage } from '@stores/appStore';

import en from './locales/en';
import es from './locales/es';
import fr from './locales/fr';
import de from './locales/de';
import pt from './locales/pt';
import zh from './locales/zh';
import ja from './locales/ja';
import ko from './locales/ko';

// ─── Language code mapping ────────────────────────────────────────────────────
// Maps the display names used in the app store to BCP 47 locale codes
export const LANGUAGE_CODES: Record<AppLanguage, string> = {
    English: 'en',
    Spanish: 'es',
    French: 'fr',
    German: 'de',
    Portuguese: 'pt',
    Chinese: 'zh',
    Japanese: 'ja',
    Korean: 'ko',
};

// ─── Init ─────────────────────────────────────────────────────────────────────
void i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            es: { translation: es },
            fr: { translation: fr },
            de: { translation: de },
            pt: { translation: pt },
            zh: { translation: zh },
            ja: { translation: ja },
            ko: { translation: ko },
        },
        lng: 'en',
        fallbackLng: 'en',
        compatibilityJSON: 'v3',
        interpolation: {
            escapeValue: false, // React already escapes
        },
    });

export default i18n;
