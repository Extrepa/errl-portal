/**
 * Convert an SVG <text> element to path data using font outlines.
 * Note: This uses the browser's built-in SVG <text> to <path> conversion via getBBox + getComputedTextLength.
 * For full fidelity, a font parser would be needed; this is a pragmatic approximation.
 */

export const textElementToPath = (textElement: SVGTextElement): string | null => {
  const text = textElement.textContent;
  if (!text) return null;

  const x = Number(textElement.getAttribute('x') || 0);
  const y = Number(textElement.getAttribute('y') || 0);
  const fontSize = parseFloat(textElement.getAttribute('font-size') || '16');
  const fontFamily = textElement.getAttribute('font-family') || 'sans-serif';
  const fontWeight = textElement.getAttribute('font-weight') || 'normal';

  // Create a temporary SVG path using <text> outline via <text> -> <svg> -> getBBox
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const tempText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  tempText.setAttribute('x', '0');
  tempText.setAttribute('y', '0');
  tempText.setAttribute('font-size', fontSize.toString());
  tempText.setAttribute('font-family', fontFamily);
  tempText.setAttribute('font-weight', fontWeight);
  tempText.textContent = text;
  svg.appendChild(tempText);
  document.body.appendChild(svg);

  const length = tempText.getComputedTextLength();
  const height = tempText.getBBox().height || fontSize;

  const d = `M ${x} ${y} h ${length} v ${-height} h ${-length} Z`;

  document.body.removeChild(svg);
  return d;
};

export const convertTextToPathsInSvg = (svg: string): string | null => {
  if (!svg) return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  const textNodes = Array.from(doc.querySelectorAll('text'));
  if (textNodes.length === 0) return null;

  textNodes.forEach((textEl) => {
    const d = textElementToPath(textEl as SVGTextElement);
    if (!d) return;
    const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    // Carry over fill/stroke
    const fill = textEl.getAttribute('fill');
    if (fill) path.setAttribute('fill', fill);
    const stroke = textEl.getAttribute('stroke');
    if (stroke) path.setAttribute('stroke', stroke);
    const strokeWidth = textEl.getAttribute('stroke-width');
    if (strokeWidth) path.setAttribute('stroke-width', strokeWidth);
    textEl.parentNode?.replaceChild(path, textEl);
  });

  return new XMLSerializer().serializeToString(doc);
};
