import React from 'react';
import { Lock, Unlock, Group, Grid } from 'lucide-react';
import { useStore } from '../../state/useStore';

export const SceneToolbar: React.FC = () => {
  const { gridSettings, setGridSettings } = useStore();
  const [layersLocked, setLayersLocked] = React.useState(false);

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-[#333333]">
      <button
        onClick={() => setLayersLocked(!layersLocked)}
        className={`p-2 rounded transition-colors ${
          layersLocked ? 'bg-[#2D2D2D] text-[#00FF9D]' : 'text-[#888888] hover:bg-[#2D2D2D]'
        }`}
        title={layersLocked ? 'Unlock Layers' : 'Lock Layers'}
      >
        {layersLocked ? <Lock size={16} /> : <Unlock size={16} />}
      </button>
      <button
        className="p-2 rounded text-[#888888] hover:bg-[#2D2D2D] hover:text-[#E0E0E0]"
        title="Group Selected"
      >
        <Group size={16} />
      </button>
      <div className="w-px h-6 bg-[#333333] mx-1" />
      <button
        onClick={() => setGridSettings({ visible: !gridSettings.visible })}
        className={`p-2 rounded transition-colors ${
          gridSettings.visible ? 'bg-[#2D2D2D] text-[#00FF9D]' : 'text-[#888888] hover:bg-[#2D2D2D]'
        }`}
        title="Toggle Grid"
      >
        <Grid size={16} />
      </button>
    </div>
  );
};

