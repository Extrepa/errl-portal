import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { useStore } from '../../state/useStore';
import { calculateHealthScore, findUnusedAssets } from '../../utils/optimizationUtils';

interface ProjectHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectHealthModal: React.FC<ProjectHealthModalProps> = ({ isOpen, onClose }) => {
  const { project, removeAsset } = useStore();
  const [optimizing, setOptimizing] = useState(false);

  if (!isOpen || !project) return null;

  const diagnostics = calculateHealthScore(project);

  const handleOptimize = () => {
    setOptimizing(true);
    // Remove unused assets
    diagnostics.unusedAssets.forEach((asset) => {
      removeAsset(asset.id);
    });
    setOptimizing(false);
    onClose();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#00FF9D]';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1E1E1E] border border-[#333333] rounded-lg w-[600px] max-h-[80vh] overflow-auto">
        <div className="p-4 border-b border-[#333333] flex items-center justify-between">
          <h2 className="text-lg font-medium text-[#E0E0E0]">Project Health</h2>
          <button
            onClick={onClose}
            className="p-1 text-[#888888] hover:text-[#E0E0E0]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {/* Health Score */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#888888]">Health Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(diagnostics.score)}`}>
                {diagnostics.score}/100
              </span>
            </div>
            <div className="w-full h-2 bg-[#121212] rounded overflow-hidden">
              <div
                className={`h-full ${getScoreColor(diagnostics.score).replace('text-', 'bg-')}`}
                style={{ width: `${diagnostics.score}%` }}
              />
            </div>
          </div>

          {/* Warnings */}
          {diagnostics.warnings.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-yellow-400" />
                <h3 className="text-sm font-medium text-[#E0E0E0]">Warnings</h3>
              </div>
              <div className="space-y-1">
                {diagnostics.warnings.map((warning, index) => (
                  <div key={index} className="text-xs text-[#888888] pl-6">
                    • {warning}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unused Assets */}
          {diagnostics.unusedAssets.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-[#E0E0E0] mb-2">
                Unused Assets ({diagnostics.unusedAssets.length})
              </h3>
              <div className="max-h-32 overflow-auto space-y-1">
                {diagnostics.unusedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-2 bg-[#121212] rounded text-xs"
                  >
                    <span className="text-[#E0E0E0]">{asset.name}</span>
                    <button
                      onClick={() => removeAsset(asset.id)}
                      className="px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {diagnostics.suggestions.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-[#00FF9D]" />
                <h3 className="text-sm font-medium text-[#E0E0E0]">Suggestions</h3>
              </div>
              <div className="space-y-1">
                {diagnostics.suggestions.map((suggestion, index) => (
                  <div key={index} className="text-xs text-[#888888] pl-6">
                    • {suggestion}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-6 pt-4 border-t border-[#333333]">
            <button
              onClick={handleOptimize}
              disabled={optimizing || diagnostics.unusedAssets.length === 0}
              className="flex-1 px-4 py-2 text-sm bg-[#00FF9D] text-[#121212] rounded hover:bg-[#00E08C] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {optimizing ? 'Optimizing...' : 'Remove Unused Assets'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-[#121212] border border-[#333333] rounded text-[#E0E0E0] hover:bg-[#2D2D2D]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

