/**
 * Transform utilities for scene hierarchy
 * Handles parent-child transform propagation
 */

import type { SceneObject, Project } from '../state/types';

export interface Transform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

/**
 * Calculate the global transform of an object considering parent transforms
 */
export const getGlobalTransform = (
  object: SceneObject,
  project: Project
): Transform => {
  let x = object.x;
  let y = object.y;
  let scale = object.scale;
  let rotation = object.rotation || 0;

  // Traverse up the parent chain
  let currentParentId = object.parent_id;
  while (currentParentId) {
    // Find parent object
    let parentObject: SceneObject | undefined;
    for (const layer of project.scene.layers) {
      parentObject = layer.objects.find((o) => o.id === currentParentId);
      if (parentObject) break;
    }

    if (!parentObject) break;

    // Apply parent transform
    const parentRotation = (parentObject.rotation || 0) * (Math.PI / 180);
    const cos = Math.cos(parentRotation);
    const sin = Math.sin(parentRotation);

    // Rotate position relative to parent
    const rotatedX = x * cos - y * sin;
    const rotatedY = x * sin + y * cos;

    // Apply parent translation
    x = parentObject.x + rotatedX * parentObject.scale;
    y = parentObject.y + rotatedY * parentObject.scale;

    // Apply parent scale
    scale *= parentObject.scale;

    // Apply parent rotation
    rotation += parentObject.rotation || 0;

    // Move to next parent
    currentParentId = parentObject.parent_id;
  }

  return { x, y, scale, rotation };
};

/**
 * Calculate local position from global position (inverse transform)
 */
export const getLocalTransform = (
  globalX: number,
  globalY: number,
  parent: SceneObject | null
): { x: number; y: number } => {
  if (!parent) {
    return { x: globalX, y: globalY };
  }

  // Get parent's global transform
  // For now, assume parent is at root level (simplified)
  const parentRotation = (parent.rotation || 0) * (Math.PI / 180);
  const cos = Math.cos(-parentRotation);
  const sin = Math.sin(-parentRotation);

  // Translate to parent's local space
  const translatedX = globalX - parent.x;
  const translatedY = globalY - parent.y;

  // Rotate back
  const localX = (translatedX * cos - translatedY * sin) / parent.scale;
  const localY = (translatedX * sin + translatedY * cos) / parent.scale;

  return { x: localX, y: localY };
};

/**
 * Get all children of an object
 */
export const getChildren = (
  objectId: string,
  project: Project
): SceneObject[] => {
  const children: SceneObject[] = [];
  for (const layer of project.scene.layers) {
    for (const obj of layer.objects) {
      if (obj.parent_id === objectId) {
        children.push(obj);
      }
    }
  }
  return children;
};

/**
 * Check if object A is an ancestor of object B
 */
export const isAncestor = (
  ancestorId: string,
  descendantId: string,
  project: Project
): boolean => {
  // Find descendant object
  let currentObject: SceneObject | undefined;
  for (const layer of project.scene.layers) {
    currentObject = layer.objects.find((o) => o.id === descendantId);
    if (currentObject) break;
  }

  if (!currentObject) return false;

  // Traverse up the parent chain
  let currentParentId = currentObject.parent_id;
  while (currentParentId) {
    if (currentParentId === ancestorId) return true;

    // Find parent
    for (const layer of project.scene.layers) {
      const parent = layer.objects.find((o) => o.id === currentParentId);
      if (parent) {
        currentParentId = parent.parent_id;
        break;
      }
    }
    if (!currentParentId) break;
  }

  return false;
};

