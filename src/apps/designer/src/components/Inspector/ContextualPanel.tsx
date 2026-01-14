import React from 'react';
import { useStore } from '../../state/useStore';
import { SVGInspector } from './SVGInspector';
import { FXInspector } from './FXInspector';
import { SceneInspector } from './SceneInspector';
import { ExportInspector } from './ExportInspector';
import { StateManager } from './StateManager';
import { PaletteManager } from './PaletteManager';
import { ExtensionManager } from '../Extensions/ExtensionManager';

export const ContextualPanel: React.FC = () => {
  const { mode } = useStore();

  switch (mode.type) {
    case 'svg-edit':
      return (
        <div>
          <SVGInspector />
          <div className="border-t border-[#333333] mt-4">
            <StateManager />
          </div>
        </div>
      );
    case 'fx-lab':
      return <FXInspector />;
    case 'scene-maker':
      return <SceneInspector />;
    case 'export':
      return (
        <div>
          <ExportInspector />
          <PaletteManager />
          <ExtensionManager />
        </div>
      );
    default:
      return (
        <div className="p-4">
          <p className="text-xs text-[#888888]">Select a mode</p>
        </div>
      );
  }
};

