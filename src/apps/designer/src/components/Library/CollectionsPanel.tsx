import React, { useState, useEffect } from 'react';
import { Folder, Share2, Copy, X, Plus, Search } from 'lucide-react';
import {
  loadCollections,
  createCollection,
  deleteCollection,
  enableCollectionSharing,
  disableCollectionSharing,
  searchCollections,
  type Collection,
} from '../../utils/collections';
import { useStore } from '../../state/useStore';

export const CollectionsPanel: React.FC = () => {
  const { project } = useStore();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const refreshCollections = React.useCallback(() => {
    if (searchQuery) {
      setCollections(searchCollections(searchQuery));
    } else {
      setCollections(loadCollections());
    }
  }, [searchQuery]);

  useEffect(() => {
    refreshCollections();
  }, [refreshCollections]);

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;

    // Store project identifier using project name if available
    const projectId = project ? project.meta.name : '';
    const projectIds = projectId ? [projectId] : [];
    const collectionId = createCollection(newCollectionName.trim(), '', projectIds);
    refreshCollections();
    setNewCollectionName('');
    setShowCreateDialog(false);
  };

  const handleShare = (collection: Collection) => {
    if (collection.shareable && collection.shareUrl) {
      // Copy to clipboard
      navigator.clipboard.writeText(collection.shareUrl);
      alert('Share URL copied to clipboard!');
    } else {
      const shareUrl = enableCollectionSharing(collection.id);
      if (shareUrl) {
        navigator.clipboard.writeText(shareUrl);
        alert('Share URL generated and copied to clipboard!');
        refreshCollections();
      }
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this collection?')) {
      deleteCollection(id);
      refreshCollections();
    }
  };

  return (
    <div className="p-4 border-t border-[#333333]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Folder size={16} className="text-[#00FF9D]" />
          <h4 className="text-xs font-medium text-[#E0E0E0]">Collections</h4>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="p-1.5 rounded bg-[#00FF9D] text-[#121212] hover:bg-[#00E08A]"
          title="New Collection"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#888888]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search collections..."
          className="w-full pl-8 pr-2 py-1.5 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
        />
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <div className="mb-4 p-3 bg-[#1A1A1A] border border-[#333333] rounded">
          <input
            type="text"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="Collection name"
            className="w-full px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0] mb-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateCollection();
              }
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateCollection}
              className="flex-1 px-3 py-1 text-xs bg-[#00FF9D] text-[#121212] rounded hover:bg-[#00E08C]"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowCreateDialog(false);
                setNewCollectionName('');
              }}
              className="flex-1 px-3 py-1 text-xs bg-[#121212] border border-[#333333] text-[#888888] rounded hover:bg-[#2D2D2D]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Collection List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {collections.length === 0 ? (
          <div className="text-xs text-[#888888] text-center py-8">
            No collections found
          </div>
        ) : (
          collections.map((collection) => (
            <div
              key={collection.id}
              className="p-3 bg-[#1A1A1A] border border-[#333333] rounded hover:border-[#00FF9D]/50"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-xs font-medium text-[#E0E0E0] mb-1">{collection.name}</div>
                  {collection.description && (
                    <div className="text-[10px] text-[#666666] mb-1">{collection.description}</div>
                  )}
                  <div className="text-[10px] text-[#666666]">
                    {collection.projectIds.length} project{collection.projectIds.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleShare(collection)}
                    className={`p-1.5 rounded ${
                      collection.shareable
                        ? 'bg-[#00FF9D] text-[#121212]'
                        : 'bg-[#121212] border border-[#333333] text-[#888888] hover:bg-[#2D2D2D]'
                    }`}
                    title={collection.shareable ? 'Copy share URL' : 'Enable sharing'}
                  >
                    <Share2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(collection.id)}
                    className="p-1.5 rounded bg-[#121212] border border-[#333333] text-red-400 hover:bg-[#2D2D2D]"
                    title="Delete"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              {/* Tags */}
              {collection.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {collection.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-[#121212] border border-[#333333] rounded text-[10px] text-[#888888]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Share URL */}
              {collection.shareable && collection.shareUrl && (
                <div className="mt-2 p-2 bg-[#121212] rounded border border-[#333333]">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={collection.shareUrl}
                      readOnly
                      className="flex-1 px-2 py-1 text-[10px] bg-[#0A0A0A] border border-[#333333] rounded text-[#888888] font-mono"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(collection.shareUrl!);
                        alert('URL copied!');
                      }}
                      className="p-1 text-[#888888] hover:text-[#E0E0E0]"
                      title="Copy URL"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

