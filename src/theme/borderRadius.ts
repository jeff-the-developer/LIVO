export const borderRadius = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    card: 20,
    button: 14,
    input: 12,
    badge: 20,
    chip: 8,
    full: 999,
} as const;

export type BorderRadius = typeof borderRadius;
