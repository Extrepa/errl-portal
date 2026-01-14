import type { Project } from '../state/types';

export const serializeProject = (project: Project): string => {
  return JSON.stringify(project, null, 2);
};

export const hydrateProject = (input: string | Project): Project => {
  const data = typeof input === 'string' ? (JSON.parse(input) as Project) : input;
  return {
    meta: {
      name: data?.meta?.name || 'Untitled',
      resolution: data?.meta?.resolution || [1920, 1080],
      fps: data?.meta?.fps ?? 60,
    },
    library: {
      assets: data?.library?.assets || [],
      components: data?.library?.components || [],
      palettes: data?.library?.palettes || [],
      vibe_templates: data?.library?.vibe_templates || [],
      prefabs: data?.library?.prefabs || [],
    },
    scene: {
      layers: data?.scene?.layers || [],
      background: data?.scene?.background,
      groups: data?.scene?.groups || [],
    },
  };
};
