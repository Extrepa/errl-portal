/**
 * Vector Masking Utilities
 * Apply SVG clipPath or mask elements to create masking effects
 */

export interface MaskRelationship {
  maskId: string;
  targetId: string; // ID of the object being masked
  maskShapeId: string; // ID of the shape used as mask
  type: 'clipPath' | 'mask';
}

/**
 * Create a clipPath element for masking
 */
export const createClipPath = (maskShape: string, id: string): string => {
  return `<clipPath id="${id}">${maskShape}</clipPath>`;
};

/**
 * Create a mask element for masking
 */
export const createMask = (maskShape: string, id: string): string => {
  return `<mask id="${id}">${maskShape}</mask>`;
};

/**
 * Apply clipPath to an SVG element
 */
export const applyClipPath = (svgContent: string, clipPathId: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) return svgContent;

  // Add clipPath reference
  const paths = doc.querySelectorAll('path, rect, circle, ellipse, polygon');
  paths.forEach((path) => {
    path.setAttribute('clip-path', `url(#${clipPathId})`);
  });

  return new XMLSerializer().serializeToString(doc);
};

/**
 * Apply mask to an SVG element
 */
export const applyMask = (svgContent: string, maskId: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) return svgContent;

  // Add mask reference
  const paths = doc.querySelectorAll('path, rect, circle, ellipse, polygon');
  paths.forEach((path) => {
    path.setAttribute('mask', `url(#${maskId})`);
  });

  return new XMLSerializer().serializeToString(doc);
};

/**
 * Remove masking from an SVG element
 */
export const removeMasking = (svgContent: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');

  // Remove clip-path and mask attributes
  const elements = doc.querySelectorAll('[clip-path], [mask]');
  elements.forEach((el) => {
    el.removeAttribute('clip-path');
    el.removeAttribute('mask');
  });

  // Remove clipPath and mask definitions
  const defs = doc.querySelector('defs');
  if (defs) {
    const clipPaths = defs.querySelectorAll('clipPath');
    const masks = defs.querySelectorAll('mask');
    clipPaths.forEach((cp) => cp.remove());
    masks.forEach((m) => m.remove());
  }

  return new XMLSerializer().serializeToString(doc);
};

