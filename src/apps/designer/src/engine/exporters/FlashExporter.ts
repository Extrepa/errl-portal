import type { Project } from '../../state/types';

/**
 * Flash Bundle Exporter
 * Converts the JSON Scene Graph into a format compatible with Flash engines (OpenFL/Haxe)
 */
export const exportFlashBundle = (project: Project): string => {
  const manifest = {
    name: project.meta.name,
    resolution: project.meta.resolution,
    assets: project.library.assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      data: asset.data,
      // Convert SVG to optimized format for Flash
      svgData: asset.type === 'svg' ? asset.data : null,
    })),
    scene: {
      background: project.scene.background || '#000000',
      layers: project.scene.layers.map((layer) => ({
        id: layer.id,
        name: layer.name,
        objects: layer.objects.map((obj) => ({
          id: obj.id,
          assetId: obj.ref,
          x: obj.x,
          y: obj.y,
          z: obj.z,
          scale: obj.scale,
          rotation: obj.rotation || 0,
        })),
      })),
    },
  };

  return JSON.stringify(manifest, null, 2);
};

