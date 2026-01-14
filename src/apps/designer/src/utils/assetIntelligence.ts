/**
 * Asset Intelligence Utilities
 * Auto-tagging, similarity matching, and usage analysis
 */

import type { Asset, Component, Project } from '../state/types';

export interface AssetAnalysis {
  complexity: 'simple' | 'medium' | 'complex';
  colorCount: number;
  boundingBox: { width: number; height: number };
  pathCount: number;
  tags: string[];
}

/**
 * Analyze SVG and extract metadata
 */
export const analyzeAsset = (asset: Asset): AssetAnalysis => {
  const svgData = asset.data;
  
  // Extract path elements
  const pathMatches = svgData.match(/<path[^>]*>/g) || [];
  const pathCount = pathMatches.length;

  // Extract colors (fill and stroke)
  const colorMatches = [
    ...svgData.matchAll(/fill=["']([^"']+)["']/g),
    ...svgData.matchAll(/stroke=["']([^"']+)["']/g),
  ];
  const uniqueColors = new Set(
    colorMatches
      .map((m) => m[1])
      .filter((c) => c && c !== 'none' && c !== 'transparent' && !c.startsWith('url'))
  );
  const colorCount = uniqueColors.size;

  // Extract viewBox or width/height for bounding box
  const viewBoxMatch = svgData.match(/viewBox=["']([^"']+)["']/);
  const widthMatch = svgData.match(/width=["']([^"']+)["']/);
  const heightMatch = svgData.match(/height=["']([^"']+)["']/);
  
  let boundingBox = { width: 100, height: 100 };
  if (viewBoxMatch) {
    const [, x, y, w, h] = viewBoxMatch[1].split(/\s+/).map(Number);
    boundingBox = { width: w || 100, height: h || 100 };
  } else if (widthMatch && heightMatch) {
    boundingBox = {
      width: parseFloat(widthMatch[1]) || 100,
      height: parseFloat(heightMatch[1]) || 100,
    };
  }

  // Determine complexity
  let complexity: 'simple' | 'medium' | 'complex' = 'simple';
  if (pathCount > 20 || colorCount > 10) {
    complexity = 'complex';
  } else if (pathCount > 5 || colorCount > 3) {
    complexity = 'medium';
  }

  // Auto-generate tags
  const tags: string[] = [];
  if (complexity === 'complex') tags.push('complex');
  if (complexity === 'simple') tags.push('simple');
  if (colorCount > 5) tags.push('colorful');
  if (pathCount > 10) tags.push('detailed');
  if (boundingBox.width > 500 || boundingBox.height > 500) tags.push('large');
  if (boundingBox.width < 50 && boundingBox.height < 50) tags.push('small');

  // Detect shapes
  if (svgData.includes('<circle')) tags.push('circular');
  if (svgData.includes('<rect')) tags.push('rectangular');
  if (svgData.includes('<polygon')) tags.push('polygonal');

  return {
    complexity,
    colorCount,
    boundingBox,
    pathCount,
    tags,
  };
};

/**
 * Calculate similarity between two assets
 */
export const calculateSimilarity = (asset1: Asset, asset2: Asset): number => {
  const analysis1 = analyzeAsset(asset1);
  const analysis2 = analyzeAsset(asset2);

  let similarity = 0;
  let factors = 0;

  // Compare complexity
  if (analysis1.complexity === analysis2.complexity) {
    similarity += 0.3;
  }
  factors += 0.3;

  // Compare color count (within 20% difference)
  const colorDiff = Math.abs(analysis1.colorCount - analysis2.colorCount);
  const maxColors = Math.max(analysis1.colorCount, analysis2.colorCount);
  if (maxColors > 0) {
    similarity += 0.2 * (1 - Math.min(colorDiff / maxColors, 1));
  }
  factors += 0.2;

  // Compare bounding box (within 20% difference)
  const sizeDiff = Math.abs(
    analysis1.boundingBox.width * analysis1.boundingBox.height -
    analysis2.boundingBox.width * analysis2.boundingBox.height
  );
  const maxSize = Math.max(
    analysis1.boundingBox.width * analysis1.boundingBox.height,
    analysis2.boundingBox.width * analysis2.boundingBox.height
  );
  if (maxSize > 0) {
    similarity += 0.2 * (1 - Math.min(sizeDiff / maxSize, 1));
  }
  factors += 0.2;

  // Compare tags
  const commonTags = analysis1.tags.filter((tag) => analysis2.tags.includes(tag));
  const allTags = new Set([...analysis1.tags, ...analysis2.tags]);
  if (allTags.size > 0) {
    similarity += 0.3 * (commonTags.length / allTags.size);
  }
  factors += 0.3;

  return factors > 0 ? similarity / factors : 0;
};

/**
 * Find similar assets
 */
export const findSimilarAssets = (asset: Asset, project: Project, threshold: number = 0.6): Asset[] => {
  return project.library.assets
    .filter((a) => a.id !== asset.id)
    .map((a) => ({
      asset: a,
      similarity: calculateSimilarity(asset, a),
    }))
    .filter((result) => result.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .map((result) => result.asset);
};

/**
 * Find usage of an asset across the project
 */
export const findAssetUsage = (assetId: string, project: Project): {
  scenes: number;
  components: number;
  totalInstances: number;
} => {
  let sceneCount = 0;
  let componentCount = 0;
  let totalInstances = 0;

  // Count in scene objects
  for (const layer of project.scene.layers) {
    for (const obj of layer.objects) {
      if (obj.ref === assetId) {
        sceneCount++;
        totalInstances++;
      }
    }
  }

  // Count in components
  for (const component of project.library.components) {
    if (component.base_asset === assetId) {
      componentCount++;
    }
    // Check nested children
    if (component.children?.includes(assetId)) {
      componentCount++;
    }
  }

  return {
    scenes: sceneCount,
    components: componentCount,
    totalInstances: sceneCount + componentCount,
  };
};

/**
 * Auto-tag asset based on analysis
 */
export const autoTagAsset = (asset: Asset): string[] => {
  const analysis = analyzeAsset(asset);
  return analysis.tags;
};

