// ─── Font Families ────────────────────────────────────────────────────────────
export const fontFamily = {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
} as const;

// ─── Size Scale ───────────────────────────────────────────────────────────────
export const fontSize = {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 36,
    hero: 48,
} as const;

// ─── Weight Constants ─────────────────────────────────────────────────────────
export const fontWeight = {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
};

// ─── Predefined Text Styles ───────────────────────────────────────────────────
export const typography = {
    h1: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xxxl,
        fontWeight: fontWeight.bold,
        lineHeight: 34,
        letterSpacing: 0,
    },
    h2: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        lineHeight: 30,
        letterSpacing: 0,
    },
    h3: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xl,
        fontWeight: fontWeight.semiBold,
        lineHeight: 26,
        letterSpacing: 0,
    },
    h4: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semiBold,
        lineHeight: 22,
        letterSpacing: 0,
    },
    bodyLg: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        fontWeight: fontWeight.regular,
        lineHeight: 24,
        letterSpacing: 0,
    },
    bodyMd: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.base,
        fontWeight: fontWeight.regular,
        lineHeight: 21,
        letterSpacing: 0,
    },
    bodySm: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.regular,
        lineHeight: 18,
        letterSpacing: 0,
    },
    label: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semiBold,
        lineHeight: 16,
        letterSpacing: 0,
    },
    caption: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        fontWeight: fontWeight.regular,
        lineHeight: 14,
        letterSpacing: 0,
    },
    amountHero: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.hero,
        fontWeight: fontWeight.bold,
        lineHeight: 56,
        letterSpacing: 0,
    },
    amountLg: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        lineHeight: 30,
        letterSpacing: 0,
    },
    amountMd: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xl,
        fontWeight: fontWeight.semiBold,
        lineHeight: 26,
        letterSpacing: 0,
    },
    overline: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semiBold,
        lineHeight: 14,
        letterSpacing: 1.5,
        textTransform: 'uppercase' as const,
    },
} as const;

export type Typography = typeof typography;
