import React, { useState } from 'react';
import { Search, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../../state/useStore';
import { findSimilarAssets, findAssetUsage, analyzeAsset } from '../../utils/assetIntelligence';
import type { Asset } from '../../state/types';

export const AssetSearch: React.FC = () => {
  const { project, setSelection } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [similarToAsset, setSimilarToAsset] = useState<string | null>(null);

  if (!project) {
    return (
      <div className="p-4">
        <p className="text-xs text-[#888888]">No project loaded</p>
      </div>
    );
  }

  const filteredAssets = project.library.assets.filter((asset) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      asset.name.toLowerCase().includes(query) ||
      asset.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
      false
    );
  });

  const similarAssets = similarToAsset
    ? findSimilarAssets(
        project.library.assets.find((a) => a.id === similarToAsset) || project.library.assets[0],
        project
      )
    : [];

  return (
    <div className="p-4 border-b border-[#333333]">
      <div className="flex items-center gap-2 mb-3">
        <Search size={14} className="text-[#888888]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search assets by name or tag..."
          className="flex-1 px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
        />
      </div>

      {similarToAsset && (
        <div className="mb-3">
          <button
            onClick={() => setSimilarToAsset(null)}
            className="text-xs text-[#888888] hover:text-[#E0E0E0]"
          >
            Clear similarity search
          </button>
          <div className="mt-2 space-y-1">
            {similarAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => setSelection({ assetId: asset.id })}
                className="p-2 bg-[#121212] rounded border border-[#333333] hover:border-[#00FF9D] cursor-pointer"
              >
                <div className="text-xs text-[#E0E0E0]">{asset.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-[#888888] mb-2">
        {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''} found
      </div>
    </div>
  );
};

