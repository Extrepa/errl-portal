/**
 * Template Manager
 * Handles saving, loading, and managing templates (SVG, Scene, Vibe)
 */

import type { Asset, Component, VibeConfig, Project } from '../state/types';

export type TemplateType = 'svg' | 'scene' | 'vibe';

export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  thumbnail?: string; // Base64 data URL or URL
  data: any; // Template-specific data
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'multi_tool_templates';

/**
 * Generate a thumbnail for SVG (simplified - just return a placeholder)
 */
async function generateSVGThumbnail(svg: string): Promise<string> {
  // In a full implementation, would render SVG to canvas and convert to data URL
  // For now, return a placeholder
  return 'data:image/svg+xml;base64,' + btoa(svg.substring(0, 200));
}

/**
 * Save a template
 */
export async function saveTemplate(
  name: string,
  type: TemplateType,
  data: any,
  tags: string[] = [],
  thumbnail?: string
): Promise<string> {
  const templates = loadTemplates();
  
  const template: Template = {
    id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    type,
    data,
    tags,
    thumbnail: thumbnail || (type === 'svg' && data ? await generateSVGThumbnail(data) : undefined),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  templates.push(template);
  saveTemplates(templates);

  return template.id;
}

/**
 * Load all templates
 */
export function loadTemplates(): Template[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Save templates to storage
 */
function saveTemplates(templates: Template[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Failed to save templates:', error);
  }
}

/**
 * Load a template by ID
 */
export function loadTemplate(id: string): Template | null {
  const templates = loadTemplates();
  return templates.find((t) => t.id === id) || null;
}

/**
 * Delete a template
 */
export function deleteTemplate(id: string): boolean {
  const templates = loadTemplates();
  const filtered = templates.filter((t) => t.id !== id);
  
  if (filtered.length === templates.length) {
    return false; // Template not found
  }
  
  saveTemplates(filtered);
  return true;
}

/**
 * Get templates by type
 */
export function getTemplatesByType(type: TemplateType): Template[] {
  return loadTemplates().filter((t) => t.type === type);
}

/**
 * Search templates by name or tags
 */
export function searchTemplates(query: string, type?: TemplateType): Template[] {
  const templates = type ? getTemplatesByType(type) : loadTemplates();
  const lowerQuery = query.toLowerCase();
  
  return templates.filter((t) => 
    t.name.toLowerCase().includes(lowerQuery) ||
    t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Update template
 */
export function updateTemplate(id: string, updates: Partial<Template>): boolean {
  const templates = loadTemplates();
  const index = templates.findIndex((t) => t.id === id);
  
  if (index === -1) return false;
  
  templates[index] = {
    ...templates[index],
    ...updates,
    updatedAt: Date.now(),
  };
  
  saveTemplates(templates);
  return true;
}

/**
 * Create template from asset
 */
export async function createTemplateFromAsset(asset: Asset, name: string, tags: string[] = []): Promise<string> {
  if (asset.type !== 'svg') {
    throw new Error('Only SVG assets can be saved as templates');
  }
  
  return saveTemplate(name, 'svg', asset.data, tags);
}

/**
 * Create template from scene
 */
export async function createTemplateFromScene(project: Project, name: string, tags: string[] = []): Promise<string> {
  return saveTemplate(name, 'scene', {
    layers: project.scene.layers,
    background: project.scene.background,
    groups: project.scene.groups,
  }, tags);
}

/**
 * Create template from vibe
 */
export async function createTemplateFromVibe(vibe: VibeConfig, name: string, tags: string[] = []): Promise<string> {
  return saveTemplate(name, 'vibe', vibe, tags);
}

