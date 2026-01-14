/**
 * Extract color tokens from an SVG string.
 * Supports hex (#abc/#aabbcc), rgb/rgba(), and hsl/hsla().
 */
import { replaceColor } from './colorReplacer';

const colorTokenRegex = /#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)/g;

export const extractColorsFromSvg = (svg: string): string[] => {
  if (!svg) return [];
  const matches = svg.match(colorTokenRegex) || [];
  const unique = Array.from(new Set(matches.map((m) => m.trim().toLowerCase())));
  return unique;
};

// Re-export types for convenience in consumers
export type { ReplaceResult } from './colorReplacer';
