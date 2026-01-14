import React, { useState } from 'react';
import { PenTool, Minus, MousePointer2, Circle, Square, Star, Type, Minus as LineIcon, VectorSquare, Shapes, Ruler } from 'lucide-react';
import { useStore } from '../../state/useStore';
import type { ToolType } from '../../state/types';

export const SVGToolbar: React.FC = () => {
  const { activeTool, setActiveTool } = useStore();
  const [showBooleanMenu, setShowBooleanMenu] = useState(false);

  const tools: Array<{ id: ToolType; icon: React.ReactNode; label: string; shortcut: string }> = [
    { id: 'select', icon: <MousePointer2 size={16} />, label: 'Select', shortcut: 'Ctrl+V' },
    { id: 'pen', icon: <PenTool size={16} />, label: 'Pen Tool', shortcut: 'Ctrl+P' },
    { id: 'node-editor', icon: <VectorSquare size={16} />, label: 'Node Editor', shortcut: 'Ctrl+A' },
  ];

  const shapes: Array<{ id: ToolType; icon: React.ReactNode; label: string; shortcut: string }> = [
    { id: 'rectangle', icon: <Square size={16} />, label: 'Rectangle', shortcut: 'Ctrl+R' },
    { id: 'circle', icon: <Circle size={16} />, label: 'Circle', shortcut: 'Ctrl+O' },
    { id: 'star', icon: <Star size={16} />, label: 'Star', shortcut: 'Ctrl+S' },
    { id: 'text', icon: <Type size={16} />, label: 'Text', shortcut: 'Ctrl+T' },
    { id: 'line', icon: <LineIcon size={16} />, label: 'Line', shortcut: 'Ctrl+L' },
    { id: 'measurement', icon: <Ruler size={16} />, label: 'Measure', shortcut: '' },
  ];

  const booleanOps: Array<{ id: ToolType; label: string; operation: 'union' | 'subtract' | 'intersect' | 'exclude' }> = [
    { id: 'boolean-union', label: 'Union', operation: 'union' },
    { id: 'boolean-subtract', label: 'Subtract', operation: 'subtract' },
    { id: 'boolean-intersect', label: 'Intersect', operation: 'intersect' },
    { id: 'boolean-exclude', label: 'Exclude', operation: 'exclude' },
  ];

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-[#333333]">
      {/* Selection Tools */}
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`p-2 rounded ${
            activeTool === tool.id
              ? 'bg-[#00FF9D] text-[#000]'
              : 'text-[#888888] hover:bg-[#2D2D2D] hover:text-[#E0E0E0]'
          }`}
          title={`${tool.label} (${tool.shortcut})`}
          onClick={() => setActiveTool(tool.id)}
        >
          {tool.icon}
        </button>
      ))}

      <div className="w-px h-6 bg-[#333333] mx-1" />

      {/* Shape Tools */}
      {shapes.map((shape) => (
        <button
          key={shape.id}
          className={`p-2 rounded ${
            activeTool === shape.id
              ? 'bg-[#00FF9D] text-[#000]'
              : 'text-[#888888] hover:bg-[#2D2D2D] hover:text-[#E0E0E0]'
          }`}
          title={`${shape.label} (${shape.shortcut})`}
          onClick={() => setActiveTool(shape.id)}
        >
          {shape.icon}
        </button>
      ))}

      <div className="w-px h-6 bg-[#333333] mx-1" />

      {/* Boolean Operations */}
      <div className="relative">
        <button
          className={`p-2 rounded ${
            activeTool?.startsWith('boolean')
              ? 'bg-[#00FF9D] text-[#000]'
              : 'text-[#888888] hover:bg-[#2D2D2D] hover:text-[#E0E0E0]'
          }`}
          title="Boolean Operations"
          onClick={() => setShowBooleanMenu(!showBooleanMenu)}
        >
          <Shapes size={16} />
        </button>
        {showBooleanMenu && (
          <div className="absolute top-full left-0 mt-1 bg-[#1E1E1E] border border-[#333333] rounded shadow-lg z-50">
            {booleanOps.map((op) => (
              <button
                key={op.id}
                className={`w-full px-4 py-2 text-left text-sm ${
                  activeTool === op.id
                    ? 'bg-[#00FF9D] text-[#000]'
                    : 'text-[#E0E0E0] hover:bg-[#2D2D2D]'
                }`}
                onClick={() => {
                  setActiveTool(op.id);
                  setShowBooleanMenu(false);
                }}
              >
                {op.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
