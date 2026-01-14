import React from 'react';
import { FileEdit, Sparkles, Layers, Download } from 'lucide-react';
import { useStore } from '../state/useStore';
import type { AppMode } from '../state/types';

const modes: Array<{ type: AppMode['type']; icon: React.ReactNode; label: string }> = [
  { type: 'svg-edit', icon: <FileEdit size={20} />, label: 'SVG Edit' },
  { type: 'fx-lab', icon: <Sparkles size={20} />, label: 'FX Lab' },
  { type: 'scene-maker', icon: <Layers size={20} />, label: 'Scene Maker' },
  { type: 'export', icon: <Download size={20} />, label: 'Export' },
];

export const ModeSelector: React.FC = () => {
  const { mode, setMode } = useStore();

  return (
    <div className="flex flex-col gap-2">
      {modes.map((modeOption) => {
        const isActive = mode.type === modeOption.type;
        return (
          <button
            key={modeOption.type}
            onClick={() => setMode({ type: modeOption.type })}
            className={`
              p-3 rounded transition-colors
              ${isActive 
                ? 'bg-[#2D2D2D] text-[#00FF9D]' 
                : 'text-[#888888] hover:bg-[#2D2D2D] hover:text-[#E0E0E0]'
              }
            `}
            title={modeOption.label}
          >
            {modeOption.icon}
          </button>
        );
      })}
    </div>
  );
};

