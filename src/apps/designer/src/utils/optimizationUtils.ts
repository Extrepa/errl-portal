/**
 * Project Health and Optimization Utilities
 */

import type { Project, Asset, Component } from '../state/types';
import { findAssetUsage } from './assetIntelligence';

export interface HealthDiagnostics {
  score: number; // 0-100
  unusedAssets: Asset[];
  largeAssets: Array<{ asset: Asset; size: number }>;
  highComplexityAssets: Asset[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Calculate project health score
 */
export const calculateHealthScore = (project: Project): HealthDiagnostics => {
  const unusedAssets: Asset[] = [];
  const largeAssets: Array<{ asset: Asset; size: number }> = [];
  const highComplexityAssets: Asset[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check for unused assets
  for (const asset of project.library.assets) {
    const usage = findAssetUsage(asset.id, project);
    if (usage.totalInstances === 0) {
      unusedAssets.push(asset);
    }
  }

  // Check for large assets
  for (const asset of project.library.assets) {
    const size = new Blob([asset.data]).size;
    if (size > 50000) { // 50KB threshold
      largeAssets.push({ asset, size });
    }
  }

  // Check for high complexity (simple heuristic: many paths)
  for (const asset of project.library.assets) {
    const pathCount = (asset.data.match(/<path[^>]*>/g) || []).length;
    if (pathCount > 50) {
      highComplexityAssets.push(asset);
    }
  }

  // Generate warnings
  if (unusedAssets.length > 0) {
    warnings.push(`${unusedAssets.length} unused asset(s) found`);
  }
  if (largeAssets.length > 0) {
    warnings.push(`${largeAssets.length} large asset(s) (>50KB) found`);
  }
  if (highComplexityAssets.length > 0) {
    warnings.push(`${highComplexityAssets.length} high complexity asset(s) found`);
  }

  // Generate suggestions
  if (unusedAssets.length > 0) {
    suggestions.push('Consider removing unused assets to reduce project size');
  }
  if (largeAssets.length > 0) {
    suggestions.push('Optimize large assets by simplifying paths or reducing detail');
  }
  if (highComplexityAssets.length > 0) {
    suggestions.push('Consider simplifying complex assets for better performance');
  }

  // Calculate score (0-100)
  let score = 100;
  score -= unusedAssets.length * 5; // -5 per unused asset
  score -= largeAssets.length * 3; // -3 per large asset
  score -= highComplexityAssets.length * 2; // -2 per complex asset
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    unusedAssets,
    largeAssets,
    highComplexityAssets,
    warnings,
    suggestions,
  };
};

/**
 * Find unused assets
 */
export const findUnusedAssets = (project: Project): Asset[] => {
  return project.library.assets.filter((asset) => {
    const usage = findAssetUsage(asset.id, project);
    return usage.totalInstances === 0;
  });
};

/**
 * Simplify SVG paths (basic implementation)
 */
export const simplifyPath = (pathData: string, tolerance: number = 1): string => {
  // This is a placeholder - real path simplification would use algorithms like
  // Douglas-Peucker or Visvalingam-Whyatt
  // For now, return original path
  return pathData;
};

/**
 * Check resolution issues
 */
export const checkResolution = (asset: Asset): {
  valid: boolean;
  warning?: string;
} => {
  if (asset.type === 'png') {
    // For PNG assets, check if dimensions are reasonable
    // This would require image loading, so for now return valid
    return { valid: true };
  }
  return { valid: true };
};

