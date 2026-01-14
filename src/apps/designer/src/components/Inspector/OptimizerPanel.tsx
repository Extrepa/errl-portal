import React, { useState, useMemo } from 'react';
import { Zap, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../state/useStore';
import { optimizeSVG, type OptimizerOptions } from '../../utils/svgOptimizer';

export const OptimizerPanel: React.FC = () => {
  const { selection, project, updateAsset } = useStore();
  const [options, setOptions] = useState<OptimizerOptions>({
    removeComments: true,
    removeMetadata: true,
    removeUnusedDefs: true,
    combinePaths: false,
    optimizePaths: true,
    roundCoordinates: true,
    precision: 2,
    removeHiddenElements: true,
    minifyWhitespace: true,
  });
  const [stats, setStats] = useState<{ original: number; optimized: number; reduction: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedAsset = selection.assetId
    ? project?.library.assets.find((a) => a.id === selection.assetId)
    : null;

  const canOptimize = selectedAsset && selectedAsset.type === 'svg';

  const handleOptimize = () => {
    if (!selectedAsset || selectedAsset.type !== 'svg') return;

    setIsProcessing(true);
    try {
      const result = optimizeSVG(selectedAsset.data, options);
      updateAsset(selectedAsset.id, { data: result.optimized });
      setStats({
        original: result.stats.originalSize,
        optimized: result.stats.optimizedSize,
        reduction: result.stats.reductionPercent,
      });
    } catch (error) {
      console.error('Optimization failed:', error);
      alert('Failed to optimize SVG');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleOption = (key: keyof OptimizerOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
    setStats(null); // Clear stats when options change
  };

  const updatePrecision = (precision: number) => {
    setOptions((prev) => ({ ...prev, precision }));
    setStats(null);
  };

  if (!canOptimize) {
    return (
      <div className="p-4 border-t border-[#333333]">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={16} className="text-[#00FF9D]" />
          <h4 className="text-xs font-medium text-[#E0E0E0]">SVG Optimizer</h4>
        </div>
        <p className="text-xs text-[#888888]">Select an SVG asset to optimize</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-[#333333]">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} className="text-[#00FF9D]" />
        <h4 className="text-xs font-medium text-[#E0E0E0]">SVG Optimizer</h4>
      </div>

      {/* Options */}
      <div className="space-y-2 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.removeComments ?? false}
            onChange={() => toggleOption('removeComments')}
            className="w-3 h-3 rounded border-[#333333] bg-[#121212] text-[#00FF9D] focus:ring-[#00FF9D]"
          />
          <span className="text-xs text-[#E0E0E0]">Remove comments</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.removeMetadata ?? false}
            onChange={() => toggleOption('removeMetadata')}
            className="w-3 h-3 rounded border-[#333333] bg-[#121212] text-[#00FF9D] focus:ring-[#00FF9D]"
          />
          <span className="text-xs text-[#E0E0E0]">Remove metadata</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.removeUnusedDefs ?? false}
            onChange={() => toggleOption('removeUnusedDefs')}
            className="w-3 h-3 rounded border-[#333333] bg-[#121212] text-[#00FF9D] focus:ring-[#00FF9D]"
          />
          <span className="text-xs text-[#E0E0E0]">Remove unused definitions</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.removeHiddenElements ?? false}
            onChange={() => toggleOption('removeHiddenElements')}
            className="w-3 h-3 rounded border-[#333333] bg-[#121212] text-[#00FF9D] focus:ring-[#00FF9D]"
          />
          <span className="text-xs text-[#E0E0E0]">Remove hidden elements</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.optimizePaths ?? false}
            onChange={() => toggleOption('optimizePaths')}
            className="w-3 h-3 rounded border-[#333333] bg-[#121212] text-[#00FF9D] focus:ring-[#00FF9D]"
          />
          <span className="text-xs text-[#E0E0E0]">Optimize paths</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.roundCoordinates ?? false}
            onChange={() => toggleOption('roundCoordinates')}
            className="w-3 h-3 rounded border-[#333333] bg-[#121212] text-[#00FF9D] focus:ring-[#00FF9D]"
            disabled={!options.optimizePaths}
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
            checked={options.combinePaths ?? false}
            onChange={() => toggleOption('combinePaths')}
            className="w-3 h-3 rounded border-[#333333] bg-[#121212] text-[#00FF9D] focus:ring-[#00FF9D]"
          />
          <span className="text-xs text-[#E0E0E0]">Combine paths (experimental)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.minifyWhitespace ?? false}
            onChange={() => toggleOption('minifyWhitespace')}
            className="w-3 h-3 rounded border-[#333333] bg-[#121212] text-[#00FF9D] focus:ring-[#00FF9D]"
          />
          <span className="text-xs text-[#E0E0E0]">Minify whitespace</span>
        </label>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-4 p-2 bg-[#1A1A1A] border border-[#333333] rounded">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={14} className="text-[#00FF9D]" />
            <span className="text-xs font-medium text-[#E0E0E0]">Optimization Results</span>
          </div>
          <div className="text-xs text-[#888888] space-y-1">
            <div>Original: {(stats.original / 1024).toFixed(2)} KB</div>
            <div>Optimized: {(stats.optimized / 1024).toFixed(2)} KB</div>
            <div className="text-[#00FF9D]">
              Reduction: {stats.reduction > 0 ? '-' : '+'}{Math.abs(stats.reduction).toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Apply Button */}
      <button
        onClick={handleOptimize}
        disabled={isProcessing}
        className="w-full px-4 py-2 text-xs bg-[#00FF9D] text-[#121212] rounded hover:bg-[#00E08C] disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isProcessing ? 'Optimizing...' : 'Apply Optimization'}
      </button>
    </div>
  );
};

