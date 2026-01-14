import React from 'react';
import { MousePointer2, PenTool, VectorSquare, Square, Circle, Star, Type, Minus, Shapes, Ruler } from 'lucide-react';
import { useStore } from '../../state/useStore';
import type { ToolType } from '../../state/types';

export const ToolDock: React.FC = () => {
  const { activeTool, setActiveTool, mode } = useStore();

  // Only show in SVG Edit mode
  if (mode.type !== 'svg-edit') {
    return null;
  }

  const selectionTools = [
    { id: 'select' as ToolType, icon: <MousePointer2 size={18} />, label: 'Select', shortcut: 'Ctrl+V' },
    { id: 'node-editor' as ToolType, icon: <VectorSquare size={18} />, label: 'Node Editor', shortcut: 'Ctrl+A' },
  ];

  const creationTools = [
    { id: 'pen' as ToolType, icon: <PenTool size={18} />, label: 'Pen', shortcut: 'Ctrl+P' },
    { id: 'rectangle' as ToolType, icon: <Square size={18} />, label: 'Rectangle', shortcut: 'Ctrl+R' },
    { id: 'circle' as ToolType, icon: <Circle size={18} />, label: 'Circle', shortcut: 'Ctrl+O' },
    { id: 'star' as ToolType, icon: <Star size={18} />, label: 'Star', shortcut: 'Ctrl+S' },
  ];

  const modificationTools = [
    { id: 'boolean-union' as ToolType, icon: <Shapes size={18} />, label: 'Boolean Ops', shortcut: '' },
  ];

  const textTools = [
    { id: 'text' as ToolType, icon: <Type size={18} />, label: 'Text', shortcut: 'Ctrl+T' },
    { id: 'line' as ToolType, icon: <Minus size={18} />, label: 'Line', shortcut: 'Ctrl+L' },
    { id: 'measurement' as ToolType, icon: <Ruler size={18} />, label: 'Measure', shortcut: '' },
  ];

  const toolGroups = [
    { name: 'Selection', tools: selectionTools },
    { name: 'Creation', tools: creationTools },
    { name: 'Modification', tools: modificationTools },
    { name: 'Text', tools: textTools },
  ];

  return (
    <div className="w-16 bg-[#1E1E1E] border-r border-[#333333] flex flex-col py-2">
      {toolGroups.map((group, groupIdx) => (
        <React.Fragment key={group.name}>
          <div className="flex flex-col">
            {group.tools.map((tool) => (
              <button
                key={tool.id}
                className={`relative p-3 rounded transition-colors ${
                  activeTool === tool.id
                    ? 'bg-[#00FF9D] text-[#000]'
                    : 'text-[#888888] hover:bg-[#2D2D2D] hover:text-[#E0E0E0]'
                }`}
                title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
                onClick={() => setActiveTool(tool.id)}
              >
                {tool.icon}
              </button>
            ))}
          </div>
          {groupIdx < toolGroups.length - 1 && (
            <div className="w-full h-px bg-[#333333] my-2" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
