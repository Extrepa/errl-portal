import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Grid, Grid3x3, Maximize2 } from 'lucide-react';
import { useStore } from '../../state/useStore';
import { SceneRenderer } from './SceneRenderer';
import { AlignmentGuides } from './AlignmentGuides';
import { TransformOverlay } from './TransformOverlay';
import { SceneToolbar } from '../Toolbars/SceneToolbar';
import { snapToGrid } from '../../utils/helpers';
import { detectAlignment, getObjectBounds, type AlignmentGuide } from '../../utils/alignmentUtils';
import { calculateAnchoredPosition } from '../../utils/responsiveUtils';
import { generateMaskDefinition } from '../../utils/maskManager';
import { getObjectDimensions } from '../../utils/sceneSizing';
import type { SceneObject } from '../../state/types';

type TransformMode = 'scale' | 'rotate';

interface TransformState {
  objectId: string;
  layerId: string;
  mode: TransformMode;
  startPoint: { x: number; y: number };
  startDistance: number;
  startScale: number;
  startRotation: number;
  startAngle: number;
  center: { x: number; y: number };
  baseSize: { width: number; height: number };
}

export const StageCanvas: React.FC = () => {
  const { project, selection, setSelection, updateSceneObject, addSceneObject, gridSettings, setGridSettings } = useStore();
  const { vibePreviewEnabled, toggleVibePreview } = useStore((state) => ({
    vibePreviewEnabled: state.vibePreviewEnabled,
    toggleVibePreview: state.toggleVibePreview,
  }));
  const stageRef = useRef<HTMLDivElement>(null);
  const [draggedObject, setDraggedObject] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; objX: number; objY: number } | null>(null);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const [boxSelection, setBoxSelection] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number } | null>(null);
  const [showViewportResizer, setShowViewportResizer] = useState(false);
  const [transformState, setTransformState] = useState<TransformState | null>(null);
  const allObjects = useMemo(() => {
    if (!project) return [];
    return project.scene.layers.flatMap((layer) =>
      layer.objects
        .map((obj) => ({ ...obj, layerId: layer.id }))
        .sort((a, b) => a.z - b.z)
    );
  }, [project]);
  const selectedObjectInfo = useMemo(() => {
    if (!project || !selection.sceneObjectId) return null;
    for (const layer of project.scene.layers) {
      const obj = layer.objects.find((o) => o.id === selection.sceneObjectId);
      if (obj) {
        return {
          object: obj,
          layerId: layer.id,
          dimensions: getObjectDimensions(obj, project),
        };
      }
    }
    return null;
  }, [project, selection.sceneObjectId]);

  const getStagePoint = useCallback((clientX: number, clientY: number) => {
    const container = stageRef.current;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  if (!project) {
    return (
      <div className="flex-1 bg-[#121212] flex items-center justify-center">
        <p className="text-[#888888]">No project loaded</p>
      </div>
    );
  }

  const handleObjectClick = useCallback((objectId: string, ref: string, e?: React.MouseEvent) => {
    if (!project) return;
    
    // Check if object is locked - prevent interaction if locked
    const allObjects = project.scene.layers.flatMap((layer) => layer.objects);
    const obj = allObjects.find((o) => o.id === objectId);
    if (obj?.locked === true) return;
    
    // If shift is held, add to selection instead of replacing
    if (e?.shiftKey && selection.selectedObjectIds) {
      const newSelectedIds = selection.selectedObjectIds.includes(objectId)
        ? selection.selectedObjectIds.filter(id => id !== objectId)
        : [...selection.selectedObjectIds, objectId];
      setSelection({ ...selection, selectedObjectIds: newSelectedIds });
      return;
    }
    
    // Check if ref points to a component or asset
    const component = project.library.components.find((c) => c.id === ref);
    if (component) {
      setSelection({ sceneObjectId: objectId, componentId: component.id, selectedObjectIds: [objectId] });
    } else {
      setSelection({ sceneObjectId: objectId, assetId: ref, selectedObjectIds: [objectId] });
    }
  }, [setSelection, project, selection]);

  const handleObjectDragStart = useCallback((e: React.MouseEvent, objectId: string) => {
    e.stopPropagation();
    if (transformState) return;
    if (!project) return;
    
    // Find the object to get its current position
    let objX = 0, objY = 0;
    for (const layer of project.scene.layers) {
      const obj = layer.objects.find((o) => o.id === objectId);
      if (obj) {
        objX = obj.x;
        objY = obj.y;
        break;
      }
    }
    
    setDraggedObject(objectId);
    setDragStart({ x: e.clientX, y: e.clientY, objX, objY });
    setBoxSelection(null); // Clear box selection when dragging object
  }, [project, transformState]);

  const handleObjectDrag = useCallback((e: React.MouseEvent) => {
    if (!draggedObject || !dragStart || !project) return;
    if (transformState) return;
    
    // Calculate delta from drag start
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // Calculate new position based on original object position + delta
    let newX = dragStart.objX + deltaX;
    let newY = dragStart.objY + deltaY;
    
    // Find the dragged object to get its scale
    let draggedObj: SceneObject | undefined;
    let draggedLayerId: string | undefined;
    for (const layer of project.scene.layers) {
      const obj = layer.objects.find((o) => o.id === draggedObject);
      if (obj) {
        draggedObj = obj;
        draggedLayerId = layer.id;
        break;
      }
    }
    
    if (!draggedObj) return;
    
    // If object is in a group, move all objects in the group
    if (draggedObj.group_id) {
      const group = project.scene.groups?.find((g) => g.id === draggedObj.group_id);
      if (group) {
        // Move all objects in the group by the same delta
        group.object_ids.forEach((objectId) => {
          for (const layer of project.scene.layers) {
            const obj = layer.objects.find((o) => o.id === objectId);
            if (obj && obj.id !== draggedObject) {
              // Calculate relative position from dragged object
              const relativeX = obj.x - dragStart.objX;
              const relativeY = obj.y - dragStart.objY;
              let objNewX = newX + relativeX;
              let objNewY = newY + relativeY;
              
              // Apply grid snapping
              if (gridSettings.enabled) {
                objNewX = snapToGrid(objNewX, gridSettings.size, true);
                objNewY = snapToGrid(objNewY, gridSettings.size, true);
              }
              
              updateSceneObject(layer.id, obj.id, {
                x: objNewX,
                y: objNewY,
              });
            }
          }
        });
      }
    }
    
    const draggedSize = getObjectDimensions(draggedObj, project);

    // Detect alignment with other objects (excluding group members)
    const movingBounds = getObjectBounds(newX, newY, draggedObj.scale, draggedSize.width, draggedSize.height);
    const otherBounds = allObjects
      .filter((obj) => {
        // Exclude objects in the same group
        if (draggedObj.group_id && obj.group_id === draggedObj.group_id) {
          return false;
        }
        return obj.id !== draggedObject;
      })
      .map((obj) => {
        const size = getObjectDimensions(obj, project);
        return getObjectBounds(obj.x, obj.y, obj.scale, size.width, size.height);
      });
    
    const guides = detectAlignment(movingBounds, otherBounds, 5);
    setAlignmentGuides(guides);
    
    // Snap to alignment guides if close
    if (guides.length > 0) {
      const verticalGuide = guides.find((g) => g.type === 'vertical');
      const horizontalGuide = guides.find((g) => g.type === 'horizontal');
      const width = movingBounds.width;
      const height = movingBounds.height;

      if (verticalGuide) {
        if (verticalGuide.alignment === 'left') newX = verticalGuide.position;
        if (verticalGuide.alignment === 'centerX') newX = verticalGuide.position - width / 2;
        if (verticalGuide.alignment === 'right') newX = verticalGuide.position - width;
      }
      if (horizontalGuide) {
        if (horizontalGuide.alignment === 'top') newY = horizontalGuide.position;
        if (horizontalGuide.alignment === 'centerY') newY = horizontalGuide.position - height / 2;
        if (horizontalGuide.alignment === 'bottom') newY = horizontalGuide.position - height;
      }
    }
    
    // Apply grid snapping if enabled
    if (gridSettings.enabled) {
      newX = snapToGrid(newX, gridSettings.size, true);
      newY = snapToGrid(newY, gridSettings.size, true);
    }
    
    // Update the object position
    if (draggedLayerId) {
      updateSceneObject(draggedLayerId, draggedObj.id, {
        x: newX,
        y: newY,
      });
    }
  }, [draggedObject, dragStart, project, updateSceneObject, gridSettings, allObjects, transformState]);

  const handleObjectDragEnd = useCallback(() => {
    setDraggedObject(null);
    setDragStart(null);
    setAlignmentGuides([]);
  }, []);

  const startTransform = useCallback((mode: TransformMode, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!project || !selectedObjectInfo) return;
    const point = getStagePoint(e.clientX, e.clientY);
    if (!point) return;

    const { object, layerId, dimensions } = selectedObjectInfo;
    const center = {
      x: object.x + (dimensions.width * object.scale) / 2,
      y: object.y + (dimensions.height * object.scale) / 2,
    };
    const startAngle = Math.atan2(point.y - center.y, point.x - center.x);
    const startDistance = Math.max(
      1,
      Math.hypot(point.x - center.x, point.y - center.y)
    );

    setDraggedObject(null);
    setDragStart(null);
    setBoxSelection(null);
    setAlignmentGuides([]);

    setTransformState({
      objectId: object.id,
      layerId,
      mode,
      startPoint: point,
      startDistance,
      startScale: object.scale,
      startRotation: object.rotation || 0,
      startAngle,
      center,
      baseSize: dimensions,
    });
  }, [project, selectedObjectInfo, getStagePoint]);

  const handleTransformDrag = useCallback((e: React.MouseEvent) => {
    if (!transformState || !project) return;
    const point = getStagePoint(e.clientX, e.clientY);
    if (!point) return;

    if (transformState.mode === 'scale') {
      const distance = Math.max(
        1,
        Math.hypot(point.x - transformState.center.x, point.y - transformState.center.y)
      );
      const nextScale = Math.max(
        0.1,
        (distance / transformState.startDistance) * transformState.startScale
      );
      let nextX = transformState.center.x - (transformState.baseSize.width * nextScale) / 2;
      let nextY = transformState.center.y - (transformState.baseSize.height * nextScale) / 2;

      if (gridSettings.enabled) {
        nextX = snapToGrid(nextX, gridSettings.size, true);
        nextY = snapToGrid(nextY, gridSettings.size, true);
      }

      updateSceneObject(transformState.layerId, transformState.objectId, {
        x: nextX,
        y: nextY,
        scale: nextScale,
      });
    }

    if (transformState.mode === 'rotate') {
      const angle = Math.atan2(point.y - transformState.center.y, point.x - transformState.center.x);
      const delta = (angle - transformState.startAngle) * (180 / Math.PI);
      const nextRotation = transformState.startRotation + delta;
      updateSceneObject(transformState.layerId, transformState.objectId, {
        rotation: nextRotation,
      });
    }
  }, [transformState, project, getStagePoint, gridSettings, updateSceneObject]);

  const handleTransformEnd = useCallback(() => {
    setTransformState(null);
  }, []);

  // Box selection handlers
  const handleBoxSelectionStart = useCallback((e: React.MouseEvent) => {
    // Only start box selection if clicking on empty space (not on an object)
    if ((e.target as HTMLElement).closest('[data-scene-object]')) {
      return;
    }
    
    // Don't start box selection if dragging an object
    if (draggedObject || transformState) return;
    
    const point = getStagePoint(e.clientX, e.clientY);
    if (!point) return;
    
    setBoxSelection({ startX: point.x, startY: point.y, endX: point.x, endY: point.y });
  }, [draggedObject, transformState, getStagePoint]);

  const handleBoxSelectionMove = useCallback((e: React.MouseEvent) => {
    if (!boxSelection) return;

    const point = getStagePoint(e.clientX, e.clientY);
    if (!point) return;
    
    setBoxSelection({ ...boxSelection, endX: point.x, endY: point.y });
  }, [boxSelection, getStagePoint]);

  const handleBoxSelectionEnd = useCallback((e: React.MouseEvent) => {
    if (!boxSelection || !project) {
      setBoxSelection(null);
      return;
    }
    
    // Calculate selection rectangle
    const minX = Math.min(boxSelection.startX, boxSelection.endX);
    const maxX = Math.max(boxSelection.startX, boxSelection.endX);
    const minY = Math.min(boxSelection.startY, boxSelection.endY);
    const maxY = Math.max(boxSelection.startY, boxSelection.endY);
    
    // Find objects within the selection rectangle
    const selectedObjectIds: string[] = [];
    allObjects.forEach((obj) => {
      const size = getObjectDimensions(obj, project);
      const objCenterX = obj.x + (size.width * obj.scale) / 2;
      const objCenterY = obj.y + (size.height * obj.scale) / 2;
      
      if (objCenterX >= minX && objCenterX <= maxX && objCenterY >= minY && objCenterY <= maxY) {
        selectedObjectIds.push(obj.id);
      }
    });
    
    if (selectedObjectIds.length > 0) {
      setSelection({ selectedObjectIds });
    }
    
    setBoxSelection(null);
  }, [boxSelection, project, allObjects, setSelection]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const assetId = e.dataTransfer.getData('text/plain');
    if (!assetId || !project) return;

    // Get drop position relative to the stage canvas container
    const point = getStagePoint(e.clientX, e.clientY);
    if (!point) return;
    const x = point.x;
    const y = point.y;

    // Find the first layer or use layer_1
    const targetLayer = project.scene.layers.find(l => l.id === 'layer_1') || project.scene.layers[0];
    if (!targetLayer) return;

    // Get max z-index in layer to place new object on top
    const maxZ = targetLayer.objects.length > 0
      ? Math.max(...targetLayer.objects.map(o => o.z))
      : 0;

    // Calculate drop position with grid snapping
    let dropX = Math.max(0, x - 50);
    let dropY = Math.max(0, y - 50);
    
    if (gridSettings.enabled) {
      dropX = snapToGrid(dropX, gridSettings.size, true);
      dropY = snapToGrid(dropY, gridSettings.size, true);
    }

    // Create new scene object
    const newObject: SceneObject = {
      id: `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ref: assetId,
      x: dropX,
      y: dropY,
      z: maxZ + 1,
      scale: 1,
      rotation: 0,
    };

    addSceneObject(targetLayer.id, newObject);
    setSelection({ sceneObjectId: newObject.id, assetId });
  }, [project, addSceneObject, setSelection, gridSettings, getStagePoint]);

  // Calculate 16:9 aspect ratio container
  const aspectRatio = 16 / 9;
  const containerWidth = 1000; // Base width
  const containerHeight = containerWidth / aspectRatio;
  const viewportWidth = viewportSize?.width || containerWidth;
  const viewportHeight = viewportSize?.height || containerHeight;
  const overlayInfo = selectedObjectInfo
    ? (() => {
        const { object, dimensions } = selectedObjectInfo;
        if (object.locked) return null;
        let overlayX = object.x;
        let overlayY = object.y;
        if (object.anchor) {
          const anchored = calculateAnchoredPosition(object, viewportWidth, viewportHeight);
          overlayX = anchored.x;
          overlayY = anchored.y;
        }
        return {
          x: overlayX,
          y: overlayY,
          width: dimensions.width * object.scale,
          height: dimensions.height * object.scale,
          rotation: object.rotation || 0,
        };
      })()
    : null;

  return (
    <div 
      className="flex-1 bg-[#121212] border-l border-[#7000FF] flex flex-col overflow-hidden"
      style={{
        borderLeft: '1px solid #7000FF',
        boxShadow: '0 0 1px #7000FF',
      }}
    >
      {/* Contextual Toolbar */}
      {project && <SceneToolbar />}
      
      {/* Header */}
      <div className="h-12 border-b border-[#333333] flex items-center justify-between px-4">
        <div className="flex items-center">
          <h2 className="text-sm font-medium text-[#E0E0E0]">Stage Canvas</h2>
          <span className="ml-2 text-xs text-[#888888]">
            {allObjects.length} object{allObjects.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVibePreview}
            className={`px-2 py-1 rounded text-xs ${
              vibePreviewEnabled ? 'bg-[#00FF9D] text-[#000]' : 'text-[#888888] hover:bg-[#2D2D2D]'
            }`}
            title="Toggle Vibe Preview"
          >
            Vibe {vibePreviewEnabled ? 'On' : 'Off'}
          </button>
          {/* Grid Visibility Toggle */}
          <button
            onClick={() => setGridSettings({ visible: !gridSettings.visible })}
            className={`p-2 rounded transition-colors ${
              gridSettings.visible
                ? 'bg-[#2D2D2D] text-[#00FF9D]'
                : 'text-[#888888] hover:bg-[#2D2D2D]'
            }`}
            title="Toggle Grid Visibility"
          >
            <Grid size={16} />
          </button>
          {/* Snap to Grid Toggle */}
          <button
            onClick={() => setGridSettings({ enabled: !gridSettings.enabled })}
            className={`p-2 rounded transition-colors ${
              gridSettings.enabled
                ? 'bg-[#2D2D2D] text-[#00FF9D]'
                : 'text-[#888888] hover:bg-[#2D2D2D]'
            }`}
            title="Toggle Snap to Grid"
          >
            <Grid3x3 size={16} />
          </button>
          {/* Grid Size Selector */}
          <select
            value={gridSettings.size}
            onChange={(e) => setGridSettings({ size: parseInt(e.target.value) as 8 | 16 | 32 })}
            className="px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
            title="Grid Size"
          >
            <option value="8">8px</option>
            <option value="16">16px</option>
            <option value="32">32px</option>
          </select>
          {/* Viewport Resizer */}
          <button
            onClick={() => setShowViewportResizer(!showViewportResizer)}
            className={`p-2 rounded transition-colors ${
              showViewportResizer
                ? 'bg-[#2D2D2D] text-[#00FF9D]'
                : 'text-[#888888] hover:bg-[#2D2D2D]'
            }`}
            title="Toggle viewport resizer"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Viewport Size Input */}
      {showViewportResizer && (
        <div className="px-4 py-2 bg-[#1E1E1E] border-b border-[#333333] flex items-center gap-2">
          <span className="text-xs text-[#888888]">Viewport:</span>
          <input
            type="number"
            value={viewportSize?.width || containerWidth}
            onChange={(e) => setViewportSize({
              width: parseInt(e.target.value) || containerWidth,
              height: viewportSize?.height || containerHeight,
            })}
            className="w-20 px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
            placeholder="Width"
          />
          <span className="text-xs text-[#888888]">×</span>
          <input
            type="number"
            value={viewportSize?.height || containerHeight}
            onChange={(e) => setViewportSize({
              width: viewportSize?.width || containerWidth,
              height: parseInt(e.target.value) || containerHeight,
            })}
            className="w-20 px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
            placeholder="Height"
          />
          <button
            onClick={() => {
              setViewportSize({ width: 375, height: 667 }); // Mobile
            }}
            className="px-2 py-1 text-[10px] bg-[#121212] border border-[#333333] rounded text-[#888888] hover:text-[#E0E0E0]"
          >
            Mobile
          </button>
          <button
            onClick={() => {
              setViewportSize({ width: 768, height: 1024 }); // Tablet
            }}
            className="px-2 py-1 text-[10px] bg-[#121212] border border-[#333333] rounded text-[#888888] hover:text-[#E0E0E0]"
          >
            Tablet
          </button>
          <button
            onClick={() => {
              setViewportSize(null); // Reset
            }}
            className="px-2 py-1 text-[10px] bg-[#121212] border border-[#333333] rounded text-[#888888] hover:text-[#E0E0E0]"
          >
            Reset
          </button>
        </div>
      )}

      {/* Canvas Area */}
      <div 
        className="flex-1 overflow-auto p-8"
        onMouseMove={(e) => {
          handleTransformDrag(e);
          handleObjectDrag(e);
          handleBoxSelectionMove(e);
        }}
        onMouseUp={(e) => {
          handleTransformEnd();
          handleObjectDragEnd();
          handleBoxSelectionEnd(e);
        }}
        onMouseLeave={(e) => {
          handleTransformEnd();
          handleObjectDragEnd();
          handleBoxSelectionEnd(e);
        }}
        onMouseDown={handleBoxSelectionStart}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div
          ref={stageRef}
          className="relative mx-auto bg-[#0a0a0a]"
          style={{
            width: viewportWidth,
            height: viewportHeight,
            aspectRatio: `${aspectRatio}`,
            backgroundImage: gridSettings.visible
              ? `linear-gradient(rgba(0, 255, 157, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 157, 0.1) 1px, transparent 1px)`
              : 'none',
            backgroundSize: `${gridSettings.size}px ${gridSettings.size}px`,
          }}
        >
          {/* Alignment Guides */}
          {alignmentGuides.length > 0 && (
            <AlignmentGuides
              guides={alignmentGuides}
              containerWidth={viewportWidth}
              containerHeight={viewportHeight}
            />
          )}
          
          {/* Box Selection Rectangle */}
          {boxSelection && (
            <div
              className="absolute border-2 border-[#00FF9D] bg-[#00FF9D]/10 pointer-events-none"
              style={{
                left: Math.min(boxSelection.startX, boxSelection.endX),
                top: Math.min(boxSelection.startY, boxSelection.endY),
                width: Math.abs(boxSelection.endX - boxSelection.startX),
                height: Math.abs(boxSelection.endY - boxSelection.startY),
              }}
            />
          )}

          {overlayInfo && (
            <TransformOverlay
              x={overlayInfo.x}
              y={overlayInfo.y}
              width={overlayInfo.width}
              height={overlayInfo.height}
              rotation={overlayInfo.rotation}
              onScaleStart={(_, e) => startTransform('scale', e)}
              onRotateStart={(e) => startTransform('rotate', e)}
            />
          )}
          
          {/* Collect mask definitions for all objects with masks */}
          {(() => {
            const maskObjects = allObjects.filter((obj) => obj.maskId);
            const maskDefinitions = maskObjects.map((obj) => {
              const maskObj = allObjects.find((o) => o.id === obj.maskId);
              if (!maskObj || !project) return null;
              const maskId = `mask-${obj.id}`;
              return generateMaskDefinition(maskObj, maskId, obj.maskType || 'clipPath', project);
            }).filter(Boolean) as string[];

            return (
              <>
                {/* Inject mask definitions into a shared defs section */}
                {maskDefinitions.length > 0 && (
                  <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
                    <defs dangerouslySetInnerHTML={{ __html: maskDefinitions.join('') }} />
                  </svg>
                )}
                
                {/* Render all objects */}
                {allObjects
                  .filter((obj) => obj.visible !== false) // Filter out hidden objects
                  .map((obj) => {
                    // Check if ref points to a component or asset
                    const component = project.library.components.find((c) => c.id === obj.ref);
                    const asset = component 
                      ? project.library.assets.find((a) => a.id === component.base_asset)
                      : project.library.assets.find((a) => a.id === obj.ref);
                    
                    if (!asset) return null;

                    const isSelected = selection.sceneObjectId === obj.id || 
                      !!(selection.selectedObjectIds && selection.selectedObjectIds.includes(obj.id));
                    const isLocked = obj.locked === true;

                    return (
                      <div key={obj.id} data-scene-object={obj.id}>
                        <SceneRenderer
                          asset={asset}
                          component={component}
                          object={obj}
                          isSelected={isSelected}
                          onClick={(e: React.MouseEvent) => {
                            if (isLocked) return;
                            handleObjectClick(obj.id, obj.ref, e);
                          }}
                          project={project}
                          onMouseDown={(e: React.MouseEvent) => {
                            if (isLocked) return;
                            handleObjectDragStart(e, obj.id);
                          }}
                          containerWidth={viewportWidth}
                          containerHeight={viewportHeight}
                        />
                      </div>
                    );
                  })}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
