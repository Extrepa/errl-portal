/**
 * Scene sizing utilities
 * Calculate dimensions for scene objects based on their referenced assets/components
 */

import type { SceneObject, Project } from '../state/types';
import { getBoundingBox } from './measurementUtils';

/**
 * Get dimensions of a scene object based on its referenced asset or component
 */
export function getObjectDimensions(object: SceneObject, project: Project): { width: number; height: number } {
  // Default dimensions if asset/component not found
  const defaultSize = { width: 100, height: 100 };

  // Find the referenced asset or component
  const asset = project.library.assets.find((a) => a.id === object.ref);
  const component = project.library.components.find((c) => c.id === object.ref);

  // Use component's base asset if component exists
  const targetAsset = component
    ? project.library.assets.find((a) => a.id === component.base_asset) || asset
    : asset;

  if (!targetAsset || targetAsset.type !== 'svg') {
    return defaultSize;
  }

  // Get bounding box from SVG
  const bbox = getBoundingBox(targetAsset.data);
  if (bbox) {
    return { width: bbox.width, height: bbox.height };
  }

  return defaultSize;
}

