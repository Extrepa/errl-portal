import type { ColorPalette } from '../state/types';

export const mergeColorsIntoPalette = (palette: ColorPalette, colors: string[]): ColorPalette => {
  const existingValues = new Set(Object.values(palette.colors).map((c) => c.toLowerCase()));
  const nextColors: Record<string, string> = { ...palette.colors };
  let added = 0;

  colors.forEach((color) => {
    const normalized = color.toLowerCase();
    if (existingValues.has(normalized)) return;
    added += 1;
    nextColors[`color_${Object.keys(nextColors).length + 1}`] = color;
  });

  return added > 0 ? { ...palette, colors: nextColors } : palette;
};
