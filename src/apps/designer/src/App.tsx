import React, { useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MainLayout } from './components/MainLayout';
import { ModeSelector } from './components/ModeSelector';
import { ToolDock } from './components/Toolbars/ToolDock';
import { FocusWindow } from './components/Editors/FocusWindow';
import { StageCanvas } from './components/Editors/StageCanvas';
import { ContextualPanel } from './components/Inspector/ContextualPanel';
import { AssetShelf } from './components/Library/AssetShelf';
import { useStore } from './state/useStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import type { Project } from './state/types';

function App() {
  const { loadProject } = useStore();
  useKeyboardShortcuts();

  // Load sample project on mount
  useEffect(() => {
    fetch('/sample-project.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load sample project');
        return res.json();
      })
      .then((data: any) => {
        // Transform sample data to match our schema
        const project: Project = {
          meta: {
            name: data.project_name || 'Untitled',
            resolution: [1920, 1080],
          },
          library: {
            assets: (data.library?.assets || []).map((asset: any) => ({
              id: asset.id,
              name: asset.name,
              type: asset.type as 'svg' | 'png',
              data: asset.data,
              fx: asset.vibe,
            })),
            components: [],
          },
          scene: {
            layers: [
              {
                id: 'layer_1',
                name: 'Layer 1',
                objects: (data.scene?.instances || []).map((inst: any) => ({
                  id: inst.id,
                  ref: inst.asset_ref,
                  x: inst.x,
                  y: inst.y,
                  z: 1,
                  scale: inst.scale || 1,
                  rotation: inst.rotation || 0,
                })),
              },
            ],
            background: data.scene?.background,
          },
        };
        loadProject(project);
      })
      .catch((err) => {
        console.error('Failed to load sample project:', err);
      });
  }, [loadProject]);

  return (
    <ErrorBoundary>
      <MainLayout
        left={
          <div className="flex flex-col h-full">
            <ModeSelector />
            <ToolDock />
          </div>
        }
        right={<ContextualPanel />}
        bottom={<AssetShelf />}
      >
        <FocusWindow />
        <StageCanvas />
      </MainLayout>
    </ErrorBoundary>
  );
}

export default App;
