export * from './colors';
export * from './spacing';

import { colors } from './colors';
import { spacing, borderRadius, typography } from './spacing';

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography
} as const;

export type Theme = typeof theme; 