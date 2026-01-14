import React, { useState, useEffect } from 'react';
import { Type } from 'lucide-react';
import { useStore } from '../../state/useStore';
import {
  loadDesignTokens,
  saveDesignTokens,
  addTypographyToken,
  updateTypographyToken,
  deleteTypographyToken,
  applyTypographyTokenToText,
  type TypographyToken,
} from '../../utils/designTokens';

export const TypographyPanel: React.FC = () => {
  const { selection, project, updateAsset, updateAssetData } = useStore();
  const [tokens, setTokens] = useState<TypographyToken[]>([]);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [editingToken, setEditingToken] = useState<TypographyToken | null>(null);

  const selectedAsset = selection.assetId
    ? project?.library.assets.find((a) => a.id === selection.assetId)
    : null;

  useEffect(() => {
    const designTokens = loadDesignTokens();
    setTokens(designTokens.typography);
  }, []);

  const handleApplyToken = (token: TypographyToken) => {
    if (!selectedAsset || selectedAsset.type !== 'svg') return;

    const updated = applyTypographyTokenToText(selectedAsset.data, token);
    updateAssetData(selectedAsset.id, updated);
  };

  const handleSaveToken = () => {
    if (!editingToken) return;

    if (editingToken.id && tokens.find((t) => t.id === editingToken.id)) {
      updateTypographyToken(editingToken.id, editingToken);
    } else {
      addTypographyToken({
        ...editingToken,
        id: editingToken.id || `token_${Date.now()}`,
      });
    }

    const designTokens = loadDesignTokens();
    setTokens(designTokens.typography);
    setEditingToken(null);
  };

  return (
    <div className="p-4 border-t border-[#333333]">
      <div className="flex items-center gap-2 mb-4">
        <Type size={16} className="text-[#00FF9D]" />
        <h4 className="text-xs font-medium text-[#E0E0E0]">Typography</h4>
      </div>

      {/* Token List */}
      <div className="mb-4 space-y-2 max-h-[200px] overflow-y-auto">
        {tokens.map((token) => (
          <div
            key={token.id}
            className="p-2 bg-[#1A1A1A] border border-[#333333] rounded hover:border-[#00FF9D]/50"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-medium text-[#E0E0E0]">{token.name}</div>
              <div className="flex gap-1">
                {selectedAsset && selectedAsset.type === 'svg' && (
                  <button
                    onClick={() => handleApplyToken(token)}
                    className="px-2 py-1 text-[10px] bg-[#00FF9D] text-[#121212] rounded hover:bg-[#00E08C]"
                  >
                    Apply
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingToken(token);
                    setSelectedToken(token.id);
                  }}
                  className="px-2 py-1 text-[10px] bg-[#121212] border border-[#333333] text-[#888888] rounded hover:bg-[#2D2D2D]"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this token?')) {
                      deleteTypographyToken(token.id);
                      const designTokens = loadDesignTokens();
                      setTokens(designTokens.typography);
                    }
                  }}
                  className="px-2 py-1 text-[10px] bg-[#121212] border border-[#333333] text-red-400 rounded hover:bg-[#2D2D2D]"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="text-[10px] text-[#666666]">
              {token.fontSize}px / {token.fontWeight} / {token.lineHeight}lh
            </div>
          </div>
        ))}
      </div>

      {/* Token Editor */}
      {editingToken && (
        <div className="mb-4 p-3 bg-[#1A1A1A] border border-[#333333] rounded">
          <div className="text-xs font-medium text-[#E0E0E0] mb-3">
            {editingToken.id && tokens.find((t) => t.id === editingToken.id) ? 'Edit Token' : 'New Token'}
          </div>
          <div className="space-y-2">
            <input
              type="text"
              value={editingToken.name}
              onChange={(e) => setEditingToken({ ...editingToken, name: e.target.value })}
              placeholder="Token name"
              className="w-full px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={editingToken.fontSize || ''}
                onChange={(e) => setEditingToken({ ...editingToken, fontSize: parseFloat(e.target.value) || undefined })}
                placeholder="Font size"
                className="w-full px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
              />
              <input
                type="text"
                value={editingToken.fontWeight?.toString() || ''}
                onChange={(e) => setEditingToken({ ...editingToken, fontWeight: e.target.value })}
                placeholder="Font weight"
                className="w-full px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.1"
                value={editingToken.lineHeight || ''}
                onChange={(e) => setEditingToken({ ...editingToken, lineHeight: parseFloat(e.target.value) || undefined })}
                placeholder="Line height"
                className="w-full px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
              />
              <input
                type="number"
                step="0.1"
                value={editingToken.letterSpacing || ''}
                onChange={(e) => setEditingToken({ ...editingToken, letterSpacing: parseFloat(e.target.value) || undefined })}
                placeholder="Letter spacing"
                className="w-full px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveToken}
                className="flex-1 px-3 py-1.5 text-xs bg-[#00FF9D] text-[#121212] rounded hover:bg-[#00E08C]"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingToken(null);
                  setSelectedToken(null);
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-[#121212] border border-[#333333] text-[#888888] rounded hover:bg-[#2D2D2D]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Token */}
      {!editingToken && (
        <button
          onClick={() => setEditingToken({ id: '', name: 'New Token', fontSize: 16, fontWeight: 400, lineHeight: 1.5 })}
          className="w-full px-4 py-2 text-xs bg-[#7000FF] text-white rounded hover:bg-[#6000E0]"
        >
          Add Typography Token
        </button>
      )}
    </div>
  );
};

