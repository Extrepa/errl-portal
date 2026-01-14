/**
 * Utilities for detecting and replacing colors in SVG strings.
 * Supports hex (#abc/#aabbcc), rgb/rgba(), and hsl/hsla() tokens.
 */

export interface ReplaceResult {
  updated: string;
  replacements: number;
}

const toHex = (value: number): string => value.toString(16).padStart(2, '0');

const normalizeHex = (value: string): string => {
  const lower = value.trim().toLowerCase();
  if (!lower.startsWith('#')) return lower;
  if (lower.length === 4) {
    return `#${lower[1]}${lower[1]}${lower[2]}${lower[2]}${lower[3]}${lower[3]}`;
  }
  if (lower.length === 7) return lower;
  return lower;
};

const rgbToHex = (color: string): string | null => {
  const rgbMatch = color.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (!rgbMatch) return null;
  const [r, g, b] = rgbMatch.slice(1, 4).map((v) => Math.max(0, Math.min(255, Number(v))));
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hslToHex = (color: string): string | null => {
  const hslMatch = color.match(/hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%/i);
  if (!hslMatch) return null;
  let [h, s, l] = hslMatch.slice(1, 4).map(Number);
  h = ((h % 360) + 360) % 360; // normalize
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const to255 = (v: number) => Math.round((v + m) * 255);
  return `#${toHex(to255(r))}${toHex(to255(g))}${toHex(to255(b))}`;
};

const tokenToHex = (token: string): string | null => {
  const trimmed = token.trim().toLowerCase();
  if (trimmed.startsWith('#')) return normalizeHex(trimmed);
  if (trimmed.startsWith('rgb')) return rgbToHex(trimmed);
  if (trimmed.startsWith('hsl')) return hslToHex(trimmed);
  return null;
};

const colorTokenRegex = /#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)/g;

/**
 * Replace all occurrences of a color (any supported format) in an SVG string.
 * Matching compares normalized hex values.
 */
export const replaceColor = (svg: string, from: string, to: string): ReplaceResult => {
  const normalizedFrom = tokenToHex(from);
  const normalizedTo = tokenToHex(to) || normalizeHex(to);

  if (!normalizedFrom || !normalizedTo || !svg) {
    return { updated: svg, replacements: 0 };
  }

  let replacements = 0;
  const updated = svg.replace(colorTokenRegex, (match) => {
    const asHex = tokenToHex(match);
    if (asHex && asHex === normalizedFrom) {
      replacements += 1;
      return normalizedTo;
    }
    return match;
  });

  return { updated, replacements };
};
