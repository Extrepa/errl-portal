import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Grid, ZoomIn, ZoomOut, Play, Pause, Eye, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../../state/useStore';
import { getVibeEffect } from '../../engine/vibeLogic';
import { SyncIndicator } from '../Shared/SyncIndicator';
import { SVGToolbar } from '../Toolbars/SVGToolbar';
import { NodeEditor } from './NodeEditor';
import { PenTool } from '../Tools/PenTool';
import { performBooleanOperation, loadPaperJS } from '@shared/utils/paper';
import { convertTextToPathsInSvg } from '../../utils/textToPath';

export const SVGEditor: React.FC = () => {
  const { selection, project, updateAssetData, mode, activeTool, gridSettings } = useStore();
  const { vibePreviewEnabled, toggleVibePreview } = useStore((state) => ({
    vibePreviewEnabled: state.vibePreviewEnabled,
    toggleVibePreview: state.toggleVibePreview,
  }));
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [livePreview, setLivePreview] = useState(true);
  const [traceMode, setTraceMode] = useState(false);
  const [currentState, setCurrentState] = useState<string | null>(null);
  const [measurementPoints, setMeasurementPoints] = useState<{ x: number; y: number }[]>([]);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // In FX Lab mode, if a component is selected, show its base asset
  // Otherwise, use the selected asset directly
  const selectedAsset = React.useMemo(() => {
    if (mode.type === 'fx-lab' && selection.componentId) {
      const component = project?.library.components.find(c => c.id === selection.componentId);
      if (component) {
        return project?.library.assets.find(a => a.id === component.base_asset);
      }
    }
    return selection.assetId 
      ? project?.library.assets.find(a => a.id === selection.assetId)
      : null;
  }, [mode.type, selection.componentId, selection.assetId, project]);

  // Get component if in FX Lab mode
  const selectedComponent = mode.type === 'fx-lab' && selection.componentId
    ? project?.library.components.find(c => c.id === selection.componentId)
    : null;

  // Get the SVG data to display (state-specific or default)
  const displaySvgData = useMemo(() => {
    if (!selectedAsset) return null;
    if (currentState && selectedAsset.states) {
      const state = selectedAsset.states.find((s) => s.name === currentState);
      if (state) return state.data;
    }
    return selectedAsset.data;
  }, [selectedAsset, currentState]);

  const handleSVGChange = (newData: string) => {
    if (selectedAsset) {
      updateAssetData(selectedAsset.id, newData);
    }
  };

  // Extract path data from SVG for Node Editor
  const extractPathData = (svgString: string): string | null => {
    if (!svgString) return null;
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const path = doc.querySelector('path');
    return path ? path.getAttribute('d') || null : null;
  };

  // Handle path creation from Pen Tool
  const handlePathCreate = (pathData: string) => {
    if (!selectedAsset) return;
    
    // Try to preserve existing SVG structure
    const parser = new DOMParser();
    const doc = parser.parseFromString(selectedAsset.data, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    
    if (svg) {
      // Add path to existing SVG
      const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#00ff9d');
      path.setAttribute('stroke-width', '2');
      svg.appendChild(path);
      handleSVGChange(new XMLSerializer().serializeToString(doc));
    } else {
      // Fallback: Create new SVG if structure is invalid
      const newSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <path d="${pathData}" fill="none" stroke="#00ff9d" stroke-width="2"/>
      </svg>`;
      handleSVGChange(newSvg);
    }
  };

  // Handle boolean operations
  const handleBooleanOperation = useCallback(async (operation: 'union' | 'subtract' | 'intersect' | 'exclude') => {
    if (!selectedAsset || !displaySvgData) return;

    // Extract all paths from SVG
    const parser = new DOMParser();
    const doc = parser.parseFromString(displaySvgData, 'image/svg+xml');
    const paths = doc.querySelectorAll('path');
    
    if (paths.length < 2) {
      alert('Boolean operations require at least 2 paths in the SVG');
      return;
    }

    // Get path data strings
    const pathDataArray = Array.from(paths).map(p => p.getAttribute('d') || '').filter(Boolean);
    
    if (pathDataArray.length < 2) {
      alert('Could not extract path data for boolean operation');
      return;
    }

    // Load Paper.js if needed
    await loadPaperJS();

    // Perform operation on first two paths (can be extended to handle multiple)
    const result = await performBooleanOperation(pathDataArray[0], pathDataArray[1], operation);
    
    if (!result) {
      alert('Boolean operation failed. Make sure Paper.js is loaded.');
      return;
    }

    // Replace first path with result, remove second path
    const firstPath = paths[0];
    const secondPath = paths[1];
    
    if (firstPath && secondPath) {
      firstPath.setAttribute('d', result);
      secondPath.remove();
      
      // Update SVG
      handleSVGChange(new XMLSerializer().serializeToString(doc));
    }
  }, [selectedAsset, displaySvgData, handleSVGChange]);

  const handleTextToPath = useCallback(() => {
    if (!selectedAsset) return;
    const converted = convertTextToPathsInSvg(selectedAsset.data);
    if (converted) {
      updateAssetData(selectedAsset.id, converted);
    }
  }, [selectedAsset, updateAssetData]);

  const handleMeasurementClick = (e: React.MouseEvent) => {
    if (activeTool !== 'measurement') return;
    if (!svgContainerRef.current) return;
    const rect = svgContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMeasurementPoints((prev) => {
      if (prev.length === 2) return [{ x, y }];
      return [...prev, { x, y }];
    });
  };

  const measurementDistance = useMemo(() => {
    if (measurementPoints.length < 2) return null;
    const [a, b] = measurementPoints;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, [measurementPoints]);

  useEffect(() => {
    if (activeTool !== 'measurement') {
      setMeasurementPoints([]);
    }
  }, [activeTool]);

  // Auto-apply boolean operation when tool is selected
  // Use ref to prevent multiple operations
  const lastOperationRef = useRef<{ tool: string; assetId: string; svgHash: string } | null>(null);
  
  useEffect(() => {
    if (!activeTool || !activeTool.startsWith('boolean-')) return;
    if (!selectedAsset || !displaySvgData) return;

    // Create a simple hash of SVG data to detect changes
    const svgHash = displaySvgData.substring(0, 50);
    const operationKey = `${activeTool}-${selectedAsset.id}-${svgHash}`;
    
    // Prevent duplicate operations
    if (lastOperationRef.current?.tool === operationKey) {
      return;
    }

    const operationMap: Record<string, 'union' | 'subtract' | 'intersect' | 'exclude'> = {
      'boolean-union': 'union',
      'boolean-subtract': 'subtract',
      'boolean-intersect': 'intersect',
      'boolean-exclude': 'exclude',
    };

    const operation = operationMap[activeTool];
    if (operation) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        lastOperationRef.current = { tool: operationKey, assetId: selectedAsset.id, svgHash };
        handleBooleanOperation(operation).then(() => {
          // Reset after operation completes to allow re-application if SVG changes
          setTimeout(() => {
            if (lastOperationRef.current?.tool === operationKey) {
              lastOperationRef.current = null;
            }
          }, 1000);
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTool, selectedAsset?.id, displaySvgData, handleBooleanOperation]);

  // Get viewBox for tools - try to extract from SVG, fallback to container size
  const viewBox = useMemo(() => {
    if (!svgContainerRef.current) return undefined;
    
    // Try to extract viewBox from SVG
    if (displaySvgData) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(displaySvgData, 'image/svg+xml');
      const svg = doc.querySelector('svg');
      if (svg) {
        const viewBoxAttr = svg.getAttribute('viewBox');
        if (viewBoxAttr) {
          const [x, y, width, height] = viewBoxAttr.split(/\s+|,/).map(Number);
          if (!isNaN(x) && !isNaN(y) && !isNaN(width) && !isNaN(height)) {
            return { x, y, width, height };
          }
        }
        // Fallback to width/height attributes
        const width = parseFloat(svg.getAttribute('width') || '100');
        const height = parseFloat(svg.getAttribute('height') || '100');
        if (!isNaN(width) && !isNaN(height)) {
          return { x: 0, y: 0, width, height };
        }
      }
    }
    
    // Final fallback: use container size
    const rect = svgContainerRef.current.getBoundingClientRect();
    return {
      x: 0,
      y: 0,
      width: rect.width / zoom,
      height: rect.height / zoom,
    };
  }, [zoom, displaySvgData]);

  return (
        <div className="flex-1 bg-[#1E1E1E] border-r border-[#333333] flex flex-col overflow-hidden">
          {/* Contextual Toolbar */}
          {mode.type === 'svg-edit' && <SVGToolbar />}
          
          {/* Toolbar */}
          <div className="h-12 border-b border-[#333333] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-[#E0E0E0]">
            {mode.type === 'fx-lab' ? 'FX Lab' : 'SVG Editor'}
          </h2>
          {selectedComponent && (
            <span className="text-xs text-[#888888]">- {selectedComponent.name}</span>
          )}
          {!selectedComponent && selectedAsset && (
            <span className="text-xs text-[#888888]">- {selectedAsset.name}</span>
          )}
          {selectedAsset && selectedAsset.states && selectedAsset.states.length > 0 && (
            <select
              value={currentState || ''}
              onChange={(e) => setCurrentState(e.target.value || null)}
              className="ml-2 px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
            >
              <option value="">Default</option>
              {selectedAsset.states.map((state) => (
                <option key={state.name} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
          )}
          <SyncIndicator />
        </div>
        <div className="flex items-center gap-2">
          {mode.type === 'fx-lab' && (
            <button
              onClick={() => setLivePreview(!livePreview)}
              className={`p-2 rounded transition-colors ${
                livePreview 
                  ? 'bg-[#2D2D2D] text-[#00FF9D]' 
                  : 'text-[#888888] hover:bg-[#2D2D2D]'
              }`}
              title="Toggle Live Preview"
            >
              {livePreview ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded transition-colors ${
              showGrid 
                ? 'bg-[#2D2D2D] text-[#00FF9D]' 
                : 'text-[#888888] hover:bg-[#2D2D2D]'
            }`}
            title="Toggle Grid"
          >
            <Grid size={16} />
          </button>
          {mode.type === 'svg-edit' && (
            <button
              onClick={() => setTraceMode(!traceMode)}
              className={`p-2 rounded transition-colors ${
                traceMode ? 'bg-[#2D2D2D] text-[#00FF9D]' : 'text-[#888888] hover:bg-[#2D2D2D]'
              }`}
              title="Toggle Ghost Tracing"
            >
              <Eye size={16} />
            </button>
          )}
          {mode.type === 'svg-edit' && (
            <button
              onClick={toggleVibePreview}
              className={`p-2 rounded transition-colors ${
                vibePreviewEnabled ? 'bg-[#00FF9D] text-[#000]' : 'text-[#888888] hover:bg-[#2D2D2D]'
              }`}
              title="Toggle Vibe Preview"
            >
              <Zap size={16} />
            </button>
          )}
          {mode.type === 'svg-edit' && (
            <button
              onClick={handleTextToPath}
              className="p-2 rounded text-[#888888] hover:bg-[#2D2D2D]"
              title="Convert Text to Paths"
            >
              Text→Path
            </button>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
              className="p-2 text-[#888888] hover:bg-[#2D2D2D] rounded"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-xs text-[#888888] min-w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(4, zoom + 0.25))}
              className="p-2 text-[#888888] hover:bg-[#2D2D2D] rounded"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={svgContainerRef}
        className="flex-1 relative overflow-auto bg-[#121212]"
        onClick={handleMeasurementClick}
      >
        {selectedAsset ? (
          <div 
            className="absolute inset-0 flex items-center justify-center p-8"
            style={{ 
              backgroundImage: showGrid 
                ? 'linear-gradient(rgba(0, 255, 157, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 157, 0.1) 1px, transparent 1px)'
                : 'none',
              backgroundSize: '20px 20px',
              ...(traceMode && {
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23121212'/%3E%3C/svg%3E")`,
                backgroundSize: '100px 100px',
                opacity: 0.2,
              }),
            }}
          >
            {mode.type === 'fx-lab' && selectedComponent && selectedComponent.vibe && livePreview ? (
              <motion.div
                animate={getVibeEffect(selectedComponent.vibe) || {}}
                className="max-w-full max-h-full transition-transform"
                style={{ transform: `scale(${zoom})` }}
                dangerouslySetInnerHTML={{ __html: displaySvgData || '' }}
              />
            ) : mode.type === 'fx-lab' && selectedAsset?.fx && livePreview ? (
              <motion.div
                animate={getVibeEffect(selectedAsset.fx) || {}}
                className="max-w-full max-h-full transition-transform"
                style={{ transform: `scale(${zoom})` }}
                dangerouslySetInnerHTML={{ __html: displaySvgData || '' }}
              />
            ) : (
              <div 
                className="max-w-full max-h-full transition-transform"
                style={{ transform: `scale(${zoom})` }}
                dangerouslySetInnerHTML={{ __html: displaySvgData || '' }}
              />
            )}
            {mode.type === 'svg-edit' && activeTool === 'measurement' && measurementPoints.length > 0 && (
              <div className="pointer-events-none absolute inset-0">
                <svg className="w-full h-full" style={{ position: 'absolute', inset: 0 }}>
                  {measurementPoints.length >= 1 && (
                    <circle
                      cx={measurementPoints[0].x}
                      cy={measurementPoints[0].y}
                      r={4}
                      fill="#00FF9D"
                    />
                  )}
                  {measurementPoints.length === 2 && (
                    <>
                      <circle cx={measurementPoints[1].x} cy={measurementPoints[1].y} r={4} fill="#00FF9D" />
                      <line
                        x1={measurementPoints[0].x}
                        y1={measurementPoints[0].y}
                        x2={measurementPoints[1].x}
                        y2={measurementPoints[1].y}
                        stroke="#00FF9D"
                        strokeWidth={2}
                      />
                    </>
                  )}
                </svg>
                {measurementDistance !== null && measurementPoints.length === 2 && (
                  <div
                    className="absolute text-[11px] text-[#00FF9D] bg-[#0a0a0a]/80 px-2 py-1 rounded border border-[#00FF9D]"
                    style={{
                      left: `${(measurementPoints[0].x + measurementPoints[1].x) / 2}px`,
                      top: `${(measurementPoints[0].y + measurementPoints[1].y) / 2}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {measurementDistance.toFixed(1)} px
                  </div>
                )}
              </div>
            )}
            
            {/* Node Editor Overlay */}
            {mode.type === 'svg-edit' && activeTool === 'node-editor' && displaySvgData && viewBox && (
              <NodeEditor
                pathData={extractPathData(displaySvgData) || ''}
                onPathChange={(newPath) => {
                  // Update SVG with new path
                  const parser = new DOMParser();
                  const doc = parser.parseFromString(displaySvgData, 'image/svg+xml');
                  const path = doc.querySelector('path');
                  if (path) {
                    path.setAttribute('d', newPath);
                    handleSVGChange(new XMLSerializer().serializeToString(doc));
                  }
                }}
                viewBox={viewBox}
                snapToGrid={gridSettings.enabled}
                gridSize={gridSettings.size}
              />
            )}
            
            {/* Pen Tool Overlay */}
            {mode.type === 'svg-edit' && activeTool === 'pen' && viewBox && (
              <PenTool
                onPathCreate={handlePathCreate}
                viewBox={viewBox}
                snapToGrid={gridSettings.enabled}
                gridSize={gridSettings.size}
              />
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[#888888] text-sm">
              {mode.type === 'fx-lab' 
                ? 'Select a component to edit' 
                : 'Select an asset to edit'}
            </p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="h-8 border-t border-[#333333] px-4 flex items-center text-xs text-[#888888]">
        {selectedComponent && (
          <>
            <span>Component: {selectedComponent.name}</span>
            <span className="ml-4">Base Asset: {selectedAsset?.name || 'N/A'}</span>
          </>
        )}
        {!selectedComponent && selectedAsset && (
          <>
            <span>Type: {selectedAsset.type.toUpperCase()}</span>
            <span className="ml-4">ID: {selectedAsset.id}</span>
          </>
        )}
      </div>
    </div>
  );
};
