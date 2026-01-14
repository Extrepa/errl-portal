import React, { useState } from 'react';
import { useStore } from '../../state/useStore';
import { VibePresets } from '../../engine/vibeLogic';
import { VibeTemplateManager } from './VibeTemplateManager';
import { AudioReactivePanel } from './AudioReactivePanel';
import { LogicInspector } from './LogicInspector';
import { StateMachineEditor } from './StateMachineEditor';
import { AITraceTool } from '../Tools/AITraceTool';
import { FilterStack } from './FilterStack';
import { TimelinePanel } from './TimelinePanel';
import type { VibeConfig } from '../../state/types';

export const FXInspector: React.FC = () => {
  const { selection, project, updateComponent, setSelection } = useStore();
  const [activeVibes, setActiveVibes] = useState<string[]>([]);

  // Get selected component (FX Lab works with components, not raw assets)
  const selectedComponent = selection.componentId 
    ? project?.library.components.find(c => c.id === selection.componentId)
    : null;

  // Get the base asset for reference
  const baseAsset = selectedComponent 
    ? project?.library.assets.find(a => a.id === selectedComponent.base_asset)
    : null;

  const vibeTypes = ['pulse', 'glow', 'float', 'shake', 'rotation'];
  
  // Initialize active vibes from component
  React.useEffect(() => {
    if (selectedComponent?.vibe?.type) {
      setActiveVibes([selectedComponent.vibe.type]);
    } else {
      setActiveVibes([]);
    }
  }, [selectedComponent?.id, selectedComponent?.vibe?.type]);

  // Auto-apply templates based on tags
  React.useEffect(() => {
    if (!selectedComponent || !project || selectedComponent.vibe) return; // Don't override existing vibe
    
    const templates = project.library.vibe_templates || [];
    const componentTags = selectedComponent.tags || [];
    
    // Find template with matching tags
    const matchingTemplate = templates.find((template) => {
      if (!template.tags || template.tags.length === 0) return false;
      return template.tags.some((tag) => componentTags.includes(tag));
    });
    
    if (matchingTemplate) {
      updateComponent(selectedComponent.id, { vibe: matchingTemplate.vibe });
    }
  }, [selectedComponent?.id, selectedComponent?.tags, project?.library.vibe_templates, updateComponent]);

  const addVibe = (vibeType: string) => {
    if (!selectedComponent || activeVibes.includes(vibeType)) return;
    
    setActiveVibes([...activeVibes, vibeType]);
    // Update component with vibe
    const vibeConfig: VibeConfig = {
      type: vibeType as any,
      intensity: 0.5,
      speed: 1,
    };
    updateComponent(selectedComponent.id, { vibe: vibeConfig });
  };

  const removeVibe = (vibeType: string) => {
    if (!selectedComponent) return;
    
    const newActiveVibes = activeVibes.filter(v => v !== vibeType);
    setActiveVibes(newActiveVibes);
    if (newActiveVibes.length === 0) {
      updateComponent(selectedComponent.id, { vibe: undefined });
    } else if (selectedComponent.vibe && selectedComponent.vibe.type === vibeType) {
      // If removing the active vibe, update to the first remaining vibe
      const nextVibe: VibeConfig = {
        type: newActiveVibes[0] as any,
        intensity: 0.5,
        speed: 1,
      };
      updateComponent(selectedComponent.id, { vibe: nextVibe });
    }
  };

  const applyPreset = (presetName: keyof typeof VibePresets) => {
    if (!selectedComponent) return;
    
    const preset = VibePresets[presetName];
    updateComponent(selectedComponent.id, { vibe: preset });
    setActiveVibes([preset.type || 'pulse']);
  };

  if (!selectedComponent) {
    return (
      <div className="p-4">
        <p className="text-xs text-[#888888]">No component selected</p>
        <p className="text-xs text-[#666666] mt-2">
          Select a component from the library to adjust its parameters and styling
        </p>
      </div>
    );
  }

  if (!baseAsset) {
    return (
      <div className="p-4">
        <p className="text-xs text-[#888888]">Base asset not found</p>
      </div>
    );
  }

  // Use component.vibe instead of asset.fx
  const componentVibe = selectedComponent.vibe;

  const hasChildren = selectedComponent.children && selectedComponent.children.length > 0;
  const handleDiveIn = () => {
    if (hasChildren && selectedComponent.children) {
      // Select the first child component/asset for editing
      const firstChildId = selectedComponent.children[0];
      const childComponent = project?.library.components.find(c => c.id === firstChildId);
      const childAsset = project?.library.assets.find(a => a.id === firstChildId);
      
      if (childComponent) {
        setSelection({ componentId: childComponent.id });
      } else if (childAsset) {
        setSelection({ assetId: childAsset.id });
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-[#E0E0E0]">FX Lab</h3>
        {hasChildren && (
          <button
            onClick={handleDiveIn}
            className="px-2 py-1 text-xs bg-[#00FF9D] text-[#121212] rounded hover:bg-[#00E08C]"
            title="Dive into nested component"
          >
            Dive In
          </button>
        )}
      </div>
      <p className="text-xs text-[#888888] mb-4">
        Component: {selectedComponent.name}
        {hasChildren && ` (${selectedComponent.children?.length} children)`}
      </p>

      {/* Vibe Selector */}
      <div className="mb-4">
        <label className="text-xs text-[#888888] block mb-2">Add Vibe</label>
        <select
          className="w-full px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
          onChange={(e) => {
            if (e.target.value) {
              addVibe(e.target.value);
              e.target.value = '';
            }
          }}
        >
          <option value="">Select a vibe...</option>
          {vibeTypes.map(vibe => (
            <option key={vibe} value={vibe}>{vibe.charAt(0).toUpperCase() + vibe.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Active Vibes */}
      <div className="space-y-3">
        {activeVibes.map(vibe => (
          <div key={vibe} className="p-3 bg-[#121212] rounded border border-[#333333]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#E0E0E0] capitalize">{vibe}</span>
              <button
                onClick={() => removeVibe(vibe)}
                className="text-xs text-[#888888] hover:text-[#E0E0E0]"
              >
                Remove
              </button>
            </div>
            {vibe === 'pulse' && (
              <>
                <div className="mb-2">
                  <label className="text-xs text-[#888888] block mb-1">
                    Intensity: {componentVibe?.intensity?.toFixed(1) || '0.5'}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={componentVibe?.intensity || 0.5}
                    onChange={(e) => {
                      const newVibe: VibeConfig = {
                        ...componentVibe,
                        type: 'pulse',
                        intensity: parseFloat(e.target.value),
                        speed: componentVibe?.speed || 1,
                      };
                      updateComponent(selectedComponent.id, { vibe: newVibe });
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#888888] block mb-1">
                    Speed: {componentVibe?.speed?.toFixed(1) || '1.0'}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={componentVibe?.speed || 1}
                    onChange={(e) => {
                      const newVibe: VibeConfig = {
                        ...componentVibe,
                        type: 'pulse',
                        intensity: componentVibe?.intensity || 0.5,
                        speed: parseFloat(e.target.value),
                      };
                      updateComponent(selectedComponent.id, { vibe: newVibe });
                    }}
                    className="w-full"
                  />
                </div>
              </>
            )}
            {vibe === 'glow' && (
              <>
                <div className="mb-2">
                  <label className="text-xs text-[#888888] block mb-1">Color</label>
                  <input
                    type="color"
                    className="w-full h-8 rounded border border-[#333333] bg-[#121212]"
                    value={componentVibe?.color || '#00FF9D'}
                    onChange={(e) => {
                      const newVibe: VibeConfig = {
                        ...componentVibe,
                        type: 'glow',
                        color: e.target.value,
                        radius: componentVibe?.radius || 10,
                      };
                      updateComponent(selectedComponent.id, { vibe: newVibe });
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs text-[#888888] block mb-1">
                    Radius: {componentVibe?.radius || 10}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={componentVibe?.radius || 10}
                    onChange={(e) => {
                      const newVibe: VibeConfig = {
                        ...componentVibe,
                        type: 'glow',
                        color: componentVibe?.color || '#00FF9D',
                        radius: parseInt(e.target.value),
                      };
                      updateComponent(selectedComponent.id, { vibe: newVibe });
                    }}
                    className="w-full"
                  />
                </div>
              </>
            )}
            {vibe === 'float' && (
              <div>
                <label className="text-xs text-[#888888] block mb-1">
                  Amplitude: {componentVibe?.amplitude || 10}
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={componentVibe?.amplitude || 10}
                  onChange={(e) => {
                    const newVibe: VibeConfig = {
                      ...componentVibe,
                      type: 'float',
                      amplitude: parseInt(e.target.value),
                      frequency: componentVibe?.frequency || 1,
                    };
                    updateComponent(selectedComponent.id, { vibe: newVibe });
                  }}
                  className="w-full"
                />
              </div>
            )}
            {vibe === 'shake' && (
              <>
                <div className="mb-2">
                  <label className="text-xs text-[#888888] block mb-1">
                    Intensity: {componentVibe?.intensity || 5}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={componentVibe?.intensity || 5}
                    onChange={(e) => {
                      const newVibe: VibeConfig = {
                        ...componentVibe,
                        type: 'shake',
                        intensity: parseInt(e.target.value),
                        speed: componentVibe?.speed || 1,
                      };
                      updateComponent(selectedComponent.id, { vibe: newVibe });
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#888888] block mb-1">
                    Speed: {componentVibe?.speed?.toFixed(1) || '1.0'}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={componentVibe?.speed || 1}
                    onChange={(e) => {
                      const newVibe: VibeConfig = {
                        ...componentVibe,
                        type: 'shake',
                        intensity: componentVibe?.intensity || 5,
                        speed: parseFloat(e.target.value),
                      };
                      updateComponent(selectedComponent.id, { vibe: newVibe });
                    }}
                    className="w-full"
                  />
                </div>
              </>
            )}
            {vibe === 'rotation' && (
              <div>
                <label className="text-xs text-[#888888] block mb-1">
                  Speed: {componentVibe?.speed?.toFixed(1) || '1.0'}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={componentVibe?.speed || 1}
                  onChange={(e) => {
                    const newVibe: VibeConfig = {
                      ...componentVibe,
                      type: 'rotation',
                      speed: parseFloat(e.target.value),
                    };
                    updateComponent(selectedComponent.id, { vibe: newVibe });
                  }}
                  className="w-full"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Presets */}
      <div className="mt-4">
        <label className="text-xs text-[#888888] block mb-2">Presets</label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(VibePresets) as Array<keyof typeof VibePresets>).map(preset => (
            <button
              key={preset}
              onClick={() => applyPreset(preset)}
              className="px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0] hover:bg-[#2D2D2D] capitalize"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Nested Components */}
      <div className="mt-6 pt-6 border-t border-[#333333]">
        <h4 className="text-xs font-medium text-[#E0E0E0] mb-2">Nested Components</h4>
        <p className="text-xs text-[#888888] mb-3">
          Add child components or assets to create nested structures
        </p>
        <div className="space-y-2 mb-3">
          {selectedComponent.children && selectedComponent.children.length > 0 ? (
            selectedComponent.children.map((childId) => {
              const childComponent = project?.library.components.find(c => c.id === childId);
              const childAsset = project?.library.assets.find(a => a.id === childId);
              const childName = childComponent?.name || childAsset?.name || childId;
              return (
                <div key={childId} className="flex items-center justify-between p-2 bg-[#121212] rounded border border-[#333333]">
                  <span className="text-xs text-[#E0E0E0]">{childName}</span>
                  <button
                    onClick={() => {
                      const updatedChildren = selectedComponent.children?.filter(id => id !== childId) || [];
                      updateComponent(selectedComponent.id, { children: updatedChildren.length > 0 ? updatedChildren : undefined });
                    }}
                    className="text-xs text-red-500 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-[#666666]">No nested components</p>
          )}
        </div>
        <select
          className="w-full px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0] mb-2"
          onChange={(e) => {
            if (e.target.value) {
              const newChildId = e.target.value;
              const currentChildren = selectedComponent.children || [];
              if (!currentChildren.includes(newChildId)) {
                updateComponent(selectedComponent.id, { children: [...currentChildren, newChildId] });
              }
              e.target.value = '';
            }
          }}
        >
          <option value="">Add child component/asset...</option>
          {project?.library.components
            .filter(c => c.id !== selectedComponent.id) // Don't allow self-reference
            .map(c => (
              <option key={c.id} value={c.id}>{c.name} (Component)</option>
            ))}
          {project?.library.assets
            .filter(a => a.id !== selectedComponent.base_asset) // Don't allow base asset as child
            .map(a => (
              <option key={a.id} value={a.id}>{a.name} (Asset)</option>
            ))}
        </select>
      </div>

      {/* Vibe Templates */}
      <div className="mt-6 pt-6 border-t border-[#333333]">
        <VibeTemplateManager />
      </div>

      {/* Audio-Reactive */}
      <div className="mt-6 pt-6 border-t border-[#333333]">
        <AudioReactivePanel />
      </div>

      {/* Event Logic */}
      <div className="mt-6 pt-6 border-t border-[#333333]">
        <LogicInspector />
      </div>

      {/* State Machine */}
      <div className="mt-6 pt-6 border-t border-[#333333]">
        <StateMachineEditor />
      </div>

      {/* AI Tools */}
      <div className="mt-6 pt-6 border-t border-[#333333]">
        <AITraceTool />
      </div>

      {/* Filter Stack */}
      <div className="mt-6 pt-6 border-t border-[#333333]">
        <FilterStack />
      </div>

      {/* Timeline */}
      <div className="mt-6 pt-6 border-t border-[#333333]">
        <TimelinePanel />
      </div>
    </div>
  );
};

