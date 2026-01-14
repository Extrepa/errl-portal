/**
 * Utilities to apply hue rotation to SVG fill/stroke targets.
 */

const rotateHue = (h: number, delta: number) => {
  const next = (h + delta) % 360;
  return next < 0 ? next + 360 : next;
};

const hexToHsl = (hex: string) => {
  const match = hex.replace('#', '');
  const bigint = parseInt(match, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
};

const hslToHex = (h: number, s: number, l: number) => {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const rotateHex = (hex: string, delta: number) => {
  try {
    const { h, s, l } = hexToHsl(hex);
    const nextHue = rotateHue(h, delta);
    return hslToHex(nextHue, s, l);
  } catch {
    return hex;
  }
};

export const applyHueToSvg = (svg: string, hueDelta: number, target: 'fill' | 'stroke' | 'both'): string => {
  if (!svg || !hueDelta) return svg;
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  const elements = Array.from(doc.querySelectorAll('*'));

  elements.forEach((el) => {
    if (target === 'fill' || target === 'both') {
      const fill = el.getAttribute('fill');
      if (fill && fill.startsWith('#') && fill.length >= 4) {
        el.setAttribute('fill', rotateHex(fill, hueDelta));
      }
    }
    if (target === 'stroke' || target === 'both') {
      const stroke = el.getAttribute('stroke');
      if (stroke && stroke.startsWith('#') && stroke.length >= 4) {
        el.setAttribute('stroke', rotateHex(stroke, hueDelta));
      }
    }
  });

  return new XMLSerializer().serializeToString(doc);
};
