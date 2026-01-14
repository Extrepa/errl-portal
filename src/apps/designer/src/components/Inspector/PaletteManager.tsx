import React, { useState } from 'react';
import { Plus, Trash2, X, Palette, Upload } from 'lucide-react';
import { useStore } from '../../state/useStore';
import { generateId } from '../../utils/helpers';
import type { ColorPalette } from '../../state/types';
import { extractColorsFromSvg } from '../../utils/paletteExtractor';
import { mergeColorsIntoPalette } from '../../utils/paletteMerger';

export const PaletteManager: React.FC = () => {
  const { project, selection, addPalette, updatePalette, removePalette } = useStore();
  const [newPaletteName, setNewPaletteName] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorValue, setNewColorValue] = useState('#000000');

  const palettes = project?.library.palettes || [];
  const selectedAsset = selection.assetId
    ? project?.library.assets.find((a) => a.id === selection.assetId)
    : null;

  const handleCreatePalette = () => {
    if (!newPaletteName.trim()) return;

    const palette: ColorPalette = {
      id: generateId('palette'),
      name: newPaletteName.trim(),
      colors: {},
    };

    addPalette(palette);
    setNewPaletteName('');
  };

  const handleAddColor = (paletteId: string) => {
    if (!newColorName.trim()) return;

    const palette = palettes.find((p) => p.id === paletteId);
    if (!palette) return;

    updatePalette(paletteId, {
      colors: {
        ...palette.colors,
        [newColorName.trim()]: newColorValue,
      },
    });

    setNewColorName('');
    setNewColorValue('#000000');
  };

  const handleUpdateColor = (paletteId: string, colorName: string, newValue: string) => {
    const palette = palettes.find((p) => p.id === paletteId);
    if (!palette) return;

    updatePalette(paletteId, {
      colors: {
        ...palette.colors,
        [colorName]: newValue,
      },
    });
  };

  const handleDeleteColor = (paletteId: string, colorName: string) => {
    const palette = palettes.find((p) => p.id === paletteId);
    if (!palette) return;

    const updatedColors = { ...palette.colors };
    delete updatedColors[colorName];

    updatePalette(paletteId, { colors: updatedColors });
  };

  const createPaletteFromAsset = () => {
    if (!selectedAsset) return;
    const colors = extractColorsFromSvg(selectedAsset.data);
    if (colors.length === 0) return;

    const paletteName = `${selectedAsset.name || 'Asset'} Palette`;
    const palette: ColorPalette = {
      id: generateId('palette'),
      name: paletteName,
      colors: colors.reduce<Record<string, string>>((acc, color, idx) => {
        acc[`color_${idx + 1}`] = color;
        return acc;
      }, {}),
    };

    addPalette(palette);
  };

  const mergeIntoPalette = (paletteId: string) => {
    if (!selectedAsset) return;
    const palette = palettes.find((p) => p.id === paletteId);
    if (!palette) return;

    const colors = extractColorsFromSvg(selectedAsset.data);
    const merged = mergeColorsIntoPalette(palette, colors);
    if (merged !== palette) {
      updatePalette(paletteId, merged);
    }
  };

  return (
    <div className="p-4 border-t border-[#333333]">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-medium text-[#E0E0E0]">Color Palettes</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={newPaletteName}
            onChange={(e) => setNewPaletteName(e.target.value)}
            placeholder="Palette name"
            className="px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0] w-32"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreatePalette();
              }
            }}
          />
          <button
            onClick={handleCreatePalette}
            disabled={!newPaletteName.trim()}
            className="px-2 py-1 text-xs bg-[#00FF9D] text-[#121212] rounded hover:bg-[#00E08C] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Plus size={12} />
            Add
          </button>
          <button
            onClick={createPaletteFromAsset}
            disabled={!selectedAsset}
            className="px-2 py-1 text-xs bg-[#121212] text-[#E0E0E0] rounded border border-[#333333] hover:bg-[#1e1e1e] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            title={selectedAsset ? `Create palette from ${selectedAsset.name}` : 'Select an asset to import colors'}
          >
            <Palette size={12} />
            Import
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {palettes.length === 0 ? (
          <p className="text-xs text-[#666666]">No palettes. Create one to get started.</p>
        ) : (
          palettes.map((palette) => (
            <div key={palette.id} className="p-3 bg-[#121212] rounded border border-[#333333]">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-xs text-[#E0E0E0] font-medium">{palette.name}</h5>
                <div className="flex gap-2">
                  {selectedAsset && (
                    <button
                      onClick={() => mergeIntoPalette(palette.id)}
                      className="p-1 text-[#888888] hover:text-[#00FF9D]"
                      title={`Merge colors from ${selectedAsset.name}`}
                    >
                      <Upload size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => removePalette(palette.id)}
                    className="p-1 text-[#888888] hover:text-red-400"
                    title="Delete palette"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3">
                {Object.entries(palette.colors).map(([colorName, colorValue]) => (
                  <div key={colorName} className="flex flex-col items-center gap-1">
                    <div
                      className="w-full h-12 rounded border border-[#333333] cursor-pointer"
                      style={{ backgroundColor: colorValue }}
                      onClick={() => {
                        navigator.clipboard.writeText(colorValue);
                      }}
                      title={`${colorName}: ${colorValue}`}
                    />
                    <div className="text-[10px] text-[#888888] truncate w-full text-center">
                      {colorName}
                    </div>
                    <div className="flex gap-1">
                      <input
                        type="color"
                        value={colorValue}
                        onChange={(e) => handleUpdateColor(palette.id, colorName, e.target.value)}
                        className="w-4 h-4 rounded border border-[#333333] cursor-pointer"
                        title="Change color"
                      />
                      <button
                        onClick={() => handleDeleteColor(palette.id, colorName)}
                        className="p-0.5 text-[#888888] hover:text-red-400"
                        title="Delete color"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Color name"
                  className="flex-1 px-2 py-1 text-xs bg-[#0a0a0a] border border-[#333333] rounded text-[#E0E0E0]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddColor(palette.id);
                    }
                  }}
                />
                <input
                  type="color"
                  value={newColorValue}
                  onChange={(e) => setNewColorValue(e.target.value)}
                  className="w-8 h-8 rounded border border-[#333333] cursor-pointer"
                />
                <button
                  onClick={() => handleAddColor(palette.id)}
                  disabled={!newColorName.trim()}
                  className="px-2 py-1 text-xs bg-[#00FF9D] text-[#121212] rounded hover:bg-[#00E08C] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 p-3 bg-[#0a0a0a] rounded border border-[#333333]">
        <p className="text-[10px] text-[#666666] mb-1">Usage in SVG:</p>
        <code className="text-[10px] text-[#888888]">
          fill="palette:paletteName_colorName"
        </code>
      </div>
    </div>
  );
};
