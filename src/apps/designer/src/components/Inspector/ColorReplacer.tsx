import React, { useMemo, useState } from 'react';
import { ReplaceResult, replaceColor } from '../../utils/colorReplacer';
import { extractColorsFromSvg } from '../../utils/paletteExtractor';
import { useStore } from '../../state/useStore';

export const ColorReplacer: React.FC = () => {
  const { selection, project, updateAssetData } = useStore();
  const [fromColor, setFromColor] = useState('#000000');
  const [toColor, setToColor] = useState('#00ff9d');
  const [lastResult, setLastResult] = useState<ReplaceResult | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [previewSvg, setPreviewSvg] = useState<string | null>(null);
  const [chipTarget, setChipTarget] = useState<'from' | 'to'>('from');

  const selectedAsset = selection.assetId
    ? project?.library.assets.find((a) => a.id === selection.assetId)
    : null;

  const palette = useMemo(() => {
    if (!selectedAsset) return [];
    return extractColorsFromSvg(selectedAsset.data);
  }, [selectedAsset]);

  const applyReplacement = (targetSvg: string | null) => {
    if (!selectedAsset) return;
    const source = targetSvg ?? selectedAsset.data;
    const { updated, replacements } = replaceColor(source, fromColor, toColor);
    if (replacements > 0) {
      updateAssetData(selectedAsset.id, updated);
    }
    setLastResult({ updated, replacements });
    setHistory((prev) => {
      const next = [fromColor, toColor, ...prev];
      return Array.from(new Set(next)).slice(0, 8);
    });
    setPreviewSvg(null);
  };

  if (!selectedAsset) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-[#333333]">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-medium text-[#E0E0E0]">Color Replacer</h4>
        {lastResult && (
          <span className="text-[11px] text-[#888888]">
            {lastResult.replacements} repl.
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1 text-[11px] text-[#888888]">
          <span className="inline-block w-3 h-3 rounded border border-[#333] shadow-inner" style={{ background: fromColor }} />
          <span>→</span>
          <span className="inline-block w-3 h-3 rounded border border-[#333] shadow-inner" style={{ background: toColor }} />
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#888888]">
          Apply chip to:
          <button
            className={`px-1.5 py-0.5 rounded border ${chipTarget === 'from' ? 'border-[#00FF9D] text-[#00FF9D]' : 'border-[#333] text-[#888]'}`}
            onClick={() => setChipTarget('from')}
          >
            From
          </button>
          <button
            className={`px-1.5 py-0.5 rounded border ${chipTarget === 'to' ? 'border-[#00FF9D] text-[#00FF9D]' : 'border-[#333] text-[#888]'}`}
            onClick={() => setChipTarget('to')}
          >
            To
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <label className="text-xs text-[#888888] flex flex-col gap-1">
          From
          <input
            type="color"
            value={fromColor}
            onChange={(e) => setFromColor(e.target.value)}
            className="h-8 w-full rounded border border-[#333333] bg-[#121212]"
          />
        </label>
        <label className="text-xs text-[#888888] flex flex-col gap-1">
          To
          <input
            type="color"
            value={toColor}
            onChange={(e) => setToColor(e.target.value)}
            className="h-8 w-full rounded border border-[#333333] bg-[#121212]"
          />
        </label>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (!selectedAsset) return;
            const { updated, replacements } = replaceColor(selectedAsset.data, fromColor, toColor);
            setLastResult({ updated, replacements });
            setPreviewSvg(updated);
          }}
          className="flex-1 px-3 py-2 text-xs rounded border border-[#333333] text-[#E0E0E0] hover:bg-[#1e1e1e] transition-colors"
        >
          Preview
        </button>
        <button
          onClick={() => applyReplacement(previewSvg)}
          className="flex-1 px-3 py-2 text-xs rounded bg-[#00FF9D] text-[#121212] hover:bg-[#00e08a] transition-colors"
        >
          Apply
        </button>
      </div>
      <div className="text-[11px] text-[#888888] mt-2">
        Matches hex, rgb/rgba, and hsl/hsla values (including gradient stops).
      </div>
      {previewSvg && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[#888888]">
          <div>
            <div className="mb-1">Current</div>
            <div className="w-full h-32 bg-[#0a0a0a] border border-[#333] rounded overflow-hidden flex items-center justify-center">
              <div className="max-w-full max-h-full" dangerouslySetInnerHTML={{ __html: selectedAsset.data }} />
            </div>
          </div>
          <div>
            <div className="mb-1">Preview</div>
            <div className="w-full h-32 bg-[#0a0a0a] border border-[#333] rounded overflow-hidden flex items-center justify-center">
              <div className="max-w-full max-h-full" dangerouslySetInnerHTML={{ __html: previewSvg }} />
            </div>
          </div>
        </div>
      )}
      {palette.length > 0 && (
        <div className="mt-3">
          <div className="text-[11px] text-[#888888] mb-1">Palette from SVG</div>
          <div className="flex flex-wrap gap-1">
            {palette.map((color) => (
              <button
                key={color}
                className="w-6 h-6 rounded border border-[#333333]"
                style={{ background: color }}
                title={`Use ${color}`}
                onClick={() => (chipTarget === 'from' ? setFromColor(color) : setToColor(color))}
              />
            ))}
          </div>
        </div>
      )}
      {history.length > 0 && (
        <div className="mt-3">
          <div className="text-[11px] text-[#888888] mb-1">Recent</div>
          <div className="flex flex-wrap gap-1">
            {history.map((color) => (
              <button
                key={color}
                className="w-6 h-6 rounded border border-[#333333]"
                style={{ background: color }}
                title={`Set To ${color}`}
                onClick={() => (chipTarget === 'from' ? setFromColor(color) : setToColor(color))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
