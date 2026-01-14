import React, { useState, useMemo } from 'react';
import { Search, Plus, FileText, Package, Trash2, Tag, Layers2, CheckSquare, Square, Folder } from 'lucide-react';
import { useStore } from '../../state/useStore';
import { generateId } from '../../utils/helpers';
import { TemplateBrowser } from './TemplateBrowser';
import { CollectionsPanel } from './CollectionsPanel';
import type { Asset } from '../../state/types';

type LibraryTab = 'assets' | 'templates' | 'collections';

export const AssetLibrary: React.FC = () => {
  const { project, addAsset, removeAsset, updateAsset, selection, setSelection } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<LibraryTab>('assets');
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [batchMode, setBatchMode] = useState(false);

  // Global search across assets, components, and scenes
  const globalSearchResults = useMemo(() => {
    if (!project || !searchQuery.trim()) return null;
    
    const query = searchQuery.toLowerCase();
    const results = {
      assets: project.library.assets.filter(a => 
        a.name.toLowerCase().includes(query) ||
        a.tags?.some(t => t.toLowerCase().includes(query))
      ),
      components: project.library.components.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.tags?.some(t => t.toLowerCase().includes(query))
      ),
      scenes: project.scene.layers.flatMap(layer => 
        layer.objects.filter(obj => {
          // Search by component/asset name if object references one
          const component = project.library.components.find(c => c.id === obj.ref);
          const asset = project.library.assets.find(a => a.id === obj.ref);
          const refName = component?.name || asset?.name || '';
          return refName.toLowerCase().includes(query);
        })
      ),
    };
    
    return results;
  }, [project, searchQuery]);

  const filteredAssets = useMemo(() => {
    if (!project) return [];
    if (globalSearchResults && searchQuery.trim()) {
      return globalSearchResults.assets;
    }
    return project.library.assets.filter(asset =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [project, searchQuery, globalSearchResults]);

  const assetCount = project?.library.assets.length ?? 0;

  const handleToggleBatchMode = () => {
    setBatchMode(!batchMode);
    if (batchMode) {
      setSelectedAssetIds(new Set());
    }
  };

  const handleToggleAssetSelection = (assetId: string) => {
    const newSelected = new Set(selectedAssetIds);
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId);
    } else {
      newSelected.add(assetId);
    }
    setSelectedAssetIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedAssetIds.size === filteredAssets.length) {
      setSelectedAssetIds(new Set());
    } else {
      setSelectedAssetIds(new Set(filteredAssets.map(a => a.id)));
    }
  };

  const handleBatchDelete = () => {
    if (selectedAssetIds.size === 0) return;
    if (confirm(`Delete ${selectedAssetIds.size} asset(s)?`)) {
      selectedAssetIds.forEach(id => removeAsset(id));
      setSelectedAssetIds(new Set());
      setBatchMode(false);
    }
  };

  const handleBatchAddTag = () => {
    const tag = prompt('Enter tag to add to selected assets:');
    if (!tag || selectedAssetIds.size === 0) return;
    
    selectedAssetIds.forEach(id => {
      const asset = project?.library.assets.find(a => a.id === id);
      if (asset) {
        const currentTags = asset.tags || [];
        if (!currentTags.includes(tag)) {
          updateAsset(id, { tags: [...currentTags, tag] });
        }
      }
    });
    setSelectedAssetIds(new Set());
  };

  const handleAddAsset = () => {
    // Create a new empty SVG asset
    const newAsset: Asset = {
      id: generateId('asset'),
      name: `New Asset ${assetCount + 1}`,
      type: 'svg',
      data: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#00FF9D"/></svg>',
    };
    addAsset(newAsset);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#E0E0E0]">Library</h3>
        {activeTab === 'assets' && (
          <button
            onClick={handleAddAsset}
            className="p-1.5 rounded bg-[#00FF9D] text-[#121212] hover:bg-[#00E08A] transition-colors"
            title="Add new asset"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-[#333333]">
        <button
          onClick={() => setActiveTab('assets')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === 'assets'
              ? 'text-[#00FF9D] border-b-2 border-[#00FF9D]'
              : 'text-[#888888] hover:text-[#E0E0E0]'
          }`}
        >
          <Package size={14} />
          Assets
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === 'templates'
              ? 'text-[#00FF9D] border-b-2 border-[#00FF9D]'
              : 'text-[#888888] hover:text-[#E0E0E0]'
          }`}
        >
          <FileText size={14} />
          Templates
        </button>
        <button
          onClick={() => setActiveTab('collections')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === 'collections'
              ? 'text-[#00FF9D] border-b-2 border-[#00FF9D]'
              : 'text-[#888888] hover:text-[#E0E0E0]'
          }`}
        >
          <Folder size={14} />
          Collections
        </button>
      </div>

      {activeTab === 'assets' && (
        <>
          {/* Search */}
          <div className="mb-4 relative">
            <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#888888]" />
            <input
              type="text"
              placeholder="Search assets (or global search)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0] placeholder-[#888888] focus:outline-none focus:border-[#00FF9D]"
            />
          </div>

          {/* Global Search Results */}
          {globalSearchResults && searchQuery.trim() && (
            <div className="mb-4 p-3 bg-[#1A1A1A] border border-[#333333] rounded">
              <div className="text-xs font-medium text-[#E0E0E0] mb-2">Global Search Results</div>
              <div className="space-y-1 text-xs text-[#888888]">
                {globalSearchResults.assets.length > 0 && (
                  <div>Assets: {globalSearchResults.assets.length}</div>
                )}
                {globalSearchResults.components.length > 0 && (
                  <div>Components: {globalSearchResults.components.length}</div>
                )}
                {globalSearchResults.scenes.length > 0 && (
                  <div>Scene Objects: {globalSearchResults.scenes.length}</div>
                )}
                {globalSearchResults.assets.length === 0 && 
                 globalSearchResults.components.length === 0 && 
                 globalSearchResults.scenes.length === 0 && (
                  <div>No results found</div>
                )}
              </div>
            </div>
          )}

          {/* Batch Mode Controls */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleBatchMode}
                className={`flex items-center gap-2 px-2 py-1 text-xs rounded ${
                  batchMode
                    ? 'bg-[#00FF9D] text-[#121212]'
                    : 'bg-[#121212] border border-[#333333] text-[#888888] hover:bg-[#2D2D2D]'
                }`}
              >
                {batchMode ? <CheckSquare size={14} /> : <Square size={14} />}
                Batch Mode
              </button>
              {batchMode && filteredAssets.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-[#888888] hover:text-[#E0E0E0]"
                >
                  {selectedAssetIds.size === filteredAssets.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
            {batchMode && selectedAssetIds.size > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBatchAddTag}
                  className="p-1.5 rounded bg-[#121212] border border-[#333333] text-[#888888] hover:bg-[#2D2D2D] hover:text-[#E0E0E0]"
                  title="Add tag to selected"
                >
                  <Tag size={14} />
                </button>
                <button
                  onClick={handleBatchDelete}
                  className="p-1.5 rounded bg-[#121212] border border-[#333333] text-red-400 hover:bg-[#2D2D2D]"
                  title="Delete selected"
                >
                  <Trash2 size={14} />
                </button>
                <span className="text-xs text-[#888888]">
                  {selectedAssetIds.size} selected
                </span>
              </div>
            )}
          </div>

          {/* Asset count */}
          <div className="text-xs text-[#888888] mb-2">
            {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''}
            {batchMode && selectedAssetIds.size > 0 && ` (${selectedAssetIds.size} selected)`}
          </div>

          {/* Asset List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredAssets.map((asset) => {
              const isSelected = selectedAssetIds.has(asset.id);
              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    if (batchMode) {
                      handleToggleAssetSelection(asset.id);
                    } else {
                      setSelection({ assetId: asset.id });
                    }
                  }}
                  className={`p-3 rounded border cursor-pointer transition-colors ${
                    batchMode
                      ? isSelected
                        ? 'border-[#00FF9D] bg-[#00FF9D]/10'
                        : 'border-[#333333] bg-[#121212] hover:border-[#555555]'
                      : selection.assetId === asset.id
                      ? 'border-[#00FF9D] bg-[#00FF9D]/10'
                      : 'border-[#333333] bg-[#121212] hover:border-[#555555]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {batchMode && (
                      <div className="mt-1">
                        {isSelected ? (
                          <CheckSquare size={16} className="text-[#00FF9D]" />
                        ) : (
                          <Square size={16} className="text-[#888888]" />
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-[#E0E0E0] truncate">{asset.name}</div>
                      <div className="text-[10px] text-[#666666] uppercase mt-1">{asset.type}</div>
                      {asset.tags && asset.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {asset.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 bg-[#1A1A1A] border border-[#333333] rounded text-[10px] text-[#888888]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {!batchMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete ${asset.name}?`)) {
                            removeAsset(asset.id);
                          }
                        }}
                        className="p-1 text-[#666666] hover:text-red-400"
                        title="Delete asset"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredAssets.length === 0 && (
              <div className="text-xs text-[#888888] text-center py-8">
                No assets found
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'templates' && <TemplateBrowser />}
      {activeTab === 'collections' && <CollectionsPanel />}
    </div>
  );
};
