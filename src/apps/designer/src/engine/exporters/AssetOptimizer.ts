import type { Asset } from '../../state/types';

/**
 * Asset Optimizer
 * Path simplification and atlas generation utilities
 */

/**
 * Convert data URL to Image element
 */
const dataUrlToImage = (dataUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
};

/**
 * Simplifies SVG paths by removing redundant nodes
 */
export const simplifySVGPath = (svgData: string): string => {
  // Basic path simplification - remove extra whitespace and optimize
  return svgData
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
};

/**
 * Sanitizes IDs in JSON to prevent conflicts when exporting multiple components
 */
export const sanitizeIds = (data: any, prefix: string = 'comp'): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeIds(item, prefix));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === 'id' && typeof value === 'string') {
      sanitized[key] = `${prefix}_${value.replace(/[^a-zA-Z0-9]/g, '_')}`;
    } else if (key === 'ref' && typeof value === 'string') {
      sanitized[key] = `${prefix}_${value.replace(/[^a-zA-Z0-9]/g, '_')}`;
    } else {
      sanitized[key] = sanitizeIds(value, prefix);
    }
  }

  return sanitized;
};

export interface SpriteAtlasEntry {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteAtlas {
  image: Uint8Array;
  map: Record<string, SpriteAtlasEntry>;
}

/**
 * Build a sprite atlas from PNG assets
 * Combines multiple PNG images into a single atlas image with position mapping
 */
export const buildSpriteAtlas = async (assets: Asset[]): Promise<SpriteAtlas | null> => {
  // Filter PNG assets
  const pngAssets = assets.filter((asset) => asset.type === 'png');
  if (pngAssets.length === 0) {
    return null;
  }

  try {
    // Load all images
    const imageData = await Promise.all(
      pngAssets.map(async (asset) => {
        const img = await dataUrlToImage(asset.data);
        return {
          assetId: asset.id,
          image: img,
          width: img.width,
          height: img.height,
        };
      })
    );

    // Calculate atlas dimensions (simple grid layout)
    const padding = 2;
    const cols = Math.ceil(Math.sqrt(pngAssets.length));
    const maxWidth = Math.max(...imageData.map((d) => d.width));
    const maxHeight = Math.max(...imageData.map((d) => d.height));

    const atlasWidth = cols * (maxWidth + padding);
    const rows = Math.ceil(pngAssets.length / cols);
    const atlasHeight = rows * (maxHeight + padding);

    // Create canvas and draw images
    const canvas = document.createElement('canvas');
    canvas.width = atlasWidth;
    canvas.height = atlasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, atlasWidth, atlasHeight);

    const map: Record<string, SpriteAtlasEntry> = {};

    // Draw each image and record position
    imageData.forEach((data, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * (maxWidth + padding);
      const y = row * (maxHeight + padding);

      ctx.drawImage(data.image, x, y);

      map[data.assetId] = {
        x,
        y,
        width: data.width,
        height: data.height,
      };
    });

    // Convert canvas to PNG Uint8Array
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        blob.arrayBuffer().then((buffer) => {
          resolve({
            image: new Uint8Array(buffer),
            map,
          });
        });
      }, 'image/png');
    });
  } catch (error) {
    console.error('Failed to build sprite atlas:', error);
    return null;
  }
};
