/**
 * Mask Manager Utilities
 * Generate and apply SVG mask definitions
 */

import type { SceneObject, Project } from '../state/types';

/**
 * Generate a unique mask ID for the scene
 */
export const ensureUniqueMaskId = (project: Project, baseId: string): string => {
  let maskId = baseId;
  let counter = 1;
  
  // Check all objects for existing mask IDs
  const allObjects = project.scene.layers.flatMap((layer) => layer.objects);
  const existingMaskIds = new Set(
    allObjects
      .filter((obj) => obj.maskId)
      .map((obj) => obj.maskId!)
  );
  
  while (existingMaskIds.has(maskId)) {
    maskId = `${baseId}-${counter}`;
    counter++;
  }
  
  return maskId;
};

/**
 * Generate mask definition (clipPath or mask element) from mask object
 */
export const generateMaskDefinition = (
  maskObject: SceneObject,
  maskId: string,
  maskType: 'clipPath' | 'mask',
  project: Project
): string => {
  // Find the mask object's asset
  const maskComponent = project.library.components.find((c) => c.id === maskObject.ref);
  const maskAsset = maskComponent
    ? project.library.assets.find((a) => a.id === maskComponent.base_asset)
    : project.library.assets.find((a) => a.id === maskObject.ref);
  
  if (!maskAsset) return '';
  
  // Get SVG data from mask asset
  let maskSvgData = maskAsset.data;
  if (maskObject.current_state && maskAsset.states) {
    const state = maskAsset.states.find((s) => s.name === maskObject.current_state);
    if (state) {
      maskSvgData = state.data;
    }
  }
  
  // Extract the shape from SVG (path, rect, circle, etc.)
  const parser = new DOMParser();
  const doc = parser.parseFromString(maskSvgData, 'image/svg+xml');
  const shape = doc.querySelector('path, rect, circle, ellipse, polygon, g');
  
  if (!shape) return '';
  
  // Clone the shape for the mask definition
  const clonedShape = shape.cloneNode(true) as Element;
  
  if (maskType === 'clipPath') {
    // Create clipPath element
    const clipPath = doc.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    clipPath.setAttribute('id', maskId);
    clipPath.appendChild(clonedShape);
    return new XMLSerializer().serializeToString(clipPath);
  } else {
    // Create mask element
    const mask = doc.createElementNS('http://www.w3.org/2000/svg', 'mask');
    mask.setAttribute('id', maskId);
    // For mask, we typically want white to show, black to hide
    clonedShape.setAttribute('fill', 'white');
    mask.appendChild(clonedShape);
    return new XMLSerializer().serializeToString(mask);
  }
};

/**
 * Apply mask to SVG string
 */
export const applyMaskToSvg = (
  svgData: string,
  maskId: string,
  maskType: 'clipPath' | 'mask'
): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgData, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) return svgData;
  
  // Apply mask attribute to all shapes
  const shapes = doc.querySelectorAll('path, rect, circle, ellipse, polygon, g');
  shapes.forEach((shape) => {
    if (maskType === 'clipPath') {
      shape.setAttribute('clip-path', `url(#${maskId})`);
    } else {
      shape.setAttribute('mask', `url(#${maskId})`);
    }
  });
  
  return new XMLSerializer().serializeToString(doc);
};

