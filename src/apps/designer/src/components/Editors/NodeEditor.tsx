import React, { useState, useRef, useEffect, useMemo } from 'react';
import { parseSvgPath, buildSvgPath, type PathCommand, type PathPoint } from '../../utils/pathParser';
import type { NodeType } from '../../state/types';

interface NodeEditorProps {
  pathData: string;
  onPathChange: (newPath: string) => void;
  viewBox?: { x: number; y: number; width: number; height: number };
  snapToGrid?: boolean;
  gridSize?: number;
}

interface NodeHandle {
  commandIndex: number;
  pointIndex: number;
  point: PathPoint;
  nodeType: NodeType;
}

export const NodeEditor: React.FC<NodeEditorProps> = ({
  pathData,
  onPathChange,
  viewBox,
  snapToGrid = false,
  gridSize = 16,
}) => {
  const [commands, setCommands] = useState<PathCommand[]>([]);
  const [selectedNode, setSelectedNode] = useState<{ commandIndex: number; pointIndex: number } | null>(null);
  const [dragging, setDragging] = useState<{ commandIndex: number; pointIndex: number; handle: 'anchor' | 'controlIn' | 'controlOut' } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Parse path on mount and when pathData changes
  useEffect(() => {
    if (pathData) {
      const parsed = parseSvgPath(pathData);
      setCommands(parsed);
    }
  }, [pathData]);

  // Snap point to grid
  const snapPoint = (x: number, y: number): { x: number; y: number } => {
    if (!snapToGrid) return { x, y };
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    };
  };

  // Get all node handles from commands
  const getNodeHandles = (): NodeHandle[] => {
    const handles: NodeHandle[] = [];
    commands.forEach((cmd, cmdIdx) => {
      if (cmd.type === 'Z') return;
      cmd.points.forEach((point, ptIdx) => {
        if (point.type === 'anchor') {
          // Determine node type based on control points
          let nodeType: NodeType = 'sharp';
          if (point.controlIn && point.controlOut) {
            // Check if handles are mirrored (smooth)
            const dx1 = point.controlIn.x - point.x;
            const dy1 = point.controlIn.y - point.y;
            const dx2 = point.controlOut.x - point.x;
            const dy2 = point.controlOut.y - point.y;
            const angle1 = Math.atan2(dy1, dx1);
            const angle2 = Math.atan2(dy2, dx2);
            const angleDiff = Math.abs(angle1 - angle2);
            // If angles are opposite (within tolerance), it's smooth
            if (Math.abs(angleDiff - Math.PI) < 0.1) {
              nodeType = 'smooth';
            } else {
              nodeType = 'broken';
            }
          }
          handles.push({
            commandIndex: cmdIdx,
            pointIndex: ptIdx,
            point,
            nodeType,
          });
        }
      });
    });
    return handles;
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

  // Handle mouse down on node
  const handleNodeMouseDown = (
    e: React.MouseEvent,
    commandIndex: number,
    pointIndex: number,
    handle: 'anchor' | 'controlIn' | 'controlOut'
  ) => {
    e.stopPropagation();
    setDragging({ commandIndex, pointIndex, handle });
    setSelectedNode({ commandIndex, pointIndex });
  };

  // Handle mouse move
  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current || !viewBox) return;

      const svgPoint = screenToSvg(e.clientX, e.clientY);
      const snapped = snapPoint(svgPoint.x, svgPoint.y);

      setCommands((prevCommands) => {
        const newCommands = [...prevCommands];
        const cmd = newCommands[dragging.commandIndex];
        if (!cmd || !cmd.points[dragging.pointIndex]) return prevCommands;

        const point = { ...cmd.points[dragging.pointIndex] };

        if (dragging.handle === 'anchor') {
          point.x = snapped.x;
          point.y = snapped.y;
          // Move control points relative to anchor
          if (point.controlIn) {
            const dx = point.controlIn.x - point.x;
            const dy = point.controlIn.y - point.y;
            point.controlIn = { x: snapped.x + dx, y: snapped.y + dy };
          }
          if (point.controlOut) {
            const dx = point.controlOut.x - point.x;
            const dy = point.controlOut.y - point.y;
            point.controlOut = { x: snapped.x + dx, y: snapped.y + dy };
          }
        } else if (dragging.handle === 'controlIn' && point.controlIn) {
          point.controlIn = { x: snapped.x, y: snapped.y };
          // If smooth node, mirror the control out
          // Check if handles are mirrored (smooth) by comparing angles
          if (point.controlOut) {
            const dx1 = point.controlIn.x - point.x;
            const dy1 = point.controlIn.y - point.y;
            const dx2 = point.controlOut.x - point.x;
            const dy2 = point.controlOut.y - point.y;
            const angle1 = Math.atan2(dy1, dx1);
            const angle2 = Math.atan2(dy2, dx2);
            const angleDiff = Math.abs(angle1 - angle2);
            // If angles are opposite (within tolerance), it's smooth - mirror
            if (Math.abs(angleDiff - Math.PI) < 0.1) {
              const dx = point.controlIn.x - point.x;
              const dy = point.controlIn.y - point.y;
              point.controlOut = {
                x: point.x - dx,
                y: point.y - dy,
              };
            }
          }
        } else if (dragging.handle === 'controlOut' && point.controlOut) {
          point.controlOut = { x: snapped.x, y: snapped.y };
          // If smooth node, mirror the control in
          if (point.controlIn) {
            const dx1 = point.controlIn.x - point.x;
            const dy1 = point.controlIn.y - point.y;
            const dx2 = point.controlOut.x - point.x;
            const dy2 = point.controlOut.y - point.y;
            const angle1 = Math.atan2(dy1, dx1);
            const angle2 = Math.atan2(dy2, dx2);
            const angleDiff = Math.abs(angle1 - angle2);
            // If angles are opposite (within tolerance), it's smooth - mirror
            if (Math.abs(angleDiff - Math.PI) < 0.1) {
              const dx = point.controlOut.x - point.x;
              const dy = point.controlOut.y - point.y;
              point.controlIn = {
                x: point.x - dx,
                y: point.y - dy,
              };
            }
          }
        }

        cmd.points[dragging.pointIndex] = point;
        newCommands[dragging.commandIndex] = { ...cmd, points: [...cmd.points] };

        // Update path
        const newPath = buildSvgPath(newCommands);
        onPathChange(newPath);

        return newCommands;
      });
    };

    const handleMouseUp = () => {
      setDragging(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, viewBox, snapToGrid, gridSize, onPathChange, commands]);

  // Handle double-click to convert node type
  const handleNodeDoubleClick = (commandIndex: number, pointIndex: number) => {
    setCommands((prevCommands) => {
      const newCommands = [...prevCommands];
      const cmd = newCommands[commandIndex];
      if (!cmd || !cmd.points[pointIndex]) return prevCommands;

      const point = { ...cmd.points[pointIndex] };
      
      // Toggle between sharp and smooth
      if (!point.controlIn && !point.controlOut) {
        // Sharp -> Smooth: create mirrored handles
        const prevPoint = pointIndex > 0 ? cmd.points[pointIndex - 1] : null;
        const nextPoint = pointIndex < cmd.points.length - 1 ? cmd.points[pointIndex + 1] : null;
        
        let handleLength = 50; // Default handle length
        if (prevPoint) {
          const dx = point.x - prevPoint.x;
          const dy = point.y - prevPoint.y;
          handleLength = Math.sqrt(dx * dx + dy * dy) * 0.3;
        }

        point.controlIn = {
          x: point.x - handleLength,
          y: point.y,
        };
        point.controlOut = {
          x: point.x + handleLength,
          y: point.y,
        };
      } else {
        // Smooth -> Sharp: remove handles
        point.controlIn = undefined;
        point.controlOut = undefined;
      }

      cmd.points[pointIndex] = point;
      newCommands[commandIndex] = { ...cmd, points: [...cmd.points] };

      const newPath = buildSvgPath(newCommands);
      onPathChange(newPath);

      return newCommands;
    });
  };

  // Memoize node handles to avoid recalculating on every render
  const nodeHandles = useMemo(() => getNodeHandles(), [commands]);

  if (!viewBox) return null;

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none"
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      style={{ pointerEvents: 'all' }}
    >
      {/* Render node handles */}
      {nodeHandles.map((handle, idx) => {
        const { point, commandIndex, pointIndex } = handle;
        const isSelected = selectedNode?.commandIndex === commandIndex && selectedNode?.pointIndex === pointIndex;

        return (
          <g key={`node-${commandIndex}-${pointIndex}`}>
            {/* Control handles */}
            {point.controlIn && (
              <g>
                <line
                  x1={point.x}
                  y1={point.y}
                  x2={point.controlIn.x}
                  y2={point.controlIn.y}
                  stroke="#888"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  className="pointer-events-none"
                />
                <circle
                  cx={point.controlIn.x}
                  cy={point.controlIn.y}
                  r="4"
                  fill="#00ff9d"
                  className="cursor-move pointer-events-all"
                  onMouseDown={(e) => handleNodeMouseDown(e, commandIndex, pointIndex, 'controlIn')}
                />
              </g>
            )}
            {point.controlOut && (
              <g>
                <line
                  x1={point.x}
                  y1={point.y}
                  x2={point.controlOut.x}
                  y2={point.controlOut.y}
                  stroke="#888"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  className="pointer-events-none"
                />
                <circle
                  cx={point.controlOut.x}
                  cy={point.controlOut.y}
                  r="4"
                  fill="#00ff9d"
                  className="cursor-move pointer-events-all"
                  onMouseDown={(e) => handleNodeMouseDown(e, commandIndex, pointIndex, 'controlOut')}
                />
              </g>
            )}
            {/* Anchor point */}
            <circle
              cx={point.x}
              cy={point.y}
              r={isSelected ? 6 : 5}
              fill={isSelected ? '#00ff9d' : '#fff'}
              stroke={isSelected ? '#00ff9d' : '#888'}
              strokeWidth="2"
              className="cursor-move pointer-events-all"
              onMouseDown={(e) => handleNodeMouseDown(e, commandIndex, pointIndex, 'anchor')}
              onDoubleClick={() => handleNodeDoubleClick(commandIndex, pointIndex)}
            />
          </g>
        );
      })}
    </svg>
  );
};

