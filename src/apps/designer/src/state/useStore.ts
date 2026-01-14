import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Project, Asset, Component, SceneObject, SceneLayer, AppMode, Selection, GridSettings, Group, VibeTemplate, AssetVersion, ColorPalette, ToolType, Prefab, TimelineState } from './types';
import { hydrateProject } from '../utils/manifestSerializer';
import { HistoryManager } from '@shared/utils/historyManager';

const createEmptyProject = (): Project => ({
  meta: {
    name: 'Untitled',
    resolution: [1920, 1080],
    fps: 60,
  },
  library: {
    assets: [],
    components: [],
    palettes: [],
    vibe_templates: [],
    prefabs: [],
  },
  scene: {
    layers: [
      {
        id: 'layer_1',
        name: 'Layer 1',
        objects: [],
      },
    ],
    groups: [],
  },
});

// Create history manager instance
let historyManager = new HistoryManager(createEmptyProject(), {
  mode: 'past-present-future',
  maxHistory: 50,
});

interface ProjectStore {
  // Project state
  project: Project | null;
  setProject: (project: Project) => void;
  loadProject: (projectData: Project) => void;

  // History (undo/redo)
  pushToHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Mode management
  mode: AppMode;
  setMode: (mode: AppMode) => void;

  // Selection
  selection: Selection;
  setSelection: (selection: Selection) => void;
  clearSelection: () => void;

  // Grid settings
  gridSettings: GridSettings;
  setGridSettings: (settings: Partial<GridSettings>) => void;

  // Tool selection
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;

  // Library operations - Assets
  addAsset: (asset: Asset) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  removeAsset: (id: string) => void;
  getAsset: (id: string) => Asset | undefined;
  createVersionSnapshot: (assetId: string, name?: string) => void;
  rollbackToVersion: (assetId: string, versionId: string) => void;

  // Library operations - Components
  addComponent: (component: Component) => void;
  updateComponent: (id: string, updates: Partial<Component>) => void;
  removeComponent: (id: string) => void;
  getComponent: (id: string) => Component | undefined;

  // Scene operations - Layers
  addLayer: (layer: SceneLayer) => void;
  updateLayer: (id: string, updates: Partial<SceneLayer>) => void;
  removeLayer: (id: string) => void;
  reorderLayers: (orderedIds: string[]) => void;

  // Scene operations - Objects
  addSceneObject: (layerId: string, object: SceneObject) => void;
  updateSceneObject: (layerId: string, objectId: string, updates: Partial<SceneObject>) => void;
  removeSceneObject: (layerId: string, objectId: string) => void;
  moveSceneObject: (fromLayerId: string, toLayerId: string, objectId: string) => void;
  updateSceneObjectVisibility: (layerId: string, objectId: string, visible: boolean) => void;
  updateSceneObjectLock: (layerId: string, objectId: string, locked: boolean) => void;
  applyMask: (targetObjectId: string, maskObjectId: string, maskType: 'clipPath' | 'mask') => void;
  removeMask: (objectId: string) => void;

  // Sync operations
  updateAssetData: (assetId: string, data: string) => void; // Triggers sync to all scene instances

  // Group operations
  createGroup: (objectIds: string[], name?: string) => string | null; // Returns group ID
  ungroup: (groupId: string) => void;
  addObjectToGroup: (groupId: string, objectId: string) => void;
  removeObjectFromGroup: (groupId: string, objectId: string) => void;
  getGroup: (groupId: string) => Group | undefined;

  // Vibe Template operations
  addVibeTemplate: (template: VibeTemplate) => void;
  updateVibeTemplate: (id: string, updates: Partial<VibeTemplate>) => void;
  removeVibeTemplate: (id: string) => void;
  getVibeTemplate: (id: string) => VibeTemplate | undefined;
  applyVibeTemplateToComponent: (componentId: string, template: VibeTemplate) => void;

  // Palette operations
  addPalette: (palette: ColorPalette) => void;
  updatePalette: (id: string, updates: Partial<ColorPalette>) => void;
  removePalette: (id: string) => void;
  getPalette: (id: string) => ColorPalette | undefined;

  // Prefab operations
  addPrefab: (prefab: Prefab) => void;
  updatePrefab: (id: string, updates: Partial<Prefab>) => void;
  removePrefab: (id: string) => void;
  getPrefab: (id: string) => Prefab | undefined;
  saveSelectionAsPrefab: (objectIds: string[], name?: string) => string | null;

  // Vibe preview toggle
  vibePreviewEnabled: boolean;
  toggleVibePreview: () => void;

  // Prefab helpers
  insertPrefab: (prefab: Prefab) => void;

  // Timeline operations
  timeline: TimelineState;
  setTimeline: (timeline: Partial<TimelineState>) => void;
  playTimeline: () => void;
  pauseTimeline: () => void;
  stopTimeline: () => void;
  seekTimeline: (time: number) => void;
  setTimelineSpeed: (speed: number) => void;
  toggleTimelineLoop: () => void;
}

export const useStore = create<ProjectStore>()(
  devtools(
    (set, get) => ({
      project: createEmptyProject(),
      mode: { type: 'scene-maker' },
      selection: {},
      gridSettings: {
        enabled: true,
        size: 16,
        visible: true,
      },
      activeTool: null,
      vibePreviewEnabled: true,
      timeline: {
        isPlaying: false,
        currentTime: 0,
        duration: 10, // Default 10 seconds
        playbackSpeed: 1,
        loop: false,
      },

      pushToHistory: () => {
        const { project } = get();
        if (!project) return;

        const snapshot = JSON.parse(JSON.stringify(project));
        historyManager.pushState(snapshot);
      },

      undo: () => {
        const prevProject = historyManager.undo();
        if (prevProject === null) return;

        set({
          project: JSON.parse(JSON.stringify(prevProject)),
        });
      },

      redo: () => {
        const nextProject = historyManager.redo();
        if (nextProject === null) return;

        set({
          project: JSON.parse(JSON.stringify(nextProject)),
        });
      },

      canUndo: () => {
        return historyManager.getCanUndo();
      },

      canRedo: () => {
        return historyManager.getCanRedo();
      },

      setProject: (project) => {
        // Initialize history manager with new project
        historyManager = new HistoryManager(project, {
          mode: 'past-present-future',
          maxHistory: 50,
        });
        set({ project });
        get().pushToHistory();
      },

      loadProject: (projectData) => {
        const hydratedProject = hydrateProject(projectData);
        // Initialize history manager with loaded project
        historyManager = new HistoryManager(hydratedProject, {
          mode: 'past-present-future',
          maxHistory: 50,
        });
        set({ project: hydratedProject });
      },

      setMode: (mode) => set({ mode }),

      setSelection: (selection) => set({ selection }),
      clearSelection: () => set({ selection: {} }),

      setActiveTool: (tool) => set({ activeTool: tool }),

      setGridSettings: (settings) =>
        set((state) => ({
          gridSettings: { ...state.gridSettings, ...settings },
        })),

      // Asset operations
      addAsset: (asset) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              library: {
                ...state.project.library,
                assets: [...state.project.library.assets, asset],
              },
            },
          };
        }),

      updateAsset: (id, updates) => {
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              library: {
                ...state.project.library,
                assets: state.project.library.assets.map((asset) =>
                  asset.id === id ? { ...asset, ...updates } : asset
                ),
              },
            },
          };
        });
        get().pushToHistory();
      },

      removeAsset: (id) => {
        set((state) => {
          if (!state.project) return state;
          // Also remove from components that reference this asset
          const updatedComponents = state.project.library.components.filter(
            (comp) => comp.base_asset !== id
          );
          return {
            project: {
              ...state.project,
              library: {
                assets: state.project.library.assets.filter((asset) => asset.id !== id),
                components: updatedComponents,
              },
            },
          };
        });
        get().pushToHistory();
      },

      getAsset: (id) => {
        const state = get();
        return state.project?.library.assets.find((asset) => asset.id === id);
      },

      createVersionSnapshot: (assetId, name) => {
        set((state) => {
          if (!state.project) return state;
          const asset = state.project.library.assets.find((a) => a.id === assetId);
          if (!asset) return state;

          const version: AssetVersion = {
            id: `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            data: asset.data,
            name: name || `Version ${(asset.history?.length || 0) + 1}`,
          };

          return {
            project: {
              ...state.project,
              library: {
                ...state.project.library,
                assets: state.project.library.assets.map((a) =>
                  a.id === assetId
                    ? { ...a, history: [...(a.history || []), version] }
                    : a
                ),
              },
            },
          };
        });
      },

      rollbackToVersion: (assetId, versionId) => {
        set((state) => {
          if (!state.project) return state;
          const asset = state.project.library.assets.find((a) => a.id === assetId);
          if (!asset || !asset.history) return state;

          const version = asset.history.find((v) => v.id === versionId);
          if (!version) return state;

          return {
            project: {
              ...state.project,
              library: {
                ...state.project.library,
                assets: state.project.library.assets.map((a) =>
                  a.id === assetId ? { ...a, data: version.data } : a
                ),
              },
            },
          };
        });
        get().pushToHistory();
      },

      // Component operations
      addComponent: (component) => {
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              library: {
                ...state.project.library,
                components: [...state.project.library.components, component],
              },
            },
          };
        });
        get().pushToHistory();
      },

      updateComponent: (id, updates) => {
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              library: {
                ...state.project.library,
                components: state.project.library.components.map((component) =>
                  component.id === id ? { ...component, ...updates } : component
                ),
              },
            },
          };
        });
        get().pushToHistory();
      },

      removeComponent: (id) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              library: {
                ...state.project.library,
                components: state.project.library.components.filter((comp) => comp.id !== id),
              },
            },
          };
        }),

      getComponent: (id) => {
        const state = get();
        return state.project?.library.components.find((component) => component.id === id);
      },

      // Layer operations
      addLayer: (layer) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              scene: {
                ...state.project.scene,
                layers: [...state.project.scene.layers, layer],
              },
            },
          };
        }),

      updateLayer: (id, updates) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              scene: {
                ...state.project.scene,
                layers: state.project.scene.layers.map((layer) =>
                  layer.id === id ? { ...layer, ...updates } : layer
                ),
              },
            },
          };
        }),

      removeLayer: (id) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              scene: {
                ...state.project.scene,
                layers: state.project.scene.layers.filter((layer) => layer.id !== id),
              },
            },
          };
        }),

      reorderLayers: (orderedIds) =>
        set((state) => {
          if (!state.project) return state;
          const layerMap = new Map(state.project.scene.layers.map((layer) => [layer.id, layer]));
          const reorderedLayers = orderedIds
            .map((id) => layerMap.get(id))
            .filter((layer): layer is SceneLayer => layer !== undefined);
          return {
            project: {
              ...state.project,
              scene: {
                ...state.project.scene,
                layers: reorderedLayers,
              },
            },
          };
        }),

      // Scene object operations
      addSceneObject: (layerId, object) => {
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              scene: {
                ...state.project.scene,
                layers: state.project.scene.layers.map((layer) =>
                  layer.id === layerId
                    ? { ...layer, objects: [...layer.objects, object] }
                    : layer
                ),
              },
            },
          };
        });
        get().pushToHistory();
      },

      updateSceneObject: (layerId, objectId, updates) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              scene: {
                ...state.project.scene,
                layers: state.project.scene.layers.map((layer) =>
                  layer.id === layerId
                    ? {
                        ...layer,
                        objects: layer.objects.map((obj) =>
                          obj.id === objectId ? { ...obj, ...updates } : obj
                        ),
                      }
                    : layer
                ),
              },
            },
          };
        }),

      updateSceneObjectVisibility: (layerId, objectId, visible) => {
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              scene: {
                ...state.project.scene,
                layers: state.project.scene.layers.map((layer) =>
                  layer.id === layerId
                    ? {
                        ...layer,
                        objects: layer.objects.map((obj) =>
                          obj.id === objectId ? { ...obj, visible } : obj
                        ),
                      }
                    : layer
                ),
              },
            },
          };
        });
        get().pushToHistory();
      },

      updateSceneObjectLock: (layerId, objectId, locked) => {
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              scene: {
                ...state.project.scene,
                layers: state.project.scene.layers.map((layer) =>
                  layer.id === layerId
                    ? {
                        ...layer,
                        objects: layer.objects.map((obj) =>
                          obj.id === objectId ? { ...obj, locked } : obj
                        ),
                      }
                    : layer
                ),
              },
            },
          };
        });
        get().pushToHistory();
      },

      applyMask: (targetObjectId, maskObjectId, maskType) => {
        set((state) => {
          if (!state.project) return state;
          
          // Find both objects in the scene
          let targetLayerId: string | undefined;
          let targetObj: SceneObject | undefined;
          
          for (const layer of state.project.scene.layers) {
            targetObj = layer.objects.find((o) => o.id === targetObjectId);
            if (targetObj) {
              targetLayerId = layer.id;
              break;
            }
          }
          
          if (!targetObj || !targetLayerId) return state;
          
          return {
            project: {
              ...state.project,
              scene: {
                ...state.project.scene,
                layers: state.project.scene.layers.map((layer) =>
                  layer.id === targetLayerId
                    ? {
                        ...layer,
                        objects: layer.objects.map((obj) =>
                          obj.id === targetObjectId
                            ? { ...obj, maskId: maskObjectId, maskType }
                            : obj
                        ),
                      }
                    : layer
                ),
              },
            },
          };
        });
        get().pushToHistory();
      },

      removeMask: (objectId) => {
        set((state) => {
          if (!state.project) return state;
          
          // Find the object
          let objectLayerId: string | undefined;
          
          for (const layer of state.project.scene.layers) {
            const obj = layer.objects.find((o) => o.id === objectId);
            if (obj) {
              objectLayerId = layer.id;
              break;
            }
          }
          
          if (!objectLayerId) return state;
          
          return {
            project: {
              ...state.project,
              scene: {
                ...state.project.scene,
                layers: state.project.scene.layers.map((layer) =>
                  layer.id === objectLayerId
                    ? {
                        ...layer,
                        objects: layer.objects.map((obj) =>
                          obj.id === objectId
                            ? { ...obj, maskId: undefined, maskType: undefined }
                            : obj
                        ),
                      }
                    : layer
                ),
              },
            },
          };
        });
        get().pushToHistory();
      },

      removeSceneObject: (layerId, objectId) => {
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              scene: {
                ...state.project.scene,
                layers: state.project.scene.layers.map((layer) =>
                  layer.id === layerId
                    ? {
                        ...layer,
                        objects: layer.objects.filter((obj) => obj.id !== objectId),
                      }
                    : layer
                ),
              },
            },
          };
        });
        get().pushToHistory();
      },

      moveSceneObject: (fromLayerId, toLayerId, objectId) =>
        set((state) => {
          if (!state.project) return state;
          let objectToMove: SceneObject | undefined;
          const updatedLayers = state.project.scene.layers.map((layer) => {
            if (layer.id === fromLayerId) {
              objectToMove = layer.objects.find((obj) => obj.id === objectId);
              return {
                ...layer,
                objects: layer.objects.filter((obj) => obj.id !== objectId),
              };
            }
            if (layer.id === toLayerId && objectToMove) {
              return {
                ...layer,
                objects: [...layer.objects, objectToMove],
              };
            }
            return layer;
          });
          return {
            project: {
              ...state.project,
              scene: {
                ...state.project.scene,
                layers: updatedLayers,
              },
            },
          };
        }),

      // Sync operation - updates asset data and triggers re-render of all instances
      updateAssetData: (assetId, data) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              library: {
                ...state.project.library,
                assets: state.project.library.assets.map((asset) =>
                  asset.id === assetId ? { ...asset, data } : asset
                ),
              },
            },
          };
        }),

      // Group operations
      createGroup: (objectIds, name) => {
        const state = get();
        if (!state.project || objectIds.length === 0) return null;

        const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newGroup: Group = {
          id: groupId,
          name: name || `Group ${(state.project.scene.groups?.length || 0) + 1}`,
          object_ids: objectIds,
        };

        // Update objects to reference the group
        const updatedLayers = state.project.scene.layers.map((layer) => ({
          ...layer,
          objects: layer.objects.map((obj) =>
            objectIds.includes(obj.id) ? { ...obj, group_id: groupId } : obj
          ),
        }));

        set({
          project: {
            ...state.project,
            scene: {
              ...state.project.scene,
              layers: updatedLayers,
              groups: [...(state.project.scene.groups || []), newGroup],
            },
          },
        });

        return groupId;
      },

      ungroup: (groupId) => {
        const state = get();
        if (!state.project) return;

        // Remove group_id from all objects in the group
        const updatedLayers = state.project.scene.layers.map((layer) => ({
          ...layer,
          objects: layer.objects.map((obj) =>
            obj.group_id === groupId ? { ...obj, group_id: undefined } : obj
          ),
        }));

        // Remove the group
        const updatedGroups = (state.project.scene.groups || []).filter((g) => g.id !== groupId);

        set({
          project: {
            ...state.project,
            scene: {
              ...state.project.scene,
              layers: updatedLayers,
              groups: updatedGroups,
            },
          },
        });
      },

      addObjectToGroup: (groupId, objectId) => {
        const state = get();
        if (!state.project) return;

        // Update object to reference the group
        const updatedLayers = state.project.scene.layers.map((layer) => ({
          ...layer,
          objects: layer.objects.map((obj) =>
            obj.id === objectId ? { ...obj, group_id: groupId } : obj
          ),
        }));

        // Add object to group's object_ids
        const updatedGroups = (state.project.scene.groups || []).map((group) =>
          group.id === groupId
            ? { ...group, object_ids: [...group.object_ids, objectId] }
            : group
        );

        set({
          project: {
            ...state.project,
            scene: {
              ...state.project.scene,
              layers: updatedLayers,
              groups: updatedGroups,
            },
          },
        });
      },

      removeObjectFromGroup: (groupId, objectId) => {
        const state = get();
        if (!state.project) return;

        // Remove group_id from object
        const updatedLayers = state.project.scene.layers.map((layer) => ({
          ...layer,
          objects: layer.objects.map((obj) =>
            obj.id === objectId ? { ...obj, group_id: undefined } : obj
          ),
        }));

        // Remove object from group's object_ids
        const updatedGroups = (state.project.scene.groups || []).map((group) =>
          group.id === groupId
            ? { ...group, object_ids: group.object_ids.filter((id) => id !== objectId) }
            : group
        );

        set({
          project: {
            ...state.project,
            scene: {
              ...state.project.scene,
              layers: updatedLayers,
              groups: updatedGroups,
            },
          },
        });
      },

      getGroup: (groupId) => {
        const state = get();
        if (!state.project) return undefined;
        return state.project.scene.groups?.find((g) => g.id === groupId);
      },

      // Vibe Template operations
      addVibeTemplate: (template) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              library: {
                ...state.project.library,
                vibe_templates: [...(state.project.library.vibe_templates || []), template],
              },
            },
          };
        }),

      updateVibeTemplate: (id, updates) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              library: {
                ...state.project.library,
                vibe_templates: (state.project.library.vibe_templates || []).map((template) =>
                  template.id === id ? { ...template, ...updates } : template
                ),
              },
            },
          };
        }),

      removeVibeTemplate: (id) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              library: {
                ...state.project.library,
                vibe_templates: (state.project.library.vibe_templates || []).filter(
                  (template) => template.id !== id
                ),
              },
            },
          };
        }),

      getVibeTemplate: (id) => {
        const state = get();
        if (!state.project) return undefined;
        return state.project.library.vibe_templates?.find((t) => t.id === id);
      },

      applyVibeTemplateToComponent: (componentId, template) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              library: {
                ...state.project.library,
                components: state.project.library.components.map((c) =>
                  c.id === componentId ? { ...c, vibe: template.vibe } : c
                ),
              },
            },
          };
        }),

      // Palette operations
      addPalette: (palette) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              library: {
                ...state.project.library,
                palettes: [...(state.project.library.palettes || []), palette],
              },
            },
          };
        }),

      updatePalette: (id, updates) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              library: {
                ...state.project.library,
                palettes: (state.project.library.palettes || []).map((palette) =>
                  palette.id === id ? { ...palette, ...updates } : palette
                ),
              },
            },
          };
        }),

      removePalette: (id) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              library: {
                ...state.project.library,
                palettes: (state.project.library.palettes || []).filter((palette) => palette.id !== id),
              },
            },
          };
        }),

      getPalette: (id) => {
        const state = get();
        if (!state.project) return undefined;
        return state.project.library.palettes?.find((p) => p.id === id);
      },

      // Prefab operations
      addPrefab: (prefab) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              library: {
                ...state.project.library,
                prefabs: [...(state.project.library.prefabs || []), prefab],
              },
            },
          };
        }),

      updatePrefab: (id, updates) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              library: {
                ...state.project.library,
                prefabs: (state.project.library.prefabs || []).map((prefab) =>
                  prefab.id === id ? { ...prefab, ...updates } : prefab
                ),
              },
            },
          };
        }),

      removePrefab: (id) =>
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              library: {
                ...state.project.library,
                prefabs: (state.project.library.prefabs || []).filter(
                  (prefab) => prefab.id !== id
                ),
              },
            },
          };
        }),

      getPrefab: (id) => {
        const state = get();
        if (!state.project) return undefined;
        return state.project.library.prefabs?.find((p) => p.id === id);
      },

      toggleVibePreview: () =>
        set((state) => ({
          vibePreviewEnabled: !state.vibePreviewEnabled,
        })),

      insertPrefab: (prefab) =>
        set((state) => {
          if (!state.project) return state;
          const layer = prefab.sceneGraph.layers[0];
          return {
            project: {
              ...state.project,
              scene: {
                ...state.project.scene,
                layers: [...state.project.scene.layers, layer],
              },
              library: {
                ...state.project.library,
                prefabs: [...(state.project.library.prefabs || []), prefab],
              },
            },
          };
        }),

      saveSelectionAsPrefab: (objectIds, name) => {
        const state = get();
        if (!state.project || objectIds.length === 0) return null;

        // Collect objects and their layers
        const objects: SceneObject[] = [];
        const layerIds = new Set<string>();

        for (const layer of state.project.scene.layers) {
          for (const obj of layer.objects) {
            if (objectIds.includes(obj.id)) {
              objects.push(obj);
              layerIds.add(layer.id);
            }
          }
        }

        if (objects.length === 0) return null;

        const prefab: Prefab = {
          id: `prefab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: name || `Prefab ${(state.project.library.prefabs?.length || 0) + 1}`,
          sceneGraph: {
            layers: state.project.scene.layers.filter((l) => layerIds.has(l.id)),
            objects: objects,
          },
        };

        get().addPrefab(prefab);
        return prefab.id;
      },

      // Timeline operations
      setTimeline: (updates) =>
        set((state) => ({
          timeline: { ...state.timeline, ...updates },
        })),

      playTimeline: () =>
        set((state) => ({
          timeline: { ...state.timeline, isPlaying: true },
        })),

      pauseTimeline: () =>
        set((state) => ({
          timeline: { ...state.timeline, isPlaying: false },
        })),

      stopTimeline: () =>
        set((state) => ({
          timeline: { ...state.timeline, isPlaying: false, currentTime: 0 },
        })),

      seekTimeline: (time) =>
        set((state) => ({
          timeline: {
            ...state.timeline,
            currentTime: Math.max(0, Math.min(time, state.timeline.duration)),
          },
        })),

      setTimelineSpeed: (speed) =>
        set((state) => ({
          timeline: { ...state.timeline, playbackSpeed: speed },
        })),

      toggleTimelineLoop: () =>
        set((state) => ({
          timeline: { ...state.timeline, loop: !state.timeline.loop },
        })),
    }),
    { name: 'ProjectStore' }
  )
);
