export { colors, palette } from './colors';
export type { Colors } from './colors';

export { typography, fontFamily, fontSize, fontWeight } from './typography';
export type { Typography } from './typography';

export { spacing } from './spacing';
export type { Spacing } from './spacing';

export { shadows } from './shadows';
export type { Shadows } from './shadows';

export { borderRadius } from './borderRadius';
export type { BorderRadius } from './borderRadius';

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';
import { borderRadius } from './borderRadius';

export const theme = {
    colors,
    typography,
    spacing,
    shadows,
    borderRadius,
} as const;

export type Theme = typeof theme;
