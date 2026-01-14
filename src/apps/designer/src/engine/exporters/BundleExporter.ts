import type { Project, Asset, Component } from '../../state/types';
import { buildSpriteAtlas } from './AssetOptimizer';
import { createZip, type ZipEntry } from '../../utils/zipBuilder';

export interface BundleOptions {
  production?: boolean;
  includeRuntime?: boolean;
}

const encoder = new TextEncoder();

const sanitize = (value: string): string => value.replace(/[^a-zA-Z0-9_-]/g, '_');

const encodeText = (text: string): Uint8Array => encoder.encode(text);

const decodeBase64 = (base64: string): Uint8Array => {
  // Browser-compatible base64 decode (atob is available in all modern browsers)
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const dataUrlToBytes = (dataUrl: string): Uint8Array | null => {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return decodeBase64(match[2]);
};

const buildVibesRuntime = (): string => `export const evalVibe = (vibe, time = 0) => {
  if (!vibe || !vibe.type) return { scale: 1, translate: { x: 0, y: 0 }, rotate: 0, opacity: 1 };
  const intensity = vibe.intensity ?? 0.5;
  const speed = vibe.speed ?? vibe.frequency ?? 1;
  switch (vibe.type) {
    case 'pulse':
      return { scale: 1 + Math.sin(time * speed) * intensity * 0.2, translate: { x: 0, y: 0 }, rotate: 0, opacity: 1 };
    case 'float':
      return { scale: 1, translate: { x: 0, y: Math.sin(time * speed) * (vibe.amplitude ?? 10) * intensity }, rotate: 0, opacity: 1 };
    case 'shake':
      return { scale: 1, translate: { x: (Math.random() - 0.5) * 2 * intensity * 5, y: (Math.random() - 0.5) * 2 * intensity * 5 }, rotate: 0, opacity: 1 };
    case 'rotation':
      return { scale: 1, translate: { x: 0, y: 0 }, rotate: time * speed * 360, opacity: 1 };
    case 'opacity_flicker':
      return { scale: 1, translate: { x: 0, y: 0 }, rotate: 0, opacity: Math.min(1, 0.4 + (Math.random() > 0.98 ? intensity : 0)) };
    default:
      return { scale: 1, translate: { x: 0, y: 0 }, rotate: 0, opacity: 1 };
  }
};

export const applyVibeStack = (stack, time = 0) => {
  const result = { scale: 1, translate: { x: 0, y: 0 }, rotate: 0, opacity: 1 };
  (stack || []).forEach((vibe) => {
    const current = evalVibe(vibe, time);
    result.scale *= current.scale;
    result.translate.x += current.translate.x;
    result.translate.y += current.translate.y;
    result.rotate += current.rotate;
    result.opacity *= current.opacity;
  });
  return result;
};
`;

const buildRuntimeBridge = (): string => `import { applyVibeStack } from './vibes.js';

export const createRuntimeBridge = ({ manifest, library }) => {
  return {
    manifest,
    library,
    applyVibeStack,
  };
};
`;

const buildLogicFile = (components: Component[]): string => {
  const logic = {
    events: Object.fromEntries(
      components.map((component) => [component.id, component.events || []])
    ),
    stateMachines: Object.fromEntries(
      components.map((component) => [component.id, component.stateMachine || null])
    ),
  };
  return `export const logic = ${JSON.stringify(logic, null, 2)};`;
};

const buildStyles = (project: Project): string => {
  const palettes = project.library.palettes || [];
  if (palettes.length === 0) return ':root {}\n';

  const lines = palettes.flatMap((palette) =>
    Object.entries(palette.colors).map(([key, value]) => {
      return `  --palette-${sanitize(palette.id || palette.name)}-${sanitize(key)}: ${value};`;
    })
  );

  return `:root {\n${lines.join('\n')}\n}\n`;
};

const buildLibrary = (project: Project, options: BundleOptions) => {
  const assets = project.library.assets.map((asset) => {
    const fileBase = `assets/${asset.id}`;
    const states = asset.states?.map((state) => ({
      name: state.name,
      file: `${fileBase}__state__${sanitize(state.name)}.svg`,
    }));
    const file =
      asset.type === 'svg'
        ? `${fileBase}.svg`
        : asset.type === 'png'
        ? `${fileBase}.png`
        : null;
    return {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      file,
      tags: asset.tags || [],
      fx: asset.fx,
      fxStack: asset.fxStack,
      states,
    };
  });

  const components = project.library.components.map((component) => ({
    id: component.id,
    name: component.name,
    base_asset: component.base_asset,
    tags: component.tags || [],
    children: component.children || [],
    vibe: component.vibe,
    vibeStack: component.vibeStack || [],
    events: component.events || [],
    stateMachine: component.stateMachine || null,
    filters: options.production ? [] : component.filters || [],
  }));

  return {
    assets,
    components,
    vibe_templates: project.library.vibe_templates || [],
    palettes: project.library.palettes || [],
    prefabs: project.library.prefabs || [],
  };
};

const assetToEntry = (asset: Asset): ZipEntry[] => {
  if (asset.type === 'svg') {
    return [{ name: `assets/${asset.id}.svg`, data: encodeText(asset.data) }];
  }

  if (asset.type === 'png') {
    const decoded = dataUrlToBytes(asset.data);
    if (decoded) {
      return [{ name: `assets/${asset.id}.png`, data: decoded }];
    }
    return [{ name: `assets/${asset.id}.txt`, data: encodeText(asset.data) }];
  }

  return [];
};

const assetStatesToEntries = (asset: Asset): ZipEntry[] => {
  if (!asset.states || asset.states.length === 0) return [];
  return asset.states.map((state) => ({
    name: `assets/${asset.id}__state__${sanitize(state.name)}.svg`,
    data: encodeText(state.data),
  }));
};

export const buildBundleFiles = async (project: Project, options: BundleOptions = {}): Promise<ZipEntry[]> => {
  const manifest = {
    meta: project.meta,
    scene: project.scene,
    exportedAt: new Date().toISOString(),
  };
  const library = buildLibrary(project, options);

  const entries: ZipEntry[] = [
    { name: 'manifest.json', data: encodeText(JSON.stringify(manifest, null, 2)) },
    { name: 'library.json', data: encodeText(JSON.stringify(library, null, 2)) },
    { name: 'styles.css', data: encodeText(buildStyles(project)) },
    { name: 'vibes.js', data: encodeText(buildVibesRuntime()) },
    { name: 'logic.ts', data: encodeText(buildLogicFile(project.library.components)) },
  ];

  if (options.includeRuntime !== false) {
    entries.push({ name: 'runtimeBridge.js', data: encodeText(buildRuntimeBridge()) });
  }

  project.library.assets.forEach((asset) => {
    entries.push(...assetToEntry(asset));
    entries.push(...assetStatesToEntries(asset));
  });

  // Generate sprite atlas from PNG assets
  const atlas = await buildSpriteAtlas(project.library.assets);
  if (atlas) {
    entries.push({ name: 'assets/atlas.png', data: atlas.image });
    entries.push({ name: 'assets/atlas.json', data: encodeText(JSON.stringify(atlas.map, null, 2)) });
  }

  return entries;
};

export const exportBundleZip = async (project: Project, options: BundleOptions = {}): Promise<Blob> => {
  const entries = await buildBundleFiles(project, options);
  const zipBytes = createZip(entries);
  // Type assertion needed due to TypeScript's strict type checking for ArrayBufferLike vs ArrayBuffer
  // At runtime, Uint8Array works perfectly fine with Blob constructor
  return new Blob([zipBytes as BlobPart], { type: 'application/zip' });
};
