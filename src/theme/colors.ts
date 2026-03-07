// ─── Brand Color Palette ──────────────────────────────────────────────────────
// Extracted from Livo Branding assets
export const palette = {
    // Primary Green (brand hero)
    green50: '#E8F9EE',
    green100: '#D8F5E3',
    green200: '#A8E8BF',
    green300: '#6DD897',
    green400: '#1ED760',
    green500: '#01CA47', // ← brand primary
    green600: '#00B33D',
    green700: '#009933',
    green800: '#007D2A',
    green900: '#006622',

    // Neutrals (light theme — Figma match)
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    black: '#000000',

    // Status
    red: '#EF4444',
    redLight: '#FEE2E2',
    orange: '#F59E0B',
    blue: '#3B82F6',
} as const;

// ─── Semantic Tokens ──────────────────────────────────────────────────────────
export const colors = {
    // Brand
    primary: palette.green500,
    primaryLight: palette.green100,
    primaryDark: palette.green700,

    // Backgrounds — WHITE per Figma
    background: palette.white,
    surface: palette.gray50,
    surfaceAlt: palette.gray100,

    // Text — BLACK/DARK per Figma
    textPrimary: palette.gray900,
    textSecondary: palette.gray500,
    textMuted: palette.gray400,
    textInverse: palette.white,

    // Borders
    border: palette.gray200,
    borderFocused: palette.green500,
    divider: palette.gray200,

    // Status
    success: palette.green500,
    successAlt: palette.green100,
    error: palette.red,
    errorAlt: palette.red,
    warning: palette.orange,
    info: palette.blue,

    // Components
    cardBackground: palette.white,
    inputBackground: palette.white,
    buttonPrimary: palette.gray900,     // dark CTA button per Figma
    buttonText: palette.white,
    tabBarBg: palette.white,
    tabBarActive: palette.green500,
    tabBarInactive: palette.gray400,

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    shimmer: palette.gray200,
} as const;
