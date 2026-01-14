/**
 * Responsive layout utilities
 * Handles anchor-based positioning and responsive calculations
 */

import type { SceneObject, AnchorConfig, Project } from '../state/types';

/**
 * Calculate final position based on anchor and container size
 */
export const calculateAnchoredPosition = (
  object: SceneObject,
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } => {
  if (!object.anchor) {
    return { x: object.x, y: object.y };
  }

  const anchor = object.anchor;
  let x = object.x;
  let y = object.y;

  // Calculate X based on anchor
  switch (anchor.x) {
    case 'left':
      x = object.x; // Keep original X
      break;
    case 'center':
      x = containerWidth / 2 + object.x; // Offset from center
      break;
    case 'right':
      x = containerWidth - object.x; // Offset from right
      break;
  }

  // Calculate Y based on anchor
  switch (anchor.y) {
    case 'top':
      y = object.y; // Keep original Y
      break;
    case 'middle':
      y = containerHeight / 2 + object.y; // Offset from middle
      break;
    case 'bottom':
      y = containerHeight - object.y; // Offset from bottom
      break;
  }

  return { x, y };
};

/**
 * Get all objects with anchors in a project
 */
export const getAnchoredObjects = (project: Project): SceneObject[] => {
  const objects: SceneObject[] = [];
  for (const layer of project.scene.layers) {
    for (const obj of layer.objects) {
      if (obj.anchor) {
        objects.push(obj);
      }
    }
  }
  return objects;
};

/**
 * Convert anchor config to CSS anchor positioning (if supported)
 */
export const anchorToCSS = (anchor: AnchorConfig): string => {
  const xMap: Record<string, string> = {
    left: 'left',
    center: 'center',
    right: 'right',
  };
  const yMap: Record<string, string> = {
    top: 'top',
    middle: 'center',
    bottom: 'bottom',
  };
  return `${xMap[anchor.x]} ${yMap[anchor.y]}`;
};

