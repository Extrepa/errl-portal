import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { useStore } from '../../state/useStore';
import {
  countPaths,
  countPoints,
  getBoundingBox,
  calculatePathLength,
} from '../../utils/measurementUtils';

export const StatisticsPanel: React.FC = () => {
  const { selection, project } = useStore();

  const selectedAsset = selection.assetId
    ? project?.library.assets.find((a) => a.id === selection.assetId)
    : null;

  const stats = useMemo(() => {
    if (!selectedAsset || selectedAsset.type !== 'svg') {
      return null;
    }

    try {
      const pathCount = countPaths(selectedAsset.data);
      const pointCount = countPoints(selectedAsset.data);
      const bbox = getBoundingBox(selectedAsset.data);
      
      // Create parser once and reuse
      const parser = new DOMParser();
      const doc = parser.parseFromString(selectedAsset.data, 'image/svg+xml');
      
      const totalLength = Array.from(doc.querySelectorAll('path'))
        .reduce((sum, path) => {
          const d = path.getAttribute('d') || '';
          return sum + calculatePathLength(d);
        }, 0);

      // Extract fill and stroke colors (reuse same doc)
      const firstPath = doc.querySelector('path');
      const fill = firstPath?.getAttribute('fill') || 'none';
      const stroke = firstPath?.getAttribute('stroke') || 'none';
      const strokeWidth = firstPath?.getAttribute('stroke-width') || '0';

      return {
        pathCount,
        pointCount,
        bbox,
        totalLength,
        fill,
        stroke,
        strokeWidth,
      };
    } catch {
      return null;
    }
  }, [selectedAsset]);

  if (!selectedAsset || selectedAsset.type !== 'svg') {
    return (
      <div className="p-4 border-t border-[#333333]">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={16} className="text-[#00FF9D]" />
          <h4 className="text-xs font-medium text-[#E0E0E0]">Statistics</h4>
        </div>
        <p className="text-xs text-[#888888]">Select an SVG asset to view statistics</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-4 border-t border-[#333333]">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={16} className="text-[#00FF9D]" />
          <h4 className="text-xs font-medium text-[#E0E0E0]">Statistics</h4>
        </div>
        <p className="text-xs text-[#888888]">Failed to calculate statistics</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-[#333333]">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={16} className="text-[#00FF9D]" />
        <h4 className="text-xs font-medium text-[#E0E0E0]">Statistics</h4>
      </div>

      <div className="space-y-3 text-xs">
        {/* Path Statistics */}
        <div>
          <div className="text-[#888888] mb-1">Paths</div>
          <div className="text-[#E0E0E0] font-mono">{stats.pathCount}</div>
        </div>

        <div>
          <div className="text-[#888888] mb-1">Points</div>
          <div className="text-[#E0E0E0] font-mono">{stats.pointCount}</div>
        </div>

        <div>
          <div className="text-[#888888] mb-1">Total Path Length</div>
          <div className="text-[#E0E0E0] font-mono">{stats.totalLength.toFixed(2)}px</div>
        </div>

        {/* Bounding Box */}
        {stats.bbox && (
          <div>
            <div className="text-[#888888] mb-1">Bounding Box</div>
            <div className="space-y-1 font-mono text-[#E0E0E0]">
              <div>W: {stats.bbox.width.toFixed(2)}px</div>
              <div>H: {stats.bbox.height.toFixed(2)}px</div>
              <div>X: {stats.bbox.x.toFixed(2)}px</div>
              <div>Y: {stats.bbox.y.toFixed(2)}px</div>
            </div>
          </div>
        )}

        {/* Color Info */}
        <div>
          <div className="text-[#888888] mb-1">Colors</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 border border-[#333333] rounded"
                style={{ backgroundColor: stats.fill !== 'none' ? stats.fill : 'transparent' }}
              />
              <span className="text-[#E0E0E0] font-mono text-[10px]">
                Fill: {stats.fill}
              </span>
            </div>
            {stats.stroke !== 'none' && (
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 border border-[#333333] rounded"
                  style={{ backgroundColor: stats.stroke }}
                />
                <span className="text-[#E0E0E0] font-mono text-[10px]">
                  Stroke: {stats.stroke} ({stats.strokeWidth}px)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

