import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { saveTemplate, type TemplateType } from '../../utils/templateManager';

interface TemplateSaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string) => void;
  type: TemplateType;
  data: any;
  defaultName?: string;
}

export const TemplateSaveDialog: React.FC<TemplateSaveDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  type,
  data,
  defaultName = '',
}) => {
  const [name, setName] = useState(defaultName);
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync defaultName prop to state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setName(defaultName);
    }
  }, [defaultName, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a name');
      return;
    }

    setIsSaving(true);
    try {
      const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
      const id = await saveTemplate(name.trim(), type, data, tagArray);
      onSave(id);
      onClose();
      setName('');
      setTags('');
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4 w-[400px] max-w-[90vw]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-[#E0E0E0]">Save Template</h3>
          <button
            onClick={onClose}
            className="p-1 text-[#888888] hover:text-[#E0E0E0]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#888888] block mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`${type} template name`}
              className="w-full px-3 py-2 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
            />
          </div>

          <div>
            <label className="text-xs text-[#888888] block mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
              className="w-full px-3 py-2 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs bg-[#2D2D2D] text-[#E0E0E0] rounded hover:bg-[#3D3D3D]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="px-4 py-2 text-xs bg-[#00FF9D] text-[#121212] rounded hover:bg-[#00E08C] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save size={14} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

