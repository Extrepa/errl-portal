/**
 * Cleanup Utilities
 * Tools for cleaning up SVG files
 */

export interface CleanupOptions {
  removeInvisibleElements?: boolean;
  removeStrayPoints?: boolean;
  threshold?: number; // For stray point detection (distance threshold)
  roundCoordinates?: boolean;
  precision?: number;
  removeEmptyGroups?: boolean;
  removeDuplicates?: boolean;
}

/**
 * Clean up SVG string with specified options
 */
export function cleanupSVG(svg: string, options: CleanupOptions = {}): {
  cleaned: string;
  removedCount: number;
} {
  const {
    removeInvisibleElements = true,
    removeStrayPoints = false,
    threshold = 1,
    roundCoordinates = true,
    precision = 2,
    removeEmptyGroups = true,
    removeDuplicates = false,
  } = options;

  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  const svgElement = doc.documentElement;

  if (!svgElement || svgElement.nodeName !== 'svg') {
    throw new Error('Invalid SVG');
  }

  let removedCount = 0;

  // Remove invisible elements
  if (removeInvisibleElements) {
    const invisible = svgElement.querySelectorAll(
      '[display="none"], [visibility="hidden"], [opacity="0"]'
    );
    invisible.forEach((el) => {
      // Only remove if not referenced
      const id = el.getAttribute('id');
      if (!id || !svgElement.querySelector(`[href*="#${id}"], [xlink:href*="#${id}"]`)) {
        el.remove();
        removedCount++;
      }
    });
  }

  // Remove empty groups
  if (removeEmptyGroups) {
    const groups = svgElement.querySelectorAll('g');
    groups.forEach((group) => {
      if (group.children.length === 0 && !group.getAttribute('id')) {
        group.remove();
        removedCount++;
      }
    });
  }

  // Round coordinates
  if (roundCoordinates) {
    const numericAttrs = ['x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'width', 'height'];
    const allElements = svgElement.querySelectorAll('*');
    
    allElements.forEach((el) => {
      numericAttrs.forEach((attr) => {
        const value = el.getAttribute(attr);
        if (value) {
          const num = parseFloat(value);
          if (!isNaN(num)) {
            el.setAttribute(attr, num.toFixed(precision));
          }
        }
      });

      // Round path data
      if (el.tagName === 'path') {
        const d = el.getAttribute('d');
        if (d) {
          const rounded = d.replace(/(\d+\.\d+)/g, (match) => {
            return parseFloat(match).toFixed(precision);
          });
          el.setAttribute('d', rounded);
        }
      }
    });
  }

  // Remove stray points (points very close to each other)
  if (removeStrayPoints) {
    const paths = svgElement.querySelectorAll('path');
    paths.forEach((path) => {
      const d = path.getAttribute('d');
      if (!d) return;

      // Simplified: remove very short segments
      // In a full implementation, would parse path and remove points within threshold
      // This is a placeholder for the concept
    });
  }

  // Remove duplicate paths (basic comparison)
  if (removeDuplicates) {
    const paths = Array.from(svgElement.querySelectorAll('path'));
    const seen = new Set<string>();

    paths.forEach((path) => {
      const d = path.getAttribute('d') || '';
      const key = d.trim();
      
      if (seen.has(key)) {
        path.remove();
        removedCount++;
      } else {
        seen.add(key);
      }
    });
  }

  const cleaned = new XMLSerializer().serializeToString(svgElement);
  return { cleaned, removedCount };
}

