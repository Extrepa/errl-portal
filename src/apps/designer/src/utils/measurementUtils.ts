/**
 * Measurement Utilities
 * Tools for measuring distances, areas, and angles in SVG
 */

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Calculate angle between two points in degrees
 */
export function angle(x1: number, y1: number, x2: number, y2: number): number {
  return (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
}

/**
 * Calculate area of a closed path
 * Uses the shoelace formula
 */
export function calculatePathArea(pathData: string): number {
  // Parse path data to extract points
  // This is a simplified implementation
  const points: { x: number; y: number }[] = [];
  const commands = pathData.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g) || [];

  let currentX = 0;
  let currentY = 0;

  for (const cmd of commands) {
    const type = cmd[0];
    const coords = cmd.slice(1).trim().split(/[\s,]+/).map(Number).filter((n) => !isNaN(n));

    switch (type) {
      case 'M':
      case 'm':
        if (coords.length >= 2) {
          currentX = type === 'M' ? coords[0] : currentX + coords[0];
          currentY = type === 'm' ? coords[1] : currentY + coords[1];
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'L':
      case 'l':
        if (coords.length >= 2) {
          currentX = type === 'L' ? coords[0] : currentX + coords[0];
          currentY = type === 'L' ? coords[1] : currentY + coords[1];
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'Z':
      case 'z':
        // Close path - connect to first point
        if (points.length > 0) {
          points.push({ x: points[0].x, y: points[0].y });
        }
        break;
    }
  }

  if (points.length < 3) return 0;

  // Shoelace formula
  let area = 0;
  for (let i = 0; i < points.length - 1; i++) {
    area += points[i].x * points[i + 1].y;
    area -= points[i + 1].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

/**
 * Calculate total path length
 */
export function calculatePathLength(pathData: string): number {
  // Simplified: estimate path length by measuring segments
  // For accurate measurement, would need to use SVGPathElement.getTotalLength()
  const commands = pathData.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g) || [];
  let totalLength = 0;
  let currentX = 0;
  let currentY = 0;
  let startX = 0;
  let startY = 0;

  for (const cmd of commands) {
    const type = cmd[0];
    const coords = cmd.slice(1).trim().split(/[\s,]+/).map(Number).filter((n) => !isNaN(n));

    switch (type) {
      case 'M':
        if (coords.length >= 2) {
          currentX = coords[0];
          currentY = coords[1];
          startX = currentX;
          startY = currentY;
        }
        break;
      case 'm':
        if (coords.length >= 2) {
          currentX += coords[0];
          currentY += coords[1];
          startX = currentX;
          startY = currentY;
        }
        break;
      case 'L':
        if (coords.length >= 2) {
          const nextX = coords[0];
          const nextY = coords[1];
          totalLength += distance(currentX, currentY, nextX, nextY);
          currentX = nextX;
          currentY = nextY;
        }
        break;
      case 'l':
        if (coords.length >= 2) {
          const nextX = currentX + coords[0];
          const nextY = currentY + coords[1];
          totalLength += distance(currentX, currentY, nextX, nextY);
          currentX = nextX;
          currentY = nextY;
        }
        break;
      case 'Z':
      case 'z':
        totalLength += distance(currentX, currentY, startX, startY);
        currentX = startX;
        currentY = startY;
        break;
    }
  }

  return totalLength;
}

/**
 * Get bounding box of SVG element
 */
export function getBoundingBox(svg: string): { x: number; y: number; width: number; height: number } | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  const svgElement = doc.documentElement;

  if (!svgElement || svgElement.nodeName !== 'svg') {
    return null;
  }

  const viewBox = svgElement.getAttribute('viewBox');
  if (viewBox) {
    const [x, y, width, height] = viewBox.split(/\s+/).map(Number);
    return { x, y, width, height };
  }

  const width = parseFloat(svgElement.getAttribute('width') || '0');
  const height = parseFloat(svgElement.getAttribute('height') || '0');

  return { x: 0, y: 0, width, height };
}

/**
 * Count paths in SVG
 */
export function countPaths(svg: string): number {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  return doc.querySelectorAll('path').length;
}

/**
 * Count points in SVG paths
 */
export function countPoints(svg: string): number {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  const paths = doc.querySelectorAll('path');
  let totalPoints = 0;

  paths.forEach((path) => {
    const d = path.getAttribute('d') || '';
    // Count M and L commands as points (simplified)
    const pointCommands = d.match(/[MmLl]/g);
    if (pointCommands) {
      totalPoints += pointCommands.length;
    }
  });

  return totalPoints;
}

