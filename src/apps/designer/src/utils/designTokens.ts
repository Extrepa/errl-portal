/**
 * Design Token System
 * Manages design tokens for typography, colors, spacing, etc.
 */

export interface TypographyToken {
  id: string;
  name: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number | string;
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export interface ColorToken {
  id: string;
  name: string;
  value: string; // Hex, rgb, hsl, etc.
  category?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'semantic';
}

export interface SpacingToken {
  id: string;
  name: string;
  value: number;
  unit?: 'px' | 'rem' | 'em';
}

export interface DesignTokens {
  typography: TypographyToken[];
  colors: ColorToken[];
  spacing: SpacingToken[];
}

const STORAGE_KEY = 'multi_tool_design_tokens';

/**
 * Load design tokens from storage
 */
export function loadDesignTokens(): DesignTokens {
  if (typeof window === 'undefined') {
    return { typography: [], colors: [], spacing: [] };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Return default tokens
      return getDefaultTokens();
    }
    return JSON.parse(stored);
  } catch {
    return getDefaultTokens();
  }
}

/**
 * Save design tokens to storage
 */
export function saveDesignTokens(tokens: DesignTokens): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.error('Failed to save design tokens:', error);
  }
}

/**
 * Get default design tokens
 */
function getDefaultTokens(): DesignTokens {
  return {
    typography: [
      {
        id: 'heading-1',
        name: 'Heading 1',
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 1.2,
        letterSpacing: -0.5,
      },
      {
        id: 'heading-2',
        name: 'Heading 2',
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 1.3,
        letterSpacing: -0.3,
      },
      {
        id: 'body',
        name: 'Body',
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: 0,
      },
      {
        id: 'caption',
        name: 'Caption',
        fontSize: 12,
        fontWeight: 400,
        lineHeight: 1.4,
        letterSpacing: 0.2,
      },
    ],
    colors: [
      { id: 'primary', name: 'Primary', value: '#00FF9D', category: 'primary' },
      { id: 'secondary', name: 'Secondary', value: '#FF007A', category: 'secondary' },
      { id: 'accent', name: 'Accent', value: '#7000FF', category: 'accent' },
      { id: 'background', name: 'Background', value: '#121212', category: 'neutral' },
      { id: 'surface', name: 'Surface', value: '#1A1A1A', category: 'neutral' },
      { id: 'text-primary', name: 'Text Primary', value: '#E0E0E0', category: 'neutral' },
      { id: 'text-secondary', name: 'Text Secondary', value: '#888888', category: 'neutral' },
    ],
    spacing: [
      { id: 'xs', name: 'Extra Small', value: 4, unit: 'px' },
      { id: 'sm', name: 'Small', value: 8, unit: 'px' },
      { id: 'md', name: 'Medium', value: 16, unit: 'px' },
      { id: 'lg', name: 'Large', value: 24, unit: 'px' },
      { id: 'xl', name: 'Extra Large', value: 32, unit: 'px' },
    ],
  };
}

/**
 * Add a typography token
 */
export function addTypographyToken(token: TypographyToken): void {
  const tokens = loadDesignTokens();
  tokens.typography.push(token);
  saveDesignTokens(tokens);
}

/**
 * Update a typography token
 */
export function updateTypographyToken(id: string, updates: Partial<TypographyToken>): void {
  const tokens = loadDesignTokens();
  const index = tokens.typography.findIndex((t) => t.id === id);
  if (index !== -1) {
    tokens.typography[index] = { ...tokens.typography[index], ...updates };
    saveDesignTokens(tokens);
  }
}

/**
 * Delete a typography token
 */
export function deleteTypographyToken(id: string): void {
  const tokens = loadDesignTokens();
  tokens.typography = tokens.typography.filter((t) => t.id !== id);
  saveDesignTokens(tokens);
}

/**
 * Apply typography token to SVG text element
 */
export function applyTypographyTokenToText(svgText: string, token: TypographyToken): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const textElements = doc.querySelectorAll('text');

  textElements.forEach((text) => {
    if (token.fontFamily) text.setAttribute('font-family', token.fontFamily);
    if (token.fontSize) text.setAttribute('font-size', token.fontSize.toString());
    if (token.fontWeight) text.setAttribute('font-weight', token.fontWeight.toString());
    if (token.lineHeight) text.setAttribute('line-height', token.lineHeight.toString());
    if (token.letterSpacing) text.setAttribute('letter-spacing', token.letterSpacing.toString());
    if (token.textTransform) text.setAttribute('text-transform', token.textTransform);
  });

  return new XMLSerializer().serializeToString(doc);
}

