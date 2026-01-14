import React, { useState } from 'react';
import { GripVertical, ChevronUp, ChevronDown, Trash2, Group, Ungroup, ChevronRight, Eye, EyeOff, Lock, Unlock, Zap, Sparkles } from 'lucide-react';
import { useStore } from '../../state/useStore';
import { getChildren, isAncestor } from '../../utils/transformUtils';
import type { SceneObject } from '../../state/types';
import { VibeControls } from './VibeControls';
import { getObjectDimensions } from '../../utils/sceneSizing';

export const SceneInspector: React.FC = () => {
  const { project, selection, setSelection, reorderLayers, removeSceneObject, updateSceneObject, createGroup, ungroup, saveSelectionAsPrefab, updateSceneObjectVisibility, updateSceneObjectLock, applyMask, removeMask } = useStore();
  const [draggedObjectId, setDraggedObjectId] = useState<string | null>(null);
  const [expandedObjects, setExpandedObjects] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; objectId: string } | null>(null);

  if (!project) {
    return (
      <div className="p-4">
        <p className="text-xs text-[#888888]">No project loaded</p>
      </div>
    );
  }

  const allObjects = project.scene.layers.flatMap((layer) =>
    layer.objects.map((obj) => ({ ...obj, layerId: layer.id, layerName: layer.name }))
  );
  const selectedObject = selection.sceneObjectId
    ? allObjects.find((obj) => obj.id === selection.sceneObjectId)
    : null;
  const selectedDimensions = selectedObject ? getObjectDimensions(selectedObject, project) : null;

  const handleMoveLayer = (layerId: string, direction: 'up' | 'down') => {
    if (!project) return;
    
    const currentIndex = project.scene.layers.findIndex(l => l.id === layerId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0 || newIndex >= project.scene.layers.length) return;

    const newOrder = [...project.scene.layers];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
    reorderLayers(newOrder.map(l => l.id));
  };

  const handleMoveObjectZ = (layerId: string, objectId: string, direction: 'up' | 'down') => {
    if (!project) return;
    
    const layer = project.scene.layers.find(l => l.id === layerId);
    if (!layer) return;

    const obj = layer.objects.find(o => o.id === objectId);
    if (!obj) return;

    const newZ = direction === 'up' 
      ? obj.z + 1 
      : Math.max(1, obj.z - 1);
    
    updateSceneObject(layerId, objectId, { z: newZ });
  };

  // Build tree structure: get root objects (no parent)
  const getRootObjects = (): Array<SceneObject & { layerId: string; layerName?: string }> => {
    if (!project) return [];
    return project.scene.layers.flatMap((layer) =>
      layer.objects
        .filter((obj) => !obj.parent_id)
        .map((obj) => ({ ...obj, layerId: layer.id, layerName: layer.name }))
    );
  };

  const handleDragStart = (objectId: string) => {
    setDraggedObjectId(objectId);
  };

  const handleDragOver = (e: React.DragEvent, targetObjectId: string) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, targetObjectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedObjectId || !project || draggedObjectId === targetObjectId) {
      setDraggedObjectId(null);
      return;
    }

    // Prevent circular references
    if (isAncestor(draggedObjectId, targetObjectId, project)) {
      setDraggedObjectId(null);
      return;
    }

    // Find the dragged object and its layer
    let draggedObj: SceneObject | undefined;
    let draggedLayerId: string | undefined;
    for (const layer of project.scene.layers) {
      draggedObj = layer.objects.find((o) => o.id === draggedObjectId);
      if (draggedObj) {
        draggedLayerId = layer.id;
        break;
      }
    }

    if (!draggedObj || !draggedLayerId) {
      setDraggedObjectId(null);
      return;
    }

    // Set parent
    updateSceneObject(draggedLayerId, draggedObjectId, { parent_id: targetObjectId });
    setDraggedObjectId(null);
  };

  const handleUnnest = (objectId: string) => {
    if (!project) return;
    
    // Find the object and its layer
    for (const layer of project.scene.layers) {
      const obj = layer.objects.find((o) => o.id === objectId);
      if (obj && obj.parent_id) {
        updateSceneObject(layer.id, objectId, { parent_id: undefined });
        break;
      }
    }
  };

  const toggleExpand = (objectId: string) => {
    setExpandedObjects((prev) => {
      const next = new Set(prev);
      if (next.has(objectId)) {
        next.delete(objectId);
      } else {
        next.add(objectId);
      }
      return next;
    });
  };

  const renderObjectTree = (
    obj: SceneObject & { layerId: string; layerName?: string },
    depth: number = 0
  ): React.ReactNode => {
    if (!project) return null;

    const children = getChildren(obj.id, project);
    const hasChildren = children.length > 0;
    const isExpanded = expandedObjects.has(obj.id);
    const component = project.library.components.find((c) => c.id === obj.ref);
    const asset = component 
      ? project.library.assets.find((a) => a.id === component.base_asset)
      : project.library.assets.find((a) => a.id === obj.ref);
    const isSelected = selection.sceneObjectId === obj.id;

    return (
      <div key={obj.id}>
        <div
          draggable
          onDragStart={() => handleDragStart(obj.id)}
          onDragOver={(e) => handleDragOver(e, obj.id)}
          onDrop={(e) => handleDrop(e, obj.id)}
          className={`
            flex items-center gap-2 px-2 py-1 rounded text-xs group
            ${isSelected 
              ? 'bg-[#2D2D2D] text-[#00FF9D]' 
              : 'hover:bg-[#2D2D2D] text-[#E0E0E0]'
            }
          `}
          style={{ marginLeft: `${depth * 12}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(obj.id)}
              className="p-0.5 text-[#888888] hover:text-[#E0E0E0]"
            >
              <ChevronRight 
                size={12} 
                className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>
          ) : (
            <div className="w-3" />
          )}
          <GripVertical size={12} className="text-[#888888]" />
          <div
            onClick={() => {
              if (component) {
                setSelection({ sceneObjectId: obj.id, componentId: component.id });
              } else {
                setSelection({ sceneObjectId: obj.id, assetId: obj.ref });
              }
            }}
            className="flex-1 truncate cursor-pointer flex items-center gap-1"
          >
            {/* Component tag (V icon) */}
            {component && (
              <Sparkles size={10} className="text-[#00FF9D]" />
            )}
            {/* Lightning bolt for active vibes */}
            {component?.vibe && (
              <Zap size={10} className="text-yellow-400" />
            )}
            {component?.name || asset?.name || obj.ref}
            {obj.parent_id && <span className="text-[#666666] ml-1">(child)</span>}
          </div>
          <div className="flex items-center gap-1">
            {/* Visibility Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const currentVisible = obj.visible ?? true;
                updateSceneObjectVisibility(obj.layerId, obj.id, !currentVisible);
              }}
              className="p-1 text-[#888888] hover:text-[#E0E0E0] opacity-0 group-hover:opacity-100 transition-opacity"
              title={(obj.visible ?? true) === false ? 'Show' : 'Hide'}
            >
              {(obj.visible ?? true) === false ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
            {/* Lock Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const currentLocked = obj.locked ?? false;
                updateSceneObjectLock(obj.layerId, obj.id, !currentLocked);
              }}
              className={`p-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                (obj.locked ?? false) ? 'text-yellow-400' : 'text-[#888888] hover:text-[#E0E0E0]'
              }`}
              title={(obj.locked ?? false) ? 'Unlock' : 'Lock'}
            >
              {(obj.locked ?? false) ? <Lock size={12} /> : <Unlock size={12} />}
            </button>
            {obj.parent_id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnnest(obj.id);
                }}
                className="px-1.5 py-0.5 text-[10px] bg-[#121212] border border-[#333333] rounded text-[#888888] hover:text-[#E0E0E0]"
                title="Unnest from parent"
              >
                Unnest
              </button>
            )}
            {/* Anchor Selector */}
            <div className="relative group/anchor">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Toggle anchor panel
                }}
                className="px-1.5 py-0.5 text-[10px] bg-[#121212] border border-[#333333] rounded text-[#888888] hover:text-[#E0E0E0]"
                title="Set anchor point"
              >
                {obj.anchor ? `${obj.anchor.x[0]}${obj.anchor.y[0]}` : 'An'}
              </button>
              <div className="absolute right-0 top-full mt-1 p-2 bg-[#1E1E1E] border border-[#333333] rounded shadow-lg opacity-0 invisible group-hover/anchor:opacity-100 group-hover/anchor:visible transition-all z-50">
                <div className="grid grid-cols-3 gap-1">
                  {(['top', 'middle', 'bottom'] as const).map((y) =>
                    (['left', 'center', 'right'] as const).map((x) => (
                      <button
                        key={`${x}-${y}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSceneObject(obj.layerId, obj.id, {
                            anchor: { x, y },
                          });
                        }}
                        className={`w-6 h-6 text-[8px] rounded ${
                          obj.anchor?.x === x && obj.anchor?.y === y
                            ? 'bg-[#00FF9D] text-[#121212]'
                            : 'bg-[#121212] text-[#888888] hover:bg-[#2D2D2D]'
                        }`}
                        title={`${x} ${y}`}
                      >
                        {x[0]}{y[0]}
                      </button>
                    ))
                  )}
                </div>
                {obj.anchor && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateSceneObject(obj.layerId, obj.id, { anchor: undefined });
                    }}
                    className="mt-2 w-full px-2 py-1 text-[10px] bg-[#121212] border border-red-500/50 rounded text-red-400 hover:bg-[#2D2D2D]"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <span className="text-[#888888] min-w-[2rem] text-right">
              z:{obj.z}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Delete this object?')) {
                  removeSceneObject(obj.layerId, obj.id);
                }
              }}
              className="p-1 text-[#888888] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete object"
            >
              <Trash2 size={10} />
            </button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {children.map((child) => {
              // Find child with layer info
              for (const layer of project.scene.layers) {
                const childObj = layer.objects.find((o) => o.id === child.id);
                if (childObj) {
                  return renderObjectTree(
                    { ...childObj, layerId: layer.id, layerName: layer.name },
                    depth + 1
                  );
                }
              }
              return null;
            })}
          </div>
        )}
        {isSelected && (
          <div className="px-2 pb-3">
            <div className="border-t border-[#333333] pt-2">
              <VibeControls
                componentId={component?.id}
                assetId={!component ? obj.ref : undefined}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-[#E0E0E0] mb-4">Scene Hierarchy</h3>
      <p className="text-xs text-[#888888] mb-3">
        Drag objects to nest them. Double-click to expand/collapse.
      </p>

      {selectedObject && (
        <div className="mb-4 p-3 bg-[#121212] border border-[#333333] rounded">
          <div className="text-xs font-medium text-[#E0E0E0] mb-2">Transform</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex flex-col gap-1 text-[#888888]">
              X
              <input
                type="number"
                value={selectedObject.x}
                onChange={(e) =>
                  updateSceneObject(selectedObject.layerId, selectedObject.id, {
                    x: parseFloat(e.target.value) || 0,
                  })
                }
                className="px-2 py-1 bg-[#0a0a0a] border border-[#333333] rounded text-[#E0E0E0]"
              />
            </label>
            <label className="flex flex-col gap-1 text-[#888888]">
              Y
              <input
                type="number"
                value={selectedObject.y}
                onChange={(e) =>
                  updateSceneObject(selectedObject.layerId, selectedObject.id, {
                    y: parseFloat(e.target.value) || 0,
                  })
                }
                className="px-2 py-1 bg-[#0a0a0a] border border-[#333333] rounded text-[#E0E0E0]"
              />
            </label>
            <label className="flex flex-col gap-1 text-[#888888]">
              Scale
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={selectedObject.scale}
                onChange={(e) =>
                  updateSceneObject(selectedObject.layerId, selectedObject.id, {
                    scale: Math.max(0.1, parseFloat(e.target.value) || 0.1),
                  })
                }
                className="px-2 py-1 bg-[#0a0a0a] border border-[#333333] rounded text-[#E0E0E0]"
              />
            </label>
            <label className="flex flex-col gap-1 text-[#888888]">
              Rotation
              <input
                type="number"
                step="1"
                value={selectedObject.rotation || 0}
                onChange={(e) =>
                  updateSceneObject(selectedObject.layerId, selectedObject.id, {
                    rotation: parseFloat(e.target.value) || 0,
                  })
                }
                className="px-2 py-1 bg-[#0a0a0a] border border-[#333333] rounded text-[#E0E0E0]"
              />
            </label>
            <label className="flex flex-col gap-1 text-[#888888]">
              Z
              <input
                type="number"
                step="1"
                value={selectedObject.z}
                onChange={(e) =>
                  updateSceneObject(selectedObject.layerId, selectedObject.id, {
                    z: Math.max(0, Math.round(parseFloat(e.target.value) || 0)),
                  })
                }
                className="px-2 py-1 bg-[#0a0a0a] border border-[#333333] rounded text-[#E0E0E0]"
              />
            </label>
            <div className="flex flex-col gap-1 text-[#888888]">
              Size
              <div className="px-2 py-1 bg-[#0a0a0a] border border-[#333333] rounded text-[#E0E0E0]">
                {selectedDimensions
                  ? `${Math.round(selectedDimensions.width * selectedObject.scale)} × ${Math.round(
                      selectedDimensions.height * selectedObject.scale
                    )}`
                  : '—'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layer controls */}
      <div className="mb-4 space-y-1">
        {project.scene.layers.map((layer, layerIndex) => (
          <div key={layer.id} className="flex items-center justify-between px-2 py-1 bg-[#121212] rounded">
            <div className="text-xs text-[#888888]">
              {layer.name || layer.id}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleMoveLayer(layer.id, 'down')}
                disabled={layerIndex === 0}
                className="p-1 text-[#888888] hover:text-[#E0E0E0] disabled:opacity-30"
                title="Move layer down"
              >
                <ChevronDown size={12} />
              </button>
              <button
                onClick={() => handleMoveLayer(layer.id, 'up')}
                disabled={layerIndex === project.scene.layers.length - 1}
                className="p-1 text-[#888888] hover:text-[#E0E0E0] disabled:opacity-30"
                title="Move layer up"
              >
                <ChevronUp size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tree view */}
      <div className="space-y-1" onClick={() => setContextMenu(null)}>
        {getRootObjects().map((obj) => renderObjectTree(obj))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-[#1E1E1E] border border-[#333333] rounded shadow-lg z-50 py-1 min-w-[150px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              // Flatten component to raw SVG
              const obj = allObjects.find((o) => o.id === contextMenu.objectId);
              if (obj) {
                const component = project?.library.components.find((c) => c.id === obj.ref);
                if (component) {
                  // Convert component to asset (placeholder - would need actual flattening logic)
                  console.log('Flatten component:', component.id);
                }
              }
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-xs text-[#E0E0E0] hover:bg-[#2D2D2D]"
          >
            Flatten
          </button>
          <button
            onClick={() => {
              const obj = allObjects.find((o) => o.id === contextMenu.objectId);
              if (obj) {
                const name = prompt('Prefab name:');
                if (name) {
                  saveSelectionAsPrefab([contextMenu.objectId], name);
                }
              }
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-xs text-[#E0E0E0] hover:bg-[#2D2D2D]"
          >
            Make Prefab
          </button>
          <button
            onClick={() => {
              const obj = allObjects.find((o) => o.id === contextMenu.objectId);
              if (obj) {
                const component = project?.library.components.find((c) => c.id === obj.ref);
                if (component?.vibe) {
                  // Copy vibe parameters (placeholder)
                  navigator.clipboard.writeText(JSON.stringify(component.vibe));
                }
              }
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-xs text-[#E0E0E0] hover:bg-[#2D2D2D]"
          >
            Copy Vibe
          </button>
          <div className="h-px bg-[#333333] my-1" />
          <button
            onClick={() => {
              const obj = allObjects.find((o) => o.id === contextMenu.objectId);
              if (obj && project) {
                // Check if exactly 2 objects are selected
                const selectedIds = selection.selectedObjectIds || [];
                if (selectedIds.length === 2) {
                  const [targetId, maskId] = selectedIds;
                  // Find the layer for the target object
                  let targetLayerId: string | undefined;
                  for (const layer of project.scene.layers) {
                    const targetObj = layer.objects.find((o) => o.id === targetId);
                    if (targetObj) {
                      targetLayerId = layer.id;
                      break;
                    }
                  }
                  if (targetLayerId) {
                    applyMask(targetId, maskId, 'clipPath');
                  }
                } else {
                  alert('Please select exactly 2 objects: first the target, then the mask shape.');
                }
              }
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-xs text-[#E0E0E0] hover:bg-[#2D2D2D]"
          >
            Mask Selection
          </button>
          <button
            onClick={() => {
              const obj = allObjects.find((o) => o.id === contextMenu.objectId);
              if (obj && obj.maskId) {
                removeMask(contextMenu.objectId);
              }
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-xs text-[#E0E0E0] hover:bg-[#2D2D2D]"
            disabled={!allObjects.find((o) => o.id === contextMenu.objectId)?.maskId}
          >
            Remove Mask
          </button>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-[#333333]">
        <div className="text-xs text-[#888888] mb-2">
          Total Objects: {allObjects.length}
        </div>
        
        {/* Group Controls */}
        {selection.selectedObjectIds && selection.selectedObjectIds.length > 1 && (
          <>
            <button
              onClick={() => {
                const groupId = createGroup(selection.selectedObjectIds || []);
                if (groupId) {
                  setSelection({ ...selection, selectedObjectIds: [] });
                }
              }}
              className="w-full px-3 py-2 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0] hover:bg-[#2D2D2D] flex items-center justify-center gap-2"
            >
              <Group size={14} />
              Group Selected ({selection.selectedObjectIds.length})
            </button>
            <button
              onClick={() => {
                const name = prompt('Prefab name:');
                if (name) {
                  const prefabId = saveSelectionAsPrefab(selection.selectedObjectIds || [], name);
                  if (prefabId) {
                    setSelection({ ...selection, selectedObjectIds: [] });
                  }
                }
              }}
              className="w-full px-3 py-2 text-xs bg-[#121212] border border-[#00FF9D] rounded text-[#00FF9D] hover:bg-[#2D2D2D] flex items-center justify-center gap-2 mt-2"
            >
              Save as Prefab
            </button>
          </>
        )}
        
        {/* Ungroup Button */}
        {selection.sceneObjectId && (() => {
          const selectedObj = allObjects.find(obj => obj.id === selection.sceneObjectId);
          if (selectedObj?.group_id) {
            return (
              <button
                onClick={() => {
                  if (selectedObj.group_id) {
                    ungroup(selectedObj.group_id);
                    setSelection({ sceneObjectId: selectedObj.id });
                  }
                }}
                className="w-full px-3 py-2 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0] hover:bg-[#2D2D2D] flex items-center justify-center gap-2 mt-2"
              >
                <Ungroup size={14} />
                Ungroup
              </button>
            );
          }
          return null;
        })()}
      </div>
    </div>
  );
};
