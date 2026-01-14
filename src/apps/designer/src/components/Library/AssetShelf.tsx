import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '../../state/useStore';
import { createComponentFromAsset } from '../../utils/helpers';
import { AssetSearch } from './AssetSearch';
import type { Asset } from '../../state/types';
import { createErrlPrefab } from '../../utils/errlPrefab';
import { createErrlAssets } from '../../utils/errlAssets';
import { getErrlExportSnippet } from '../../utils/errlExport';

export const AssetShelf: React.FC = () => {
  const { project, setSelection, addSceneObject, mode, addComponent, selection, insertPrefab, addAsset, updateAsset, updateComponent } = useStore();
  const [draggedAsset, setDraggedAsset] = useState<string | null>(null);

  if (!project) {
    return (
      <div className="p-4">
        <p className="text-xs text-[#888888]">No project loaded</p>
      </div>
    );
  }

  const handleAssetClick = (assetId: string) => {
    if (mode.type === 'fx-lab') {
      // In FX Lab mode, create a component from the asset and select it
      const asset = project?.library.assets.find(a => a.id === assetId);
      if (asset) {
        const newComponent = createComponentFromAsset(asset);
        addComponent(newComponent);
        setSelection({ componentId: newComponent.id });
      }
    } else {
      // In other modes, just select the asset
      setSelection({ assetId });
    }
  };

  const handleComponentClick = (componentId: string) => {
    setSelection({ componentId });
  };

  const handleDragStart = (e: React.DragEvent, assetId: string) => {
    setDraggedAsset(assetId);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', assetId);
  };

  const handleDragEnd = () => {
    setDraggedAsset(null);
  };

  const isFXLabMode = mode.type === 'fx-lab';

  return (
    <div className="h-full flex flex-col">
      <AssetSearch />
      <div className="flex-1 overflow-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-[#E0E0E0]">
            {isFXLabMode ? 'Component Library' : 'Asset Shelf'}
          </h3>
        </div>

      {/* Components Section (FX Lab mode) */}
      {isFXLabMode && project && project.library.components.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs text-[#888888] mb-2">Components</h4>
          <div className="grid grid-cols-4 gap-3 auto-rows-max mb-4">
            {project.library.components.map((component) => {
              const baseAsset = project.library.assets.find(a => a.id === component.base_asset);
              const isSelected = selection.componentId === component.id;
              return (
                <div
                  key={component.id}
                  onClick={() => handleComponentClick(component.id)}
                  className={`cursor-pointer p-2 bg-[#121212] rounded border transition-colors ${
                    isSelected
                      ? 'border-[#00FF9D] bg-[#2D2D2D]'
                      : 'border-[#333333] hover:border-[#00FF9D]'
                  }`}
                >
                  <div className="aspect-square bg-[#1E1E1E] rounded mb-2 flex items-center justify-center overflow-hidden">
                    {baseAsset ? (
                      <div 
                        className="w-full h-full"
                        style={{ transform: 'scale(0.8)' }}
                        dangerouslySetInnerHTML={{ __html: baseAsset.data }}
                      />
                    ) : (
                      <div className="text-xs text-[#666666]">No asset</div>
                    )}
                  </div>
                  <div className="text-xs text-[#E0E0E0] truncate">{component.name}</div>
                  <div className="text-xs text-[#888888]">
                    COMPONENT
                    {component.children && component.children.length > 0 && (
                      <span className="ml-1 text-[#00FF9D]">({component.children.length})</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Prefabs Section */}
      {project.library.prefabs && project.library.prefabs.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs text-[#888888] mb-2">Prefabs</h4>
          <div className="grid grid-cols-4 gap-3 auto-rows-max mb-4">
            {project.library.prefabs.map((prefab) => (
              <div
                key={prefab.id}
                className="cursor-pointer p-2 bg-[#121212] rounded border border-[#333333] hover:border-[#00FF9D]"
                title={prefab.name}
              >
                <div className="aspect-square bg-[#1E1E1E] rounded mb-2 flex items-center justify-center">
                  <div className="text-xs text-[#666666]">PREFAB</div>
                </div>
                <div className="text-xs text-[#E0E0E0] truncate">{prefab.name}</div>
                <div className="text-xs text-[#888888]">
                  {prefab.sceneGraph.objects.length} objects
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prefab actions */}
      <div className="mb-6">
        <h4 className="text-xs text-[#888888] mb-2">Prefab Actions</h4>
        <div className="space-y-2">
          <button
            onClick={() => insertPrefab(createErrlPrefab())}
            className="w-full px-3 py-2 text-xs bg-[#00FF9D] text-[#121212] rounded hover:bg-[#00E08C]"
          >
            Add Errl Rig
          </button>
          <button
            onClick={() => {
              const { assets, components } = createErrlAssets();
              const existingAssets = new Set(project.library.assets.map((a) => a.id));
              const existingComponents = new Set(project.library.components.map((c) => c.id));
              assets.forEach((asset) => {
                if (!existingAssets.has(asset.id)) addAsset(asset);
              });
              components.forEach((comp) => {
                if (!existingComponents.has(comp.id)) addComponent(comp);
              });
            }}
            className="w-full px-3 py-2 text-xs bg-[#121212] text-[#E0E0E0] rounded border border-[#333] hover:bg-[#1e1e1e]"
          >
            Seed Errl Assets & Components
          </button>
          <button
            onClick={() => {
              const { assets, components } = createErrlAssets();
              const existingAssets = new Set(project.library.assets.map((a) => a.id));
              const existingComponents = new Set(project.library.components.map((c) => c.id));
              assets.forEach((asset) => {
                if (!existingAssets.has(asset.id)) addAsset(asset);
              });
              components.forEach((comp) => {
                if (!existingComponents.has(comp.id)) addComponent(comp);
              });
              insertPrefab(createErrlPrefab());
            }}
            className="w-full px-3 py-2 text-xs bg-[#121212] text-[#E0E0E0] rounded border border-[#333] hover:bg-[#1e1e1e]"
          >
            Spawn Errl (Seed + Prefab)
          </button>
          <button
            onClick={() => {
              const snippet = getErrlExportSnippet();
              if (navigator?.clipboard?.writeText) {
                navigator.clipboard.writeText(snippet);
                alert('Errl export snippet copied to clipboard.');
              } else {
                console.log(snippet);
              }
            }}
            className="w-full px-3 py-2 text-xs bg-[#121212] text-[#E0E0E0] rounded border border-[#333] hover:bg-[#1e1e1e]"
          >
            Copy Errl Export Snippet
          </button>
          <p className="text-[11px] text-[#888888]">
            Inserts a grouped Errl rig prefab (requires matching assets/components).
          </p>
        </div>
      </div>

      {/* Assets Section */}
      <div>
        {isFXLabMode && (
          <h4 className="text-xs text-[#888888] mb-2">
            Assets (click to create component)
          </h4>
        )}
        <div className="grid grid-cols-4 gap-3 auto-rows-max">
          {project.library.assets.map((asset) => (
          <div
            key={asset.id}
            draggable
            onDragStart={(e) => handleDragStart(e, asset.id)}
            onDragEnd={handleDragEnd}
            onClick={() => handleAssetClick(asset.id)}
            className={`cursor-pointer p-2 bg-[#121212] rounded border transition-colors ${
              draggedAsset === asset.id
                ? 'border-[#00FF9D] opacity-50'
                : selection.assetId === asset.id && !isFXLabMode
                ? 'border-[#00FF9D] bg-[#2D2D2D]'
                : 'border-[#333333] hover:border-[#00FF9D]'
            }`}
          >
            <div className="aspect-square bg-[#1E1E1E] rounded mb-2 flex items-center justify-center overflow-hidden">
              <div 
                className="w-full h-full"
                style={{ 
                  transform: 'scale(0.8)',
                }}
                dangerouslySetInnerHTML={{ __html: asset.data }}
              />
            </div>
            <div className="text-xs text-[#E0E0E0] truncate">{asset.name}</div>
            <div className="text-xs text-[#888888]">{asset.type.toUpperCase()}</div>
          </div>
          ))}
          {project.library.assets.length === 0 && (
            <div className="col-span-4 text-center py-8 text-xs text-[#888888]">
              No assets in library
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};
