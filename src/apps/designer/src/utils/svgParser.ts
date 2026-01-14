/**
 * SVG Parser for Palette References
 * Handles palette:colorName syntax and CSS variable injection
 */

import type { ColorPalette } from '../state/types';

/**
 * Parse SVG string and replace palette references with actual colors
 */
export const parsePaletteReferences = (
  svgData: string,
  palettes: ColorPalette[]
): string => {
  let parsed = svgData;

  // Replace palette:paletteName_colorName with actual color
  const paletteRegex = /palette:([a-zA-Z0-9_]+)_([a-zA-Z0-9_]+)/g;
  parsed = parsed.replace(paletteRegex, (match, paletteName, colorName) => {
    const palette = palettes.find((p) => p.name === paletteName || p.id === paletteName);
    if (palette && palette.colors[colorName]) {
      return palette.colors[colorName];
    }
    return match; // Return original if not found
  });

  return parsed;
};

/**
 * Inject CSS variables for palette colors into SVG
 */
export const injectPaletteCSS = (
  svgData: string,
  palettes: ColorPalette[]
): string => {
  // Extract SVG root element
  const svgMatch = svgData.match(/<svg[^>]*>/);
  if (!svgMatch) return svgData;

  const svgTag = svgMatch[0];
  const svgContent = svgData.substring(svgMatch.index! + svgTag.length);

  // Generate CSS variables for all palettes
  const cssVars: string[] = [];
  palettes.forEach((palette) => {
    Object.entries(palette.colors).forEach(([colorName, colorValue]) => {
      const varName = `--palette-${palette.name}-${colorName}`.replace(/[^a-zA-Z0-9-]/g, '-');
      cssVars.push(`${varName}: ${colorValue};`);
    });
  });

  // Inject style tag with CSS variables
  const styleTag = cssVars.length > 0
    ? `<style>:root { ${cssVars.join(' ')} }</style>`
    : '';

  // Check if style tag already exists
  if (svgTag.includes('<style>')) {
    // Append to existing style
    return svgData.replace(/<style>([^<]*)<\/style>/, (match, existing) => {
      return `<style>${existing} :root { ${cssVars.join(' ')} }</style>`;
    });
  } else {
    // Insert style tag after SVG opening tag
    return svgTag + styleTag + svgContent;
  }
};

/**
 * Extract all palette references from SVG
 */
export const extractPaletteReferences = (svgData: string): string[] => {
  const references: string[] = [];
  const paletteRegex = /palette:([a-zA-Z0-9_]+)_([a-zA-Z0-9_]+)/g;
  let match;

  while ((match = paletteRegex.exec(svgData)) !== null) {
    references.push(match[0]);
  }

  return [...new Set(references)]; // Return unique references
};

