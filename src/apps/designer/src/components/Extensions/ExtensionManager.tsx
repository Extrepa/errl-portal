import React, { useState } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { getExtensionRegistry } from '../../api/extensionAPI';
import type { Extension } from '../../api/extensionAPI';

export const ExtensionManager: React.FC = () => {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const registry = getExtensionRegistry();

  React.useEffect(() => {
    setExtensions(registry.getAll());
  }, []);

  const handleLoadExtension = () => {
    // In production, this would load from a file or URL
    // For now, show a placeholder
    alert('Extension loading will be implemented. You can register extensions programmatically.');
  };

  const handleRemoveExtension = (id: string) => {
    registry.unregister(id);
    setExtensions(registry.getAll());
  };

  return (
    <div className="p-4 border-t border-[#333333]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-[#00FF9D]" />
          <h4 className="text-xs font-medium text-[#E0E0E0]">Extensions</h4>
        </div>
        <button
          onClick={handleLoadExtension}
          className="px-2 py-1 text-xs bg-[#00FF9D] text-[#121212] rounded hover:bg-[#00E08C] flex items-center gap-1"
        >
          <Plus size={12} />
          Load
        </button>
      </div>

      <div className="space-y-2">
        {extensions.length === 0 ? (
          <p className="text-xs text-[#666666]">No extensions loaded</p>
        ) : (
          extensions.map((ext) => (
            <div
              key={ext.id}
              className="flex items-center justify-between p-2 bg-[#121212] rounded border border-[#333333]"
            >
              <div>
                <div className="text-xs text-[#E0E0E0] font-medium">{ext.name}</div>
                <div className="text-[10px] text-[#888888]">v{ext.version}</div>
              </div>
              <button
                onClick={() => handleRemoveExtension(ext.id)}
                className="p-1 text-[#888888] hover:text-red-400"
                title="Remove extension"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 p-3 bg-[#0a0a0a] rounded border border-[#333333]">
        <p className="text-[10px] text-[#666666] mb-1">Extension API:</p>
        <code className="text-[10px] text-[#888888]">
          {`registerExtension({ id, name, version, hooks })`}
        </code>
      </div>
    </div>
  );
};

