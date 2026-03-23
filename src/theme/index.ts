export { colors, palette } from './colors';

export { typography, fontFamily, fontSize, fontWeight } from './typography';
export type { Typography } from './typography';

export { spacing } from './spacing';
export type { Spacing } from './spacing';

export { shadows } from './shadows';
export type { Shadows } from './shadows';

export { borderRadius } from './borderRadius';
export type { BorderRadius } from './borderRadius';

export { ui } from './ui';
export type { UI } from './ui';

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';
import { borderRadius } from './borderRadius';
import { ui } from './ui';

export const theme = {
    colors,
    typography,
    spacing,
    shadows,
    borderRadius,
    ui,
} as const;

export type Theme = typeof theme;
