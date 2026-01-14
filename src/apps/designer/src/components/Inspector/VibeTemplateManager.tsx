import React, { useState } from 'react';
import { Save, X, Tag } from 'lucide-react';
import { useStore } from '../../state/useStore';
import type { VibeTemplate } from '../../state/types';
import { generateId } from '../../utils/helpers';

export const VibeTemplateManager: React.FC = () => {
  const { project, addVibeTemplate, removeVibeTemplate, updateComponent, selection } = useStore();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateTags, setTemplateTags] = useState('');
  
  const selectedComponentId = selection.componentId;

  const templates = project?.library.vibe_templates || [];

  const handleSaveTemplate = () => {
    if (!selectedComponentId || !project) return;

    const component = project.library.components.find((c) => c.id === selectedComponentId);
    if (!component || !component.vibe) return;

    const newTemplate: VibeTemplate = {
      id: generateId('vibe_template'),
      name: templateName || `Template ${templates.length + 1}`,
      vibe: component.vibe,
      tags: templateTags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
    };

    addVibeTemplate(newTemplate);
    setShowSaveDialog(false);
    setTemplateName('');
    setTemplateTags('');
  };

  const handleApplyTemplate = (template: VibeTemplate) => {
    if (!selectedComponentId) return;
    updateComponent(selectedComponentId, { vibe: template.vibe });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#E0E0E0]">Vibe Templates</h3>
        {selectedComponentId && (
          <button
            onClick={() => setShowSaveDialog(true)}
            className="px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0] hover:bg-[#2D2D2D] flex items-center gap-1"
          >
            <Save size={12} />
            Save Current
          </button>
        )}
      </div>

      {showSaveDialog && (
        <div className="mb-4 p-3 bg-[#121212] border border-[#333333] rounded">
          <div className="mb-2">
            <label className="text-xs text-[#888888] block mb-1">Template Name</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full px-2 py-1 text-xs bg-[#0a0a0a] border border-[#333333] rounded text-[#E0E0E0]"
              placeholder="Enter template name"
            />
          </div>
          <div className="mb-2">
            <label className="text-xs text-[#888888] block mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={templateTags}
              onChange={(e) => setTemplateTags(e.target.value)}
              className="w-full px-2 py-1 text-xs bg-[#0a0a0a] border border-[#333333] rounded text-[#E0E0E0]"
              placeholder="e.g., pulse, glow, animation"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveTemplate}
              className="flex-1 px-2 py-1 text-xs bg-[#00FF9D] text-[#121212] rounded hover:bg-[#00E08A]"
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowSaveDialog(false);
                setTemplateName('');
                setTemplateTags('');
              }}
              className="px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0] hover:bg-[#2D2D2D]"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {templates.length === 0 ? (
          <p className="text-xs text-[#888888]">No templates saved yet</p>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="p-2 bg-[#121212] border border-[#333333] rounded flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="text-xs text-[#E0E0E0]">{template.name}</div>
                {template.tags && template.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Tag size={10} className="text-[#888888]" />
                    <div className="flex gap-1 flex-wrap">
                      {template.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] text-[#888888] bg-[#0a0a0a] px-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleApplyTemplate(template)}
                className="px-2 py-1 text-xs bg-[#2D2D2D] border border-[#333333] rounded text-[#E0E0E0] hover:bg-[#3D3D3D]"
              >
                Apply
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
