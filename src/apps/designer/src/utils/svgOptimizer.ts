/**
 * SVG Optimizer
 * Cleans and optimizes SVG code
 */

export interface OptimizerOptions {
  removeComments?: boolean;
  removeMetadata?: boolean;
  removeUnusedDefs?: boolean;
  combinePaths?: boolean;
  optimizePaths?: boolean;
  roundCoordinates?: boolean;
  precision?: number; // Number of decimal places (default: 2)
  removeHiddenElements?: boolean;
  minifyWhitespace?: boolean;
}

export interface OptimizerStats {
  originalSize: number;
  optimizedSize: number;
  pathCount: number;
  elementCount: number;
  reductionPercent: number;
}

/**
 * Optimize SVG string with various options
 */
export function optimizeSVG(svg: string, options: OptimizerOptions = {}): {
  optimized: string;
  stats: OptimizerStats;
} {
  const {
    removeComments = true,
    removeMetadata = true,
    removeUnusedDefs = true,
    combinePaths = false,
    optimizePaths = true,
    roundCoordinates = true,
    precision = 2,
    removeHiddenElements = true,
    minifyWhitespace = true,
  } = options;

  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  const svgElement = doc.documentElement;

  if (!svgElement || svgElement.nodeName !== 'svg') {
    throw new Error('Invalid SVG');
  }

  const originalSize = svg.length;
  let pathCount = 0;
  let elementCount = 0;

  // Remove comments
  if (removeComments) {
    const walker = doc.createTreeWalker(doc, NodeFilter.SHOW_COMMENT, null);
    const comments: Node[] = [];
    let node;
    while ((node = walker.nextNode())) {
      comments.push(node);
    }
    comments.forEach((comment) => {
      if (comment.parentNode) {
        comment.parentNode.removeChild(comment);
      }
    });
  }

  // Remove metadata
  if (removeMetadata) {
    const metadata = svgElement.querySelectorAll('metadata, title, desc');
    metadata.forEach((el) => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  }

  // Remove hidden elements
  if (removeHiddenElements) {
    const hidden = svgElement.querySelectorAll('[display="none"], [visibility="hidden"], [opacity="0"]');
    hidden.forEach((el) => {
      // Only remove if it's not used by a reference
      const id = el.getAttribute('id');
      if (!id || !svgElement.querySelector(`[href*="#${id}"], [xlink:href*="#${id}"]`)) {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      }
    });
  }

  // Collect all defs and check usage
  if (removeUnusedDefs) {
    const defs = svgElement.querySelector('defs');
    if (defs) {
      const allDefs = Array.from(defs.children);
      const usedIds = new Set<string>();

      // Find all ID references
      const allElements = svgElement.querySelectorAll('*');
      allElements.forEach((el) => {
        // Check various reference attributes
        ['href', 'xlink:href', 'clip-path', 'mask', 'fill', 'stroke', 'filter'].forEach((attr) => {
          const value = el.getAttribute(attr) || el.getAttribute(attr.replace(':', ''));
          if (value && value.includes('#')) {
            const id = value.split('#')[1].split(/[ )]/)[0];
            if (id) usedIds.add(id);
          }
        });
      });

      // Remove unused defs
      allDefs.forEach((def) => {
        const id = def.getAttribute('id');
        if (id && !usedIds.has(id) && def.tagName !== 'style') {
          if (def.parentNode) {
            def.parentNode.removeChild(def);
          }
        }
      });
    }
  }

  // Round coordinates in path data
  if (roundCoordinates && optimizePaths) {
    const paths = svgElement.querySelectorAll('path, circle, ellipse, rect, line, polyline, polygon');
    paths.forEach((path) => {
      // Round numeric attributes
      ['x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'width', 'height'].forEach((attr) => {
        const value = path.getAttribute(attr);
        if (value) {
          const num = parseFloat(value);
          if (!isNaN(num)) {
            path.setAttribute(attr, num.toFixed(precision));
          }
        }
      });

      // Round path data
      if (path.tagName === 'path') {
        const d = path.getAttribute('d');
        if (d) {
          // Simple path coordinate rounding (can be enhanced)
          const rounded = d.replace(/(\d+\.\d+)/g, (match) => {
            return parseFloat(match).toFixed(precision);
          });
          path.setAttribute('d', rounded);
        }
      }

      // Count paths
      if (path.tagName === 'path') pathCount++;
      elementCount++;
    });
  } else {
    // Just count elements
    const paths = svgElement.querySelectorAll('path');
    pathCount = paths.length;
    const allElements = svgElement.querySelectorAll('*');
    elementCount = allElements.length;
  }

  // Combine adjacent paths with same style (basic implementation)
  if (combinePaths) {
    const paths = Array.from(svgElement.querySelectorAll('path'));
    const pathGroups = new Map<string, Element[]>();

    paths.forEach((path) => {
      // Create a key from style attributes
      const key = [
        path.getAttribute('fill') || 'none',
        path.getAttribute('stroke') || 'none',
        path.getAttribute('stroke-width') || '0',
        path.getAttribute('opacity') || '1',
      ].join('|');

      if (!pathGroups.has(key)) {
        pathGroups.set(key, []);
      }
      pathGroups.get(key)!.push(path);
    });

    // Combine paths in each group (basic - just concatenate path data)
    pathGroups.forEach((group) => {
      if (group.length > 1) {
        const first = group[0];
        const paths = group.slice(1);
        const firstD = first.getAttribute('d') || '';
        const combinedD = paths
          .map((p) => p.getAttribute('d'))
          .filter((d) => d)
          .join(' ');
        first.setAttribute('d', firstD + ' ' + combinedD);
        paths.forEach((p) => p.remove());
      }
    });
  }

  // Minify whitespace
  let optimized = new XMLSerializer().serializeToString(svgElement);
  if (minifyWhitespace) {
    optimized = optimized
      .replace(/>\s+</g, '><') // Remove whitespace between tags
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();
  }

  const optimizedSize = optimized.length;
  const reductionPercent = originalSize > 0
    ? ((originalSize - optimizedSize) / originalSize) * 100
    : 0;

  return {
    optimized,
    stats: {
      originalSize,
      optimizedSize,
      pathCount,
      elementCount,
      reductionPercent: Math.round(reductionPercent * 100) / 100,
    },
  };
}

