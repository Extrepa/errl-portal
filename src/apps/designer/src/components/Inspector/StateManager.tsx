import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, History } from 'lucide-react';
import { useStore } from '../../state/useStore';
import { generateId } from '../../utils/helpers';
import { VersionBrowser } from './VersionBrowser';
import type { AssetState } from '../../state/types';

export const StateManager: React.FC = () => {
  const { selection, project, updateAsset } = useStore();
  const [editingState, setEditingState] = useState<string | null>(null);
  const [newStateName, setNewStateName] = useState('');
  const [showVersions, setShowVersions] = useState(false);

  const selectedAsset = selection.assetId
    ? project?.library.assets.find((a) => a.id === selection.assetId)
    : null;

  if (!selectedAsset) {
    return (
      <div className="p-4">
        <p className="text-xs text-[#888888]">Select an asset to manage states</p>
      </div>
    );
  }

  const states = selectedAsset.states || [];

  const handleAddState = () => {
    if (!selectedAsset || !newStateName.trim()) return;

    const newState: AssetState = {
      name: newStateName.trim(),
      data: selectedAsset.data, // Copy current asset data as starting point
    };

    const updatedStates = [...states, newState];
    updateAsset(selectedAsset.id, { states: updatedStates });
    setNewStateName('');
  };

  const handleDeleteState = (stateName: string) => {
    if (!selectedAsset) return;
    const updatedStates = states.filter((s) => s.name !== stateName);
    updateAsset(selectedAsset.id, { states: updatedStates });
  };

  const handleUpdateStateData = (stateName: string, newData: string) => {
    if (!selectedAsset) return;
    const updatedStates = states.map((s) =>
      s.name === stateName ? { ...s, data: newData } : s
    );
    updateAsset(selectedAsset.id, { states: updatedStates });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#E0E0E0]">Asset States</h3>
        <button
          onClick={() => setShowVersions(!showVersions)}
          className={`p-2 rounded transition-colors ${
            showVersions
              ? 'bg-[#2D2D2D] text-[#00FF9D]'
              : 'text-[#888888] hover:bg-[#2D2D2D]'
          }`}
          title="Toggle version history"
        >
          <History size={14} />
        </button>
      </div>
      <p className="text-xs text-[#888888] mb-4">
        Manage multiple states for {selectedAsset.name}
      </p>

      {/* Add New State */}
      <div className="mb-4 p-3 bg-[#121212] border border-[#333333] rounded">
        <div className="flex gap-2">
          <input
            type="text"
            value={newStateName}
            onChange={(e) => setNewStateName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddState();
              }
            }}
            placeholder="State name (e.g., idle, walk, jump)"
            className="flex-1 px-2 py-1 text-xs bg-[#0a0a0a] border border-[#333333] rounded text-[#E0E0E0]"
          />
          <button
            onClick={handleAddState}
            className="px-2 py-1 text-xs bg-[#00FF9D] text-[#121212] rounded hover:bg-[#00E08A] flex items-center gap-1"
          >
            <Plus size={12} />
            Add
          </button>
        </div>
      </div>

      {/* States List */}
      <div className="space-y-2">
        {states.length === 0 ? (
          <p className="text-xs text-[#888888]">No states defined. Add a state to get started.</p>
        ) : (
          states.map((state) => (
            <div
              key={state.name}
              className="p-3 bg-[#121212] border border-[#333333] rounded"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-[#E0E0E0] font-medium">{state.name}</div>
                <div className="flex items-center gap-1">
                  {editingState === state.name ? (
                    <>
                      <button
                        onClick={() => setEditingState(null)}
                        className="p-1 text-[#888888] hover:text-[#E0E0E0]"
                        title="Cancel editing"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingState(state.name)}
                        className="p-1 text-[#888888] hover:text-[#E0E0E0]"
                        title="Edit state data"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete state "${state.name}"?`)) {
                            handleDeleteState(state.name);
                          }
                        }}
                        className="p-1 text-[#888888] hover:text-red-400"
                        title="Delete state"
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              {editingState === state.name ? (
                <div className="mt-2">
                  <textarea
                    value={state.data}
                    onChange={(e) => handleUpdateStateData(state.name, e.target.value)}
                    className="w-full h-32 px-2 py-1 text-xs bg-[#0a0a0a] border border-[#333333] rounded text-[#E0E0E0] font-mono"
                    placeholder="SVG data..."
                  />
                  <button
                    onClick={() => setEditingState(null)}
                    className="mt-2 px-2 py-1 text-xs bg-[#2D2D2D] border border-[#333333] rounded text-[#E0E0E0] hover:bg-[#3D3D3D]"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="text-xs text-[#888888]">
                  {state.data.length} characters
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showVersions && (
        <div className="mt-6 pt-6 border-t border-[#333333]">
          <VersionBrowser />
        </div>
      )}
    </div>
  );
};

