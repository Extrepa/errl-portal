import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import { useStore } from '../../state/useStore';

export const HistoryControls: React.FC = () => {
  const { undo, redo, canUndo, canRedo } = useStore();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={undo}
        disabled={!canUndo()}
        className="p-2 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-[#888888] hover:text-[#E0E0E0] hover:bg-[#2D2D2D]"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={16} />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo()}
        className="p-2 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-[#888888] hover:text-[#E0E0E0] hover:bg-[#2D2D2D]"
        title="Redo (Ctrl+Y)"
      >
        <Redo2 size={16} />
      </button>
    </div>
  );
};

