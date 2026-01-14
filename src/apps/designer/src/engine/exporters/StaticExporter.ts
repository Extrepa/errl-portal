import type { Project } from '../../state/types';
import { svgToPngBlob } from '../../utils/imageExport';
import { serializeProject } from '../../utils/manifestSerializer';

/**
 * Static Exporter
 * Generates high-res PNG/SVG capture of the entire Scene
 */
export const exportStaticSVG = (project: Project): string => {
  const [width, height] = project.meta.resolution;
  
  // Collect all objects from all layers
  const allObjects = project.scene.layers.flatMap((layer) =>
    layer.objects.map((obj) => ({ ...obj, layerId: layer.id }))
  );

  // Sort by z-index
  allObjects.sort((a, b) => a.z - b.z);

  // Build SVG
  const svgElements = allObjects
    .map((obj) => {
      const asset = project.library.assets.find((a) => a.id === obj.ref);
      if (!asset || asset.type !== 'svg') return '';

      // Extract SVG content and apply transforms
      const svgContent = asset.data.replace(/<svg[^>]*>/, '').replace('</svg>', '');
      return `
    <g transform="translate(${obj.x}, ${obj.y}) scale(${obj.scale}) rotate(${obj.rotation || 0})">
      ${svgContent}
    </g>`;
    })
    .join('');

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${project.scene.background || '#000000'}" />
  ${svgElements}
</svg>`;
};

export const exportStaticPNG = async (project: Project): Promise<Blob> => {
  const [width, height] = project.meta.resolution;
  const svg = exportStaticSVG(project);
  return svgToPngBlob(svg, width, height);
};

export const exportProjectJSON = (project: Project): string => {
  return serializeProject(project);
};
