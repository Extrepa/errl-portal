import React, { useState } from 'react';
import { Clock, RotateCcw, Camera, X } from 'lucide-react';
import { useStore } from '../../state/useStore';
import { generateId } from '../../utils/helpers';
import type { AssetVersion } from '../../state/types';

export const VersionBrowser: React.FC = () => {
  const { selection, project, createVersionSnapshot, rollbackToVersion, updateAsset } = useStore();
  const [showGhost, setShowGhost] = useState<string | null>(null);
  const [newVersionName, setNewVersionName] = useState('');

  const selectedAsset = selection.assetId
    ? project?.library.assets.find(a => a.id === selection.assetId)
    : null;

  const versions = selectedAsset?.history || [];

  const handleCreateSnapshot = () => {
    if (!selectedAsset) return;
    const name = newVersionName.trim() || undefined;
    createVersionSnapshot(selectedAsset.id, name);
    setNewVersionName('');
  };

  const handleRollback = (versionId: string) => {
    if (!selectedAsset) return;
    if (confirm('Rollback to this version? This will replace the current asset data.')) {
      rollbackToVersion(selectedAsset.id, versionId);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!selectedAsset) {
    return (
      <div className="p-4">
        <p className="text-xs text-[#888888]">Select an asset to view version history</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-[#333333]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#E0E0E0]">Version History</h3>
        <button
          onClick={handleCreateSnapshot}
          className="px-2 py-1 text-xs bg-[#00FF9D] text-[#121212] rounded hover:bg-[#00E08C] flex items-center gap-1"
          title="Create snapshot of current version"
        >
          <Camera size={12} />
          Snapshot
        </button>
      </div>

      {/* Create Snapshot Input */}
      <div className="mb-4">
        <input
          type="text"
          value={newVersionName}
          onChange={(e) => setNewVersionName(e.target.value)}
          placeholder="Version name (optional)"
          className="w-full px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0] mb-2"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCreateSnapshot();
            }
          }}
        />
      </div>

      {/* Versions List */}
      {versions.length === 0 ? (
        <p className="text-xs text-[#666666]">No versions yet. Create a snapshot to save a version.</p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-auto">
          {versions
            .slice()
            .reverse()
            .map((version) => (
              <div
                key={version.id}
                className="p-3 bg-[#121212] rounded border border-[#333333] hover:border-[#00FF9D] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-[#888888]" />
                    <span className="text-xs text-[#E0E0E0] font-medium">
                      {version.name || 'Unnamed Version'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowGhost(showGhost === version.id ? null : version.id)}
                      className={`px-2 py-1 text-[10px] rounded ${
                        showGhost === version.id
                          ? 'bg-[#00FF9D] text-[#121212]'
                          : 'bg-[#1E1E1E] text-[#888888] hover:bg-[#2D2D2D]'
                      }`}
                      title="Show ghost overlay"
                    >
                      Ghost
                    </button>
                    <button
                      onClick={() => handleRollback(version.id)}
                      className="px-2 py-1 text-[10px] bg-[#1E1E1E] text-[#00FF9D] rounded border border-[#00FF9D] hover:bg-[#2D2D2D] flex items-center gap-1"
                      title="Rollback to this version"
                    >
                      <RotateCcw size={10} />
                      Rollback
                    </button>
                  </div>
                </div>
                <div className="text-[10px] text-[#666666]">
                  {formatDate(version.timestamp)}
                </div>
                {showGhost === version.id && (
                  <div className="mt-2 p-2 bg-[#0a0a0a] rounded border border-red-500/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-red-400">Ghost Preview (Previous Version)</span>
                      <button
                        onClick={() => setShowGhost(null)}
                        className="text-[#888888] hover:text-[#E0E0E0]"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <div
                      className="w-full h-32 bg-[#1E1E1E] rounded flex items-center justify-center overflow-hidden opacity-50"
                      dangerouslySetInnerHTML={{ __html: version.data }}
                      style={{ transform: 'scale(0.5)' }}
                    />
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

