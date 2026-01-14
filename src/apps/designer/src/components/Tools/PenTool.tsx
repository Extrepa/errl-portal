import React, { useState, useRef, useEffect } from 'react';
import { buildSvgPath, parseSvgPath, type PathCommand, type PathPoint } from '../../utils/pathParser';

interface PenToolProps {
  onPathCreate: (pathData: string) => void;
  viewBox?: { x: number; y: number; width: number; height: number };
  snapToGrid?: boolean;
  gridSize?: number;
}

export const PenTool: React.FC<PenToolProps> = ({
  onPathCreate,
  viewBox,
  snapToGrid = false,
  gridSize = 16,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<PathCommand[]>([]);
  const [previewPoint, setPreviewPoint] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Snap point to grid
  const snapPoint = (x: number, y: number): { x: number; y: number } => {
    if (!snapToGrid) return { x, y };
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    };
  };

  // Convert screen coordinates to SVG coordinates
  const screenToSvg = (screenX: number, screenY: number): { x: number; y: number } => {
    if (!svgRef.current || !viewBox) return { x: screenX, y: screenY };
    
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;
    
    return {
      x: (screenX - rect.left) * scaleX + viewBox.x,
      y: (screenY - rect.top) * scaleY + viewBox.y,
    };
  };

  // Handle mouse down - start or continue path
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!viewBox) return;
    
    const svgPoint = screenToSvg(e.clientX, e.clientY);
    const snapped = snapPoint(svgPoint.x, svgPoint.y);

    if (!isDrawing) {
      // Start new path
      setIsDrawing(true);
      setCurrentPath([
        {
          type: 'M',
          points: [{ x: snapped.x, y: snapped.y, type: 'anchor' }],
          raw: `M ${snapped.x} ${snapped.y}`,
        },
      ]);
    } else {
      // Add point to existing path
      const lastCommand = currentPath[currentPath.length - 1];
      if (lastCommand && lastCommand.points.length > 0) {
        const lastPoint = lastCommand.points[lastCommand.points.length - 1];
        // Add line to new point
        setCurrentPath([
          ...currentPath,
          {
            type: 'L',
            points: [{ x: snapped.x, y: snapped.y, type: 'anchor' }],
            raw: `L ${snapped.x} ${snapped.y}`,
          },
        ]);
      }
    }
  };

  // Handle mouse move - preview curve if dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !viewBox) return;
    
    const svgPoint = screenToSvg(e.clientX, e.clientY);
    const snapped = snapPoint(svgPoint.x, svgPoint.y);
    setPreviewPoint(snapped);
  };

  // Handle mouse up - finish curve if dragging
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !viewBox) return;
    
    const svgPoint = screenToSvg(e.clientX, e.clientY);
    const snapped = snapPoint(svgPoint.x, svgPoint.y);

    // If mouse moved significantly, create curve
    const lastCommand = currentPath[currentPath.length - 1];
    if (lastCommand && lastCommand.points.length > 0) {
      const lastPoint = lastCommand.points[lastCommand.points.length - 1];
      const dx = snapped.x - lastPoint.x;
      const dy = snapped.y - lastPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        // Create curve with control handles
        const controlLength = distance * 0.3;
        setCurrentPath([
          ...currentPath.slice(0, -1),
          {
            type: 'C',
            points: [
              {
                x: snapped.x,
                y: snapped.y,
                type: 'anchor',
                controlIn: {
                  x: lastPoint.x + controlLength,
                  y: lastPoint.y,
                },
                controlOut: {
                  x: snapped.x - controlLength,
                  y: snapped.y,
                },
              },
            ],
            raw: `C ${lastPoint.x + controlLength} ${lastPoint.y} ${snapped.x - controlLength} ${snapped.y} ${snapped.x} ${snapped.y}`,
          },
        ]);
      }
    }

    setPreviewPoint(null);
  };

  // Handle double-click - finish path
  const handleDoubleClick = () => {
    if (currentPath.length > 0) {
      const pathData = buildSvgPath(currentPath);
      onPathCreate(pathData);
      setCurrentPath([]);
      setIsDrawing(false);
      setPreviewPoint(null);
    }
  };

  if (!viewBox) return null;

  const previewPath = currentPath.length > 0 && previewPoint ? (
    <path
      d={buildSvgPath([
        ...currentPath,
        {
          type: 'L',
          points: [{ x: previewPoint.x, y: previewPoint.y, type: 'anchor' }],
          raw: `L ${previewPoint.x} ${previewPoint.y}`,
        },
      ])}
      fill="none"
      stroke="#00ff9d"
      strokeWidth="2"
      strokeDasharray="4,4"
      className="pointer-events-none"
    />
  ) : null;

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none"
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      style={{ pointerEvents: isDrawing ? 'all' : 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      {/* Preview path */}
      {previewPath}
      {/* Current path */}
      {currentPath.length > 0 && (
        <path
          d={buildSvgPath(currentPath)}
          fill="none"
          stroke="#00ff9d"
          strokeWidth="2"
          className="pointer-events-none"
        />
      )}
    </svg>
  );
};

