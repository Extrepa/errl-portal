import React, { useState, useEffect } from 'react';
import { FileText, Search, X, Tag } from 'lucide-react';
import { useStore } from '../../state/useStore';
import { generateId } from '../../utils/helpers';
import {
  loadTemplates,
  deleteTemplate,
  searchTemplates,
  getTemplatesByType,
  type Template,
  type TemplateType,
} from '../../utils/templateManager';

export const TemplateBrowser: React.FC<{ type?: TemplateType; onSelect?: (template: Template) => void }> = ({
  type,
  onSelect,
}) => {
  const { project, selection, addAsset, updateComponent, loadProject } = useStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TemplateType | 'all'>(type || 'all');

  useEffect(() => {
    refreshTemplates();
  }, [selectedType]);

  const refreshTemplates = () => {
    let allTemplates = loadTemplates();
    if (selectedType !== 'all') {
      allTemplates = getTemplatesByType(selectedType);
    }
    if (searchQuery) {
      allTemplates = searchTemplates(searchQuery, selectedType !== 'all' ? selectedType : undefined);
    }
    setTemplates(allTemplates);
  };

  useEffect(() => {
    if (searchQuery) {
      refreshTemplates();
    } else {
      refreshTemplates();
    }
  }, [searchQuery, selectedType]);

  const handleDelete = (id: string) => {
    if (confirm('Delete this template?')) {
      deleteTemplate(id);
      refreshTemplates();
    }
  };

  const handleLoad = (template: Template) => {
    if (onSelect) {
      onSelect(template);
      return;
    }

    // Load template based on type
    if (!project) return;

    try {
      if (template.type === 'svg') {
        // Create new asset from SVG template
        const newAsset = {
          id: generateId('asset'),
          name: `${template.name} (Template)`,
          type: 'svg' as const,
          data: template.data,
        };
        addAsset(newAsset);
      } else if (template.type === 'scene') {
        // Load scene template into current project
        if (template.data && template.data.layers) {
          loadProject({
            ...project,
            scene: {
              ...project.scene,
              layers: template.data.layers || project.scene.layers,
              background: template.data.background || project.scene.background,
              groups: template.data.groups || project.scene.groups,
            },
          });
        }
      } else if (template.type === 'vibe') {
        // Apply vibe template to selected component
        if (selection.componentId) {
          updateComponent(selection.componentId, { vibe: template.data });
        } else {
          alert('Please select a component to apply the vibe template.');
        }
      }
    } catch (error) {
      console.error('Failed to load template:', error);
      alert(`Failed to load template: ${template.name}`);
    }
  };

  return (
    <div className="p-4 border-t border-[#333333]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-[#00FF9D]" />
          <h4 className="text-xs font-medium text-[#E0E0E0]">Templates</h4>
        </div>
      </div>

      {/* Type Filter */}
      <div className="mb-3 flex gap-1">
        {(['all', 'svg', 'scene', 'vibe'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-2 py-1 text-xs rounded ${
              selectedType === t
                ? 'bg-[#00FF9D] text-[#121212]'
                : 'bg-[#121212] text-[#888888] hover:bg-[#2D2D2D]'
            }`}
          >
            {t === 'all' ? 'All' : t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#888888]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates..."
          className="w-full pl-8 pr-2 py-1.5 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#888888] hover:text-[#E0E0E0]"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Template List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {templates.length === 0 ? (
          <div className="text-xs text-[#888888] text-center py-8">
            No templates found
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="p-3 bg-[#1A1A1A] border border-[#333333] rounded hover:border-[#00FF9D]/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-xs font-medium text-[#E0E0E0] mb-1">{template.name}</div>
                  <div className="text-[10px] text-[#666666] uppercase">{template.type}</div>
                </div>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="p-1 text-[#666666] hover:text-red-400"
                  title="Delete"
                >
                  <X size={12} />
                </button>
              </div>

              {/* Tags */}
              {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#121212] border border-[#333333] rounded text-[10px] text-[#888888]"
                    >
                      <Tag size={8} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Thumbnail */}
              {template.thumbnail && (
                <div className="mb-2 w-full h-20 bg-[#121212] border border-[#333333] rounded overflow-hidden">
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleLoad(template)}
                  className="flex-1 px-2 py-1 text-xs bg-[#00FF9D] text-[#121212] rounded hover:bg-[#00E08C]"
                >
                  Load
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

