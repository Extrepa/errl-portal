import React, { useState } from 'react';
import { Trash2, AlertCircle } from 'lucide-react';
import { useStore } from '../../state/useStore';
import { cleanupSVG, type CleanupOptions } from '../../utils/cleanupUtils';

export const CleanupPanel: React.FC = () => {
  const { selection, project, updateAsset } = useStore();
  const [options, setOptions] = useState<CleanupOptions>({
    removeInvisibleElements: true,
    removeStrayPoints: false,
    threshold: 1,
    roundCoordinates: true,
    precision: 2,
    removeEmptyGroups: true,
    removeDuplicates: false,
  });
  const [removedCount, setRemovedCount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedAsset = selection.assetId
    ? project?.library.assets.find((a) => a.id === selection.assetId)
    : null;

  const canCleanup = selectedAsset && selectedAsset.type === 'svg';

  const handleCleanup = () => {
    if (!selectedAsset || selectedAsset.type !== 'svg') return;

    setIsProcessing(true);
    try {
      const result = cleanupSVG(selectedAsset.data, options);
      updateAsset(selectedAsset.id, { data: result.cleaned });
      setRemovedCount(result.removedCount);
    } catch (error) {
      console.error('Cleanup failed:', error);
      alert('Failed to cleanup SVG');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleOption = (key: keyof CleanupOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
    setRemovedCount(null);
  };

  const updatePrecision = (precision: number) => {
    setOptions((prev) => ({ ...prev, precision }));
    setRemovedCount(null);
  };

  if (!canCleanup) {
    return (
      <div className="p-4 border-t border-[#333333]">
        <div className="flex items-center gap-2 mb-2">
          <Trash2 size={16} className="text-[#00FF9D]" />
          <h4 className="text-xs font-medium text-[#E0E0E0]">Cleanup Tools</h4>
        </div>
        <p className="text-xs text-[#888888]">Select an SVG asset to clean up</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-[#333333]">
      <div className="flex items-center gap-2 mb-4">
        <Trash2 size={16} className="text-[#00FF9D]" />
        <h4 className="text-xs font-medium text-[#E0E0E0]">Cleanup Tools</h4>
      </div>

      {/* Options */}
      <div className="space-y-2 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.removeInvisibleElements ?? false}
            onChange={() => toggleOption('removeInvisibleElements')}
            className="w-3 h-3 rounded border-[#333333] bg-[#121212] text-[#00FF9D] focus:ring-[#00FF9D]"
          />
          <span className="text-xs text-[#E0E0E0]">Remove invisible elements</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.removeEmptyGroups ?? false}
            onChange={() => toggleOption('removeEmptyGroups')}
            className="w-3 h-3 rounded border-[#333333] bg-[#121212] text-[#00FF9D] focus:ring-[#00FF9D]"
          />
          <span className="text-xs text-[#E0E0E0]">Remove empty groups</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.roundCoordinates ?? false}
            onChange={() => toggleOption('roundCoordinates')}
            className="w-3 h-3 rounded border-[#333333] bg-[#121212] text-[#00FF9D] focus:ring-[#00FF9D]"
          />
          <span className="text-xs text-[#E0E0E0]">Round coordinates</span>
        </label>

        {options.roundCoordinates && (
          <div className="ml-5">
            <label className="text-xs text-[#888888] block mb-1">Precision</label>
            <input
              type="number"
              min="0"
              max="10"
              value={options.precision || 2}
              onChange={(e) => updatePrecision(parseInt(e.target.value) || 2)}
              className="w-full px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
            />
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.removeDuplicates ?? false}
            onChange={() => toggleOption('removeDuplicates')}
            className="w-3 h-3 rounded border-[#333333] bg-[#121212] text-[#00FF9D] focus:ring-[#00FF9D]"
          />
          <span className="text-xs text-[#E0E0E0]">Remove duplicate paths</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.removeStrayPoints ?? false}
            onChange={() => toggleOption('removeStrayPoints')}
            className="w-3 h-3 rounded border-[#333333] bg-[#121212] text-[#00FF9D] focus:ring-[#00FF9D]"
          />
          <span className="text-xs text-[#E0E0E0]">Remove stray points (experimental)</span>
        </label>
      </div>

      {/* Warning */}
      <div className="mb-4 p-2 bg-[#2A1A00] border border-[#664400] rounded">
        <div className="flex items-center gap-2">
          <AlertCircle size={12} className="text-[#FFAA00]" />
          <span className="text-[10px] text-[#FFAA00]">
            Cleanup operations cannot be undone. Make sure to save your work.
          </span>
        </div>
      </div>

      {/* Results */}
      {removedCount !== null && (
        <div className="mb-4 p-2 bg-[#1A1A1A] border border-[#333333] rounded">
          <div className="text-xs text-[#E0E0E0]">
            Removed {removedCount} element{removedCount !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Apply Button */}
      <button
        onClick={handleCleanup}
        disabled={isProcessing}
        className="w-full px-4 py-2 text-xs bg-[#00FF9D] text-[#121212] rounded hover:bg-[#00E08C] disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isProcessing ? 'Cleaning...' : 'Apply Cleanup'}
      </button>
    </div>
  );
};

