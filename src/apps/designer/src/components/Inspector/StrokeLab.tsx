import React, { useState } from 'react';
import { useStore } from '../../state/useStore';
import { convertStrokeToPath } from '../../utils/strokeAlignment';

export const StrokeLab: React.FC = () => {
  const { selection, project, updateAssetData } = useStore();
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeCap, setStrokeCap] = useState<'butt' | 'round' | 'square'>('round');
  const [strokeJoin, setStrokeJoin] = useState<'miter' | 'round' | 'bevel'>('round');
  const [miterLimit, setMiterLimit] = useState(4);
  const [dashArray, setDashArray] = useState('');
  const [strokeAlignment, setStrokeAlignment] = useState<'inside' | 'center' | 'outside'>('center');

  const selectedAsset = selection.assetId
    ? project?.library.assets.find((a) => a.id === selection.assetId)
    : null;

  const updateStroke = (updates: {
    strokeWidth?: number;
    strokeCap?: 'butt' | 'round' | 'square';
    strokeJoin?: 'miter' | 'round' | 'bevel';
    miterLimit?: number;
    dashArray?: string;
    strokeAlignment?: 'inside' | 'center' | 'outside';
  }) => {
    if (!selectedAsset) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(selectedAsset.data, 'image/svg+xml');
    const path = doc.querySelector('path');
    if (!path) return;

    if (updates.strokeWidth !== undefined) {
      path.setAttribute('stroke-width', updates.strokeWidth.toString());
    }
    if (updates.strokeCap) {
      path.setAttribute('stroke-linecap', updates.strokeCap);
    }
    if (updates.strokeJoin) {
      path.setAttribute('stroke-linejoin', updates.strokeJoin);
    }
    if (updates.miterLimit !== undefined) {
      path.setAttribute('stroke-miterlimit', updates.miterLimit.toString());
    }
    if (updates.dashArray !== undefined) {
      if (updates.dashArray) {
        path.setAttribute('stroke-dasharray', updates.dashArray);
      } else {
        path.removeAttribute('stroke-dasharray');
      }
    }

    const newSvg = new XMLSerializer().serializeToString(doc);
    updateAssetData(selectedAsset.id, newSvg);
  };

  if (!selectedAsset) {
    return (
      <div className="p-4 text-sm text-[#888888]">
        Select an asset to edit stroke properties
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-medium text-[#E0E0E0] mb-4">Stroke & Border Lab</h3>

      {/* Stroke Width */}
      <div>
        <label className="block text-xs text-[#888888] mb-2">
          Stroke Width: {strokeWidth}px
        </label>
        <input
          type="range"
          min="0"
          max="20"
          step="0.5"
          value={strokeWidth}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setStrokeWidth(val);
            updateStroke({ strokeWidth: val });
          }}
          className="w-full"
        />
      </div>

      {/* Stroke Cap */}
      <div>
        <label className="block text-xs text-[#888888] mb-2">Stroke Cap</label>
        <div className="flex gap-2">
          {(['butt', 'round', 'square'] as const).map((cap) => (
            <button
              key={cap}
              onClick={() => {
                setStrokeCap(cap);
                updateStroke({ strokeCap: cap });
              }}
              className={`px-3 py-1 text-xs rounded ${
                strokeCap === cap
                  ? 'bg-[#00FF9D] text-[#000]'
                  : 'bg-[#2D2D2D] text-[#E0E0E0] hover:bg-[#333333]'
              }`}
            >
              {cap.charAt(0).toUpperCase() + cap.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stroke Join */}
      <div>
        <label className="block text-xs text-[#888888] mb-2">Stroke Join</label>
        <div className="flex gap-2">
          {(['miter', 'round', 'bevel'] as const).map((join) => (
            <button
              key={join}
              onClick={() => {
                setStrokeJoin(join);
                updateStroke({ strokeJoin: join });
              }}
              className={`px-3 py-1 text-xs rounded ${
                strokeJoin === join
                  ? 'bg-[#00FF9D] text-[#000]'
                  : 'bg-[#2D2D2D] text-[#E0E0E0] hover:bg-[#333333]'
              }`}
            >
              {join.charAt(0).toUpperCase() + join.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Miter Limit */}
      {strokeJoin === 'miter' && (
        <div>
          <label className="block text-xs text-[#888888] mb-2">
            Miter Limit: {miterLimit}
          </label>
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={miterLimit}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setMiterLimit(val);
              updateStroke({ miterLimit: val });
            }}
            className="w-full"
          />
        </div>
      )}

      {/* Dash Array */}
      <div>
        <label className="block text-xs text-[#888888] mb-2">Dash Array</label>
        <input
          type="text"
          value={dashArray}
          onChange={(e) => {
            setDashArray(e.target.value);
            updateStroke({ dashArray: e.target.value });
          }}
          placeholder="e.g., 5,3,2,3"
          className="w-full px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
        />
        <p className="text-[10px] text-[#666666] mt-1">
          Comma-separated values (e.g., "5,3,2,3")
        </p>
      </div>

      {/* Stroke Alignment */}
      <div>
        <label className="block text-xs text-[#888888] mb-2">Stroke Alignment</label>
        <div className="flex gap-2">
          {(['inside', 'center', 'outside'] as const).map((align) => (
            <button
              key={align}
              onClick={() => {
                setStrokeAlignment(align);
                // Apply stroke alignment conversion if not center
                if (align !== 'center' && selectedAsset) {
                  const parser = new DOMParser();
                  const doc = parser.parseFromString(selectedAsset.data, 'image/svg+xml');
                  const path = doc.querySelector('path');
                  if (path) {
                    const pathData = path.getAttribute('d') || '';
                    const currentStrokeWidth = parseFloat(path.getAttribute('stroke-width') || '2');
                    const convertedPath = convertStrokeToPath(pathData, currentStrokeWidth, align);
                    if (convertedPath !== pathData) {
                      path.setAttribute('d', convertedPath);
                      path.setAttribute('data-stroke-alignment', align);
                      const newSvg = new XMLSerializer().serializeToString(doc);
                      updateAssetData(selectedAsset.id, newSvg);
                    }
                  }
                }
                updateStroke({ strokeAlignment: align });
              }}
              className={`px-3 py-1 text-xs rounded ${
                strokeAlignment === align
                  ? 'bg-[#00FF9D] text-[#000]'
                  : 'bg-[#2D2D2D] text-[#E0E0E0] hover:bg-[#333333]'
              }`}
            >
              {align.charAt(0).toUpperCase() + align.slice(1)}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[#666666] mt-1">
          Note: SVG stroke-alignment requires CSS or path conversion
        </p>
      </div>

      {/* Preview */}
      <div className="mt-4 p-4 bg-[#121212] rounded border border-[#333333]">
        <p className="text-xs text-[#888888] mb-2">Preview</p>
        <svg width="100" height="50" className="border border-[#333333] rounded">
          <path
            d="M 10 25 Q 50 5 90 25"
            fill="none"
            stroke="#00FF9D"
            strokeWidth={strokeWidth}
            strokeLinecap={strokeCap}
            strokeLinejoin={strokeJoin}
            strokeMiterlimit={miterLimit}
            strokeDasharray={dashArray || undefined}
          />
        </svg>
      </div>
    </div>
  );
};

