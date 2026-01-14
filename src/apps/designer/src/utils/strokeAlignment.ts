/**
 * Stroke Alignment Utilities
 * Convert SVG stroke to path with offset for inside/outside alignment
 */

/**
 * Convert stroke to path with alignment offset
 * Note: This is a simplified implementation. Full path offset requires complex algorithms.
 * For production, consider using a library like `path-data-polyfill` or `paper.js`
 */
export const convertStrokeToPath = (
  svgPath: string,
  strokeWidth: number,
  alignment: 'inside' | 'center' | 'outside'
): string => {
  if (alignment === 'center') {
    return svgPath; // No conversion needed for center alignment
  }

  // For inside/outside, we need to offset the path
  // This is a placeholder - full implementation would require:
  // 1. Parsing path commands
  // 2. Calculating perpendicular vectors for each segment
  // 3. Offsetting by strokeWidth/2 (inside) or -strokeWidth/2 (outside)
  // 4. Handling intersections and self-intersections
  
  // For now, return a warning that this feature requires additional work
  console.warn('Stroke alignment conversion requires path offset algorithm. Using center alignment.');
  return svgPath;
};

/**
 * Offset path by given amount
 * This is a placeholder - requires complex path offset algorithm
 */
export const offsetPath = (pathData: string, offset: number): string => {
  // Placeholder implementation
  // Full implementation would:
  // 1. Parse path into segments
  // 2. Calculate perpendicular vectors
  // 3. Offset each point
  // 4. Handle curve offsets (Bezier curves)
  // 5. Handle intersections
  
  console.warn('Path offset requires complex algorithm. Consider using a library.');
  return pathData;
};

/**
 * Check if path is closed
 */
export const isPathClosed = (pathData: string): boolean => {
  return pathData.trim().endsWith('Z') || pathData.trim().endsWith('z');
};

