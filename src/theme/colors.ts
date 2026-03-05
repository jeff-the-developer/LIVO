// ─── Primitive Palette ────────────────────────────────────────────────────────
export const palette = {
    green500: '#01CA47',
    green400: '#12D957',
    green300: '#2EE86A',
    green100: '#D9F7E3',
    green900: '#014D20',
    purple400: '#7C6FF7',
    pink400: '#FF6B9D',
    gray950: '#1a1a1a',
    gray900: '#1f1f1f',
    gray850: '#242424',
    gray800: '#2a2a2a',
    gray700: '#333333',
    gray600: '#404040',
    gray400: 'rgba(255,255,255,0.5)',
    gray300: 'rgba(255,255,255,0.3)',
    gray200: 'rgba(255,255,255,0.12)',
    gray100: 'rgba(255,255,255,0.06)',
    white: '#FFFFFF',
    black: '#000000',
    red400: '#FF3B30',
    orange400: '#FF9500',
    gold400: '#FFD700',
    blue400: '#0A84FF',
} as const;

// ─── Semantic Tokens ──────────────────────────────────────────────────────────
export const colors = {
    background: palette.gray950,
    backgroundSecondary: palette.gray900,
    surface: palette.gray850,
    surfaceSecondary: palette.gray800,
    surfaceTertiary: palette.gray700,
    border: palette.gray200,
    borderSubtle: palette.gray100,
    borderFocus: palette.green500,

    primary: palette.green500,
    primaryHover: palette.green400,
    primaryLight: palette.green100,
    primaryDark: palette.green900,

    secondary: palette.purple400,

    error: palette.pink400,
    errorAlt: palette.red400,
    success: palette.green500,
    warning: palette.orange400,
    info: palette.blue400,
    gold: palette.gold400,

    textPrimary: palette.white,
    textSecondary: palette.gray400,
    textMuted: palette.gray300,
    textDisabled: palette.gray200,
    textInverse: palette.gray950,

    overlay: 'rgba(0,0,0,0.7)',
    overlayLight: 'rgba(0,0,0,0.4)',

    cardBackground: palette.gray100,
    cardBorder: palette.gray200,

    tabBarBackground: palette.gray950,
    tabBarBorder: palette.gray200,
    tabBarActive: palette.green500,
    tabBarInactive: palette.gray400,
} as const;

export type Colors = typeof colors;
