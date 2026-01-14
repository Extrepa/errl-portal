/**
 * Filter Application Utilities
 * Apply SVG filters to SVG strings
 */

import type { FilterDefinition } from '../state/types';

/**
 * Convert hex color to RGB
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

/**
 * Apply filters to SVG string
 */
export const applyFiltersToSvg = (
  svgData: string,
  filters: FilterDefinition[],
  filterId: string = `filter-${Date.now()}`
): string => {
  if (!filters || filters.length === 0) return svgData;

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgData, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) return svgData;

  // Get or create defs
  let defs = doc.querySelector('defs');
  if (!defs) {
    defs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.insertBefore(defs, svg.firstChild);
  }

  // Remove existing filters with this ID
  const existingFilter = defs.querySelector(`filter[id="${filterId}"]`);
  if (existingFilter) {
    existingFilter.remove();
  }

  // Create filter element
  const filter = doc.createElementNS('http://www.w3.org/2000/svg', 'filter');
  filter.setAttribute('id', filterId);

  // Add filter primitives
  filters
    .filter((f) => f.enabled)
    .forEach((filterDef) => {
      switch (filterDef.type) {
        case 'blur':
          const blur = doc.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
          blur.setAttribute('stdDeviation', String(filterDef.params.radius || 5));
          filter.appendChild(blur);
          break;

        case 'shadow':
          const shadow = doc.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
          shadow.setAttribute('dx', String(filterDef.params.offsetX || 2));
          shadow.setAttribute('dy', String(filterDef.params.offsetY || 2));
          shadow.setAttribute('stdDeviation', String(filterDef.params.blur || 4));
          shadow.setAttribute('flood-color', String(filterDef.params.color || '#000000'));
          filter.appendChild(shadow);
          break;

        case 'glow':
          // Inner glow using feGaussianBlur and feColorMatrix
          const glowBlur = doc.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
          glowBlur.setAttribute('stdDeviation', String(filterDef.params.radius || 10));
          glowBlur.setAttribute('result', 'coloredBlur');
          filter.appendChild(glowBlur);
          const glowColor = doc.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
          glowColor.setAttribute('type', 'matrix');
          const glowColorHex = String(filterDef.params.color || '#00FF9D');
          const rgb = hexToRgb(glowColorHex);
          glowColor.setAttribute(
            'values',
            `0 0 0 0 ${rgb.r / 255} 0 0 0 0 ${rgb.g / 255} 0 0 0 0 ${rgb.b / 255} 0 0 0 ${filterDef.params.intensity || 0.8} 0`
          );
          filter.appendChild(glowColor);
          break;

        case 'prismatic':
          // Chromatic aberration using multiple feOffset and feColorMatrix
          const prismOffset1 = doc.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
          prismOffset1.setAttribute('dx', String((filterDef.params.amount as number) || 2));
          prismOffset1.setAttribute('dy', '0');
          prismOffset1.setAttribute('result', 'offset1');
          filter.appendChild(prismOffset1);
          // Additional offsets for RGB separation would go here
          break;

        case 'colorMatrix':
          const colorMatrix = doc.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
          colorMatrix.setAttribute('type', 'matrix');
          colorMatrix.setAttribute('values', String(filterDef.params.matrix || '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0'));
          filter.appendChild(colorMatrix);
          break;
      }
    });

  defs.appendChild(filter);

  // Apply filter to paths and shapes
  const elements = doc.querySelectorAll('path, rect, circle, ellipse, polygon, g');
  elements.forEach((el) => {
    // Only apply if element doesn't already have a filter
    if (!el.getAttribute('filter')) {
      el.setAttribute('filter', `url(#${filterId})`);
    }
  });

  return new XMLSerializer().serializeToString(doc);
};

