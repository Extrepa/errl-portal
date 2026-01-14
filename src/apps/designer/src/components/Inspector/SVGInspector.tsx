import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../../state/useStore';
import { findAssetUsage, analyzeAsset } from '../../utils/assetIntelligence';
import { StrokeLab } from './StrokeLab';
import { ColorReplacer } from './ColorReplacer';
import { OptimizerPanel } from './OptimizerPanel';
import { StatisticsPanel } from './StatisticsPanel';
import { CleanupPanel } from './CleanupPanel';
import { TypographyPanel } from './TypographyPanel';
import { InteractiveRuler } from '../Tools/InteractiveRuler';
import { TemplateSaveDialog } from '../Shared/TemplateSaveDialog';
import { createTemplateFromAsset } from '../../utils/templateManager';
import { simplifySvgPaths, expandStrokeToFill } from '@shared/utils/paper';
import { mergePathsInSvg } from '../../utils/pathMerger';

export const SVGInspector: React.FC = () => {
  const { selection, project, updateAssetData } = useStore();
  const [expandedSections, setExpandedSections] = useState({
    stroke: true,
    fill: true,
    paths: true,
  });
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [simplifyTolerance, setSimplifyTolerance] = useState(2);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [expandWidth, setExpandWidth] = useState(4);
  const [isExpanding, setIsExpanding] = useState(false);

  const selectedAsset = selection.assetId 
    ? project?.library.assets.find(a => a.id === selection.assetId)
    : null;

  if (!selectedAsset) {
    return (
      <div className="p-4">
        <p className="text-xs text-[#888888]">No asset selected</p>
      </div>
    );
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-[#E0E0E0] mb-4">SVG Properties</h3>

      {/* Stroke Section */}
      <div className="mb-2">
        <button
          onClick={() => toggleSection('stroke')}
          className="w-full flex items-center justify-between p-2 hover:bg-[#2D2D2D] rounded text-left"
        >
          <span className="text-xs text-[#E0E0E0]">Stroke</span>
          {expandedSections.stroke ? (
            <ChevronUp size={14} className="text-[#888888]" />
          ) : (
            <ChevronDown size={14} className="text-[#888888]" />
          )}
        </button>
        {expandedSections.stroke && (
          <div className="pl-4 pr-2 pb-2 space-y-2">
            <div>
              <label className="text-xs text-[#888888] block mb-1">Color</label>
              <input
                type="color"
                className="w-full h-8 rounded border border-[#333333] bg-[#121212]"
                defaultValue="#000000"
                onChange={(e) => {
                  // Update SVG stroke color
                  if (selectedAsset) {
                    const newData = selectedAsset.data.replace(
                      /stroke="[^"]*"/g,
                      `stroke="${e.target.value}"`
                    );
                    if (!newData.includes('stroke=')) {
                      // Add stroke if it doesn't exist
                      const updated = selectedAsset.data.replace(
                        /<svg([^>]*)>/,
                        `<svg$1 stroke="${e.target.value}">`
                      );
                      updateAssetData(selectedAsset.id, updated);
                    } else {
                      updateAssetData(selectedAsset.id, newData);
                    }
                  }
                }}
              />
            </div>
            <div>
              <label className="text-xs text-[#888888] block mb-1">Width</label>
              <input
                type="number"
                className="w-full px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
                defaultValue="1"
                min="0"
                step="0.1"
                onChange={(e) => {
                  if (selectedAsset) {
                    const width = e.target.value;
                    const newData = selectedAsset.data.replace(
                      /stroke-width="[^"]*"/g,
                      `stroke-width="${width}"`
                    );
                    if (!newData.includes('stroke-width=')) {
                      const updated = selectedAsset.data.replace(
                        /<svg([^>]*)>/,
                        `<svg$1 stroke-width="${width}">`
                      );
                      updateAssetData(selectedAsset.id, updated);
                    } else {
                      updateAssetData(selectedAsset.id, newData);
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Fill Section */}
      <div className="mb-2">
        <button
          onClick={() => toggleSection('fill')}
          className="w-full flex items-center justify-between p-2 hover:bg-[#2D2D2D] rounded text-left"
        >
          <span className="text-xs text-[#E0E0E0]">Fill</span>
          {expandedSections.fill ? (
            <ChevronUp size={14} className="text-[#888888]" />
          ) : (
            <ChevronDown size={14} className="text-[#888888]" />
          )}
        </button>
        {expandedSections.fill && (
          <div className="pl-4 pr-2 pb-2">
            <label className="text-xs text-[#888888] block mb-1">Color</label>
            <input
              type="color"
              className="w-full h-8 rounded border border-[#333333] bg-[#121212]"
              defaultValue="#00FF9D"
              onChange={(e) => {
                if (selectedAsset) {
                  const newData = selectedAsset.data.replace(
                    /fill="[^"]*"/g,
                    `fill="${e.target.value}"`
                  );
                  if (!newData.includes('fill=')) {
                    const updated = selectedAsset.data.replace(
                      /<svg([^>]*)>/,
                      `<svg$1 fill="${e.target.value}">`
                    );
                    updateAssetData(selectedAsset.id, updated);
                  } else {
                    updateAssetData(selectedAsset.id, newData);
                  }
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Paths Section */}
      <div className="mb-2">
        <button
          onClick={() => toggleSection('paths')}
          className="w-full flex items-center justify-between p-2 hover:bg-[#2D2D2D] rounded text-left"
        >
          <span className="text-xs text-[#E0E0E0]">Paths</span>
          {expandedSections.paths ? (
            <ChevronUp size={14} className="text-[#888888]" />
          ) : (
            <ChevronDown size={14} className="text-[#888888]" />
          )}
        </button>
        {expandedSections.paths && (
          <div className="pl-4 pr-2 pb-2 space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#888888] flex items-center gap-1">
                Tolerance
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={simplifyTolerance}
                  onChange={(e) => setSimplifyTolerance(Number(e.target.value))}
                  className="w-16 px-2 py-1 text-xs bg-[#0a0a0a] border border-[#333333] rounded text-[#E0E0E0]"
                />
              </label>
              <button
                disabled={isSimplifying}
                onClick={async () => {
                  if (!selectedAsset) return;
                  setIsSimplifying(true);
                  const simplified = await simplifySvgPaths(selectedAsset.data, simplifyTolerance || undefined);
                  if (simplified) {
                    updateAssetData(selectedAsset.id, simplified);
                  }
                  setIsSimplifying(false);
                }}
                className="px-3 py-1.5 text-xs rounded bg-[#121212] border border-[#333333] text-[#E0E0E0] hover:bg-[#1e1e1e] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSimplifying ? 'Simplifying...' : 'Simplify Paths'}
              </button>
              <label className="text-xs text-[#888888] flex items-center gap-1">
                Expand
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={expandWidth}
                  onChange={(e) => setExpandWidth(Number(e.target.value))}
                  className="w-16 px-2 py-1 text-xs bg-[#0a0a0a] border border-[#333333] rounded text-[#E0E0E0]"
                />
              </label>
              <button
                disabled={isExpanding}
                onClick={async () => {
                  if (!selectedAsset) return;
                  setIsExpanding(true);
                  const expanded = await expandStrokeToFill(selectedAsset.data, expandWidth || 1);
                  if (expanded) {
                    updateAssetData(selectedAsset.id, expanded);
                  }
                  setIsExpanding(false);
                }}
                className="px-3 py-1.5 text-xs rounded bg-[#121212] border border-[#333333] text-[#E0E0E0] hover:bg-[#1e1e1e] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExpanding ? 'Expanding...' : 'Expand Stroke → Fill'}
              </button>
              <button
                disabled={isMerging}
                onClick={async () => {
                  if (!selectedAsset) return;
                  setIsMerging(true);
                  const merged = await mergePathsInSvg(selectedAsset.data, 'union');
                  if (merged) {
                    updateAssetData(selectedAsset.id, merged);
                  }
                  setIsMerging(false);
                }}
                className="px-3 py-1.5 text-xs rounded bg-[#121212] border border-[#333333] text-[#E0E0E0] hover:bg-[#1e1e1e] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMerging ? 'Merging...' : 'Merge Paths (Union)'}
              </button>
            </div>
            <p className="text-[11px] text-[#888888]">
              Uses Paper.js simplify() to reduce path points. Adjust tolerance for stronger simplification.
            </p>
            <p className="text-[11px] text-[#888888]">
              Expand converts stroke width into filled outlines (Paper.js expandStroke()).
            </p>
            <p className="text-[11px] text-[#888888]">
              Merge combines all paths via union into a single path (requires Paper.js).
            </p>
          </div>
        )}
      </div>

      {/* Stroke Lab */}
      <div className="mt-4 pt-4 border-t border-[#333333]">
        <StrokeLab />
      </div>

      {/* Color Replacer */}
      <ColorReplacer />

      {/* Usage Audit */}
      {project && (
        <div className="mt-4 pt-4 border-t border-[#333333]">
          <h4 className="text-xs font-medium text-[#E0E0E0] mb-2">Usage Audit</h4>
          {(() => {
            const usage = findAssetUsage(selectedAsset.id, project);
            const analysis = analyzeAsset(selectedAsset);
            return (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#888888]">Used in scenes:</span>
                  <span className="text-[#E0E0E0]">{usage.scenes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">Used in components:</span>
                  <span className="text-[#E0E0E0]">{usage.components}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">Total instances:</span>
                  <span className="text-[#E0E0E0]">{usage.totalInstances}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#333333]">
                  <div className="text-[#888888] mb-1">Analysis:</div>
                  <div className="flex flex-wrap gap-1">
                    {analysis.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 bg-[#121212] border border-[#333333] rounded text-[10px] text-[#888888]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Interactive Ruler */}
      <div className="mt-4 pt-4 border-t border-[#333333]">
        <div className="p-4">
          <h4 className="text-xs font-medium text-[#E0E0E0] mb-3">Measurement Tools</h4>
          <InteractiveRuler />
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-4 pt-4 border-t border-[#333333]">
        <StatisticsPanel />
      </div>

      {/* Cleanup */}
      <div className="mt-4 pt-4 border-t border-[#333333]">
        <CleanupPanel />
      </div>

      {/* Optimizer */}
      <div className="mt-4 pt-4 border-t border-[#333333]">
        <OptimizerPanel />
      </div>

      {/* Typography */}
      <div className="mt-4 pt-4 border-t border-[#333333]">
        <TypographyPanel />
      </div>

      {/* Save as Template */}
      <div className="mt-4 pt-4 border-t border-[#333333]">
        <button
          onClick={() => setShowSaveTemplate(true)}
          className="w-full px-4 py-2 text-xs bg-[#7000FF] text-white rounded hover:bg-[#6000E0]"
        >
          Save as Template
        </button>
      </div>

      {/* Template Save Dialog */}
      {selectedAsset && (
        <TemplateSaveDialog
          isOpen={showSaveTemplate}
          onClose={() => setShowSaveTemplate(false)}
          onSave={(id) => {
            console.log('Template saved:', id);
            setShowSaveTemplate(false);
          }}
          type="svg"
          data={selectedAsset.data}
          defaultName={selectedAsset.name}
        />
      )}
    </div>
  );
};
