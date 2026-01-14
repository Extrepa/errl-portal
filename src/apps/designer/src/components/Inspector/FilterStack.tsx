import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { useStore } from '../../state/useStore';
import type { FilterDefinition } from '../../state/types';

export const FilterStack: React.FC = () => {
  const { selection, project, updateAssetData, updateComponent } = useStore();
  const [filters, setFilters] = useState<FilterDefinition[]>([]);

  // Check if we're working with a component (FX Lab mode) or asset (SVG Edit mode)
  const selectedComponent = selection.componentId
    ? project?.library.components.find((c) => c.id === selection.componentId)
    : null;
  const selectedAsset = selection.assetId
    ? project?.library.assets.find((a) => a.id === selection.assetId)
    : null;

  // Initialize filters from component or asset
  useEffect(() => {
    if (selectedComponent?.filters) {
      setFilters(selectedComponent.filters);
    } else if (selectedAsset) {
      // For assets, filters are applied directly to SVG, so we start empty
      setFilters([]);
    } else {
      setFilters([]);
    }
  }, [selectedComponent?.id, selectedAsset?.id]);

  const addFilter = (type: FilterDefinition['type']) => {
    const newFilter: FilterDefinition = {
      id: `filter-${Date.now()}`,
      type,
      enabled: true,
      params: getDefaultParams(type),
    };
    const updatedFilters = [...filters, newFilter];
    setFilters(updatedFilters);
    
    // Save to component if in FX Lab mode, otherwise apply to asset
    if (selectedComponent) {
      updateComponent(selectedComponent.id, { filters: updatedFilters });
    } else {
      applyFilters(updatedFilters);
    }
  };

  const getDefaultParams = (type: FilterDefinition['type']): Record<string, number | string> => {
    switch (type) {
      case 'blur':
        return { radius: 5 };
      case 'shadow':
        return { offsetX: 2, offsetY: 2, blur: 4, color: '#000000' };
      case 'glow':
        return { radius: 10, color: '#00FF9D', intensity: 0.8 };
      case 'prismatic':
        return { amount: 2 };
      case 'colorMatrix':
        return { matrix: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0' };
      default:
        return {};
    }
  };

  const updateFilter = (id: string, updates: Partial<FilterDefinition>) => {
    const updated = filters.map((f) => (f.id === id ? { ...f, ...updates } : f));
    setFilters(updated);
    
    // Save to component if in FX Lab mode, otherwise apply to asset
    if (selectedComponent) {
      updateComponent(selectedComponent.id, { filters: updated });
    } else {
      applyFilters(updated);
    }
  };

  const removeFilter = (id: string) => {
    const updated = filters.filter((f) => f.id !== id);
    setFilters(updated);
    
    // Save to component if in FX Lab mode, otherwise apply to asset
    if (selectedComponent) {
      updateComponent(selectedComponent.id, { filters: updated.length > 0 ? updated : undefined });
    } else {
      applyFilters(updated);
    }
  };

  const applyFilters = (filterList: FilterDefinition[]) => {
    // For components, filters are stored but not applied directly to asset
    // They will be applied during rendering in SceneRenderer
    if (selectedComponent) {
      return; // Filters are stored on component, applied during render
    }
    
    if (!selectedAsset) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(selectedAsset.data, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (!svg) return;

    // Get or create defs
    let defs = doc.querySelector('defs');
    if (!defs) {
      defs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svg.insertBefore(defs, svg.firstChild);
    }

    // Remove existing filters
    const existingFilters = defs.querySelectorAll('filter');
    existingFilters.forEach((f) => f.remove());

    // Create filter element
    const filterId = `filter-${selectedAsset.id}`;
    const filter = doc.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', filterId);

    // Add filter primitives
    filterList
      .filter((f) => f.enabled)
      .forEach((filterDef) => {
        switch (filterDef.type) {
          case 'blur':
            const blur = doc.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
            blur.setAttribute('stdDeviation', String(filterDef.params.radius || 5));
            filter.appendChild(blur);
            break;

          case 'shadow':
            const shadow = doc.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
            shadow.setAttribute('dx', String(filterDef.params.offsetX || 2));
            shadow.setAttribute('dy', String(filterDef.params.offsetY || 2));
            shadow.setAttribute('stdDeviation', String(filterDef.params.blur || 4));
            shadow.setAttribute('flood-color', String(filterDef.params.color || '#000000'));
            filter.appendChild(shadow);
            break;

          case 'glow':
            // Inner glow using feGaussianBlur and feColorMatrix
            const glowBlur = doc.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
            glowBlur.setAttribute('stdDeviation', String(filterDef.params.radius || 10));
            glowBlur.setAttribute('result', 'coloredBlur');
            filter.appendChild(glowBlur);
            const glowColor = doc.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
            glowColor.setAttribute('type', 'matrix');
            glowColor.setAttribute(
              'values',
              `0 0 0 0 ${hexToRgb(String(filterDef.params.color || '#00FF9D')).r / 255} 0 0 0 0 ${hexToRgb(String(filterDef.params.color || '#00FF9D')).g / 255} 0 0 0 0 ${hexToRgb(String(filterDef.params.color || '#00FF9D')).b / 255} 0 0 0 ${filterDef.params.intensity || 0.8} 0`
            );
            filter.appendChild(glowColor);
            break;

          case 'prismatic':
            // Chromatic aberration using multiple feOffset and feColorMatrix
            const prismOffset1 = doc.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
            prismOffset1.setAttribute('dx', String((filterDef.params.amount as number) || 2));
            prismOffset1.setAttribute('dy', '0');
            prismOffset1.setAttribute('result', 'offset1');
            filter.appendChild(prismOffset1);
            // Additional offsets for RGB separation would go here
            break;

          case 'colorMatrix':
            const colorMatrix = doc.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
            colorMatrix.setAttribute('type', 'matrix');
            colorMatrix.setAttribute('values', String(filterDef.params.matrix || '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0'));
            filter.appendChild(colorMatrix);
            break;
        }
      });

    defs.appendChild(filter);

    // Apply filter to paths
    const paths = doc.querySelectorAll('path, rect, circle, ellipse, polygon');
    paths.forEach((path) => {
      path.setAttribute('filter', `url(#${filterId})`);
    });

    const newSvg = new XMLSerializer().serializeToString(doc);
    updateAssetData(selectedAsset.id, newSvg);
  };

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  if (!selectedAsset) {
    return (
      <div className="p-4 text-sm text-[#888888]">
        Select an asset to apply filters
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#E0E0E0]">Filter Stack</h3>
        <div className="flex gap-1">
          <button
            onClick={() => addFilter('blur')}
            className="px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0] hover:bg-[#2D2D2D]"
            title="Add Blur"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filters.map((filter) => (
          <div
            key={filter.id}
            className="p-2 bg-[#121212] border border-[#333333] rounded"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filter.enabled}
                  onChange={(e) => updateFilter(filter.id, { enabled: e.target.checked })}
                  className="w-3 h-3"
                />
                <span className="text-xs text-[#E0E0E0] capitalize">{filter.type}</span>
              </div>
              <button
                onClick={() => removeFilter(filter.id)}
                className="p-1 text-[#888888] hover:text-red-400"
              >
                <X size={12} />
              </button>
            </div>

            {/* Filter-specific controls */}
            {filter.type === 'blur' && (
              <div>
                <label className="block text-xs text-[#888888] mb-1">
                  Radius: {filter.params.radius}
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={filter.params.radius as number}
                  onChange={(e) =>
                    updateFilter(filter.id, {
                      params: { ...filter.params, radius: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full"
                />
              </div>
            )}

            {filter.type === 'shadow' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-[#888888] mb-1">Offset X</label>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    value={filter.params.offsetX as number}
                    onChange={(e) =>
                      updateFilter(filter.id, {
                        params: { ...filter.params, offsetX: parseFloat(e.target.value) },
                      })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#888888] mb-1">Offset Y</label>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    value={filter.params.offsetY as number}
                    onChange={(e) =>
                      updateFilter(filter.id, {
                        params: { ...filter.params, offsetY: parseFloat(e.target.value) },
                      })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#888888] mb-1">Blur</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={filter.params.blur as number}
                    onChange={(e) =>
                      updateFilter(filter.id, {
                        params: { ...filter.params, blur: parseFloat(e.target.value) },
                      })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#888888] mb-1">Color</label>
                  <input
                    type="color"
                    value={filter.params.color as string}
                    onChange={(e) =>
                      updateFilter(filter.id, {
                        params: { ...filter.params, color: e.target.value },
                      })
                    }
                    className="w-full h-8"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filters.length === 0 && (
        <p className="text-xs text-[#888888] text-center py-4">
          No filters applied. Click + to add a filter.
        </p>
      )}
    </div>
  );
};

