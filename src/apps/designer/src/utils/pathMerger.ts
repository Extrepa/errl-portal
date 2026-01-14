import { performBooleanOperationMultiple, type BooleanOperation } from '@shared/utils/paper';

/**
 * Merge all path elements in an SVG string using a boolean operation (default union).
 * Returns the updated SVG string or null if merge fails.
 */
export const mergePathsInSvg = async (svg: string, operation: BooleanOperation = 'union'): Promise<string | null> => {
  if (!svg) return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  const paths = Array.from(doc.querySelectorAll('path'));
  if (paths.length < 2) return null;

  const dValues = paths
    .map((p) => p.getAttribute('d'))
    .filter((d): d is string => !!d && d.trim().length > 0);

  if (dValues.length < 2) return null;

  const merged = await performBooleanOperationMultiple(dValues, operation);
  if (!merged) return null;

  // Keep first path, replace its data, remove the rest
  paths[0].setAttribute('d', merged);
  for (let i = 1; i < paths.length; i++) {
    paths[i].remove();
  }

  return new XMLSerializer().serializeToString(doc);
};
