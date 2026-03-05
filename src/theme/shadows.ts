import { palette } from './colors';

export const shadows = {
    sm: {
        shadowColor: palette.green500,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: palette.green500,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
    },
    lg: {
        shadowColor: palette.green500,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 24,
        elevation: 12,
    },
} as const;

export type Shadows = typeof shadows;
