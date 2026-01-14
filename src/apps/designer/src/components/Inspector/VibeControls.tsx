import React from 'react';
import { useStore } from '../../state/useStore';
import { vibePresets } from '../../data/vibePresets';
import type { VibeConfig } from '../../state/types';

interface Props {
  componentId?: string;
  assetId?: string;
}

export const VibeControls: React.FC<Props> = ({ componentId, assetId }) => {
  const { project, updateComponent, updateAsset, applyVibeTemplateToComponent } = useStore();

  const targetComponent = componentId
    ? project?.library.components.find((c) => c.id === componentId)
    : undefined;
  const targetAsset = assetId ? project?.library.assets.find((a) => a.id === assetId) : undefined;

  const vibeStack = targetComponent?.vibeStack || targetAsset?.fxStack || [];
  const vibe = targetComponent?.vibe || targetAsset?.fx;
  const hasStack = vibeStack.length > 0;

  const updateTarget = (updates: Partial<VibeConfig>) => {
    if (hasStack) {
      const next = [{ ...(vibeStack[0] || {}), ...updates }, ...vibeStack.slice(1)];
      if (targetComponent) {
        updateComponent(targetComponent.id, { vibeStack: next });
      } else if (targetAsset) {
        updateAsset(targetAsset.id, { fxStack: next });
      }
    } else if (targetComponent) {
      updateComponent(targetComponent.id, { vibe: { ...targetComponent.vibe, ...updates } });
    } else if (targetAsset) {
      updateAsset(targetAsset.id, { fx: { ...targetAsset.fx, ...updates } });
    }
  };

  const promoteToStack = () => {
    if (hasStack) return;
    const base = vibe || { type: 'pulse', intensity: 0.5, frequency: 1 };
    const next = [base];
    if (targetComponent) {
      updateComponent(targetComponent.id, { vibeStack: next, vibe: undefined });
    } else if (targetAsset) {
      updateAsset(targetAsset.id, { fxStack: next, fx: undefined });
    }
  };

  const updateStackAt = (index: number, updates: Partial<VibeConfig>) => {
    const next = vibeStack.map((v, i) => (i === index ? { ...v, ...updates } : v));
    if (targetComponent) {
      updateComponent(targetComponent.id, { vibeStack: next });
    } else if (targetAsset) {
      updateAsset(targetAsset.id, { fxStack: next });
    }
  };

  const removeFromStack = (index: number) => {
    const next = vibeStack.filter((_, i) => i !== index);
    if (targetComponent) {
      updateComponent(targetComponent.id, { vibeStack: next });
    } else if (targetAsset) {
      updateAsset(targetAsset.id, { fxStack: next });
    }
  };

  const moveStack = (index: number, dir: -1 | 1) => {
    const targetIndex = index + dir;
    if (targetIndex < 0 || targetIndex >= vibeStack.length) return;
    const next = [...vibeStack];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    if (targetComponent) {
      updateComponent(targetComponent.id, { vibeStack: next });
    } else if (targetAsset) {
      updateAsset(targetAsset.id, { fxStack: next });
    }
  };

  const addPresetToStack = (key: string) => {
    const preset = vibePresets[key];
    if (!preset) return;
    const next = [...vibeStack, preset];
    if (targetComponent) {
      updateComponent(targetComponent.id, { vibeStack: next });
    } else if (targetAsset) {
      updateAsset(targetAsset.id, { fxStack: next });
    }
  };

  if (!targetComponent && !targetAsset) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#E0E0E0]">Preset</span>
        <select
          className="bg-[#0a0a0a] border border-[#333] text-xs text-[#E0E0E0] rounded px-2 py-1"
          onChange={(e) => {
            const preset = vibePresets[e.target.value];
            if (!preset) return;
            if (hasStack) {
              addPresetToStack(e.target.value);
            } else if (targetComponent) {
              applyVibeTemplateToComponent(targetComponent.id, {
                id: e.target.value,
                name: e.target.value,
                vibe: preset,
              });
            } else {
              updateTarget(preset);
            }
          }}
          defaultValue=""
        >
          <option value="">Select preset</option>
          {Object.keys(vibePresets).map((key) => (
            <option key={key} value={key}>
              {key.replace('_', ' ')}
            </option>
          ))}
        </select>
        {!hasStack && (
          <button
            onClick={promoteToStack}
            className="text-[11px] px-2 py-1 bg-[#121212] border border-[#333] rounded text-[#888] hover:text-[#E0E0E0]"
          >
            Start Stack
          </button>
        )}
      </div>
      <div className="w-full h-12 bg-[#0a0a0a] border border-[#333] rounded overflow-hidden">
        <svg viewBox="0 0 100 40" className="w-full h-full">
          <polyline
            fill="none"
            stroke="#00FF9D"
            strokeWidth="1"
            points={Array.from({ length: 50 }).map((_, i) => {
              const t = i / 10;
              const intensity = (vibeStack[0]?.intensity ?? vibe?.intensity ?? 0.5) * 10;
              const freq = vibeStack[0]?.frequency ?? vibeStack[0]?.speed ?? vibe?.frequency ?? vibe?.speed ?? 1;
              const y = 20 + Math.sin(t * freq) * intensity;
              const x = (i / 50) * 100;
              return `${x},${y}`;
            }).join(' ')}
          />
        </svg>
      </div>
      {hasStack && (
        <div className="space-y-2">
          <div className="text-[11px] text-[#888]">Vibe Stack</div>
          {vibeStack.length === 0 && (
            <div className="text-[11px] text-[#666]">No vibes yet. Add a preset to start stacking.</div>
          )}
          {vibeStack.map((v, idx) => (
            <div
              key={idx}
              className="border border-[#333] rounded p-2 space-y-1"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', String(idx));
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const from = Number(e.dataTransfer.getData('text/plain'));
                const to = idx;
                if (Number.isNaN(from) || from === to) return;
                const next = [...vibeStack];
                const [moved] = next.splice(from, 1);
                next.splice(to, 0, moved);
                if (targetComponent) {
                  updateComponent(targetComponent.id, { vibeStack: next });
                } else if (targetAsset) {
                  updateAsset(targetAsset.id, { fxStack: next });
                }
              }}
            >
              <div className="flex items-center justify-between text-xs text-[#E0E0E0]">
                <span>{v.type || 'pulse'}</span>
                <button
                  onClick={() => removeFromStack(idx)}
                  className="text-[#888] hover:text-red-400 text-[11px]"
                >
                  remove
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveStack(idx, -1)}
                  className="text-[11px] px-1 py-0.5 bg-[#121212] border border-[#333] rounded text-[#888] hover:text-[#E0E0E0]"
                  disabled={idx === 0}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveStack(idx, 1)}
                  className="text-[11px] px-1 py-0.5 bg-[#121212] border border-[#333] rounded text-[#888] hover:text-[#E0E0E0]"
                  disabled={idx === vibeStack.length - 1}
                  title="Move down"
                >
                  ↓
                </button>
                <select
                  value={v.type || 'pulse'}
                  onChange={(e) => updateStackAt(idx, { type: e.target.value as VibeConfig['type'] })}
                  className="flex-1 bg-[#0a0a0a] border border-[#333] rounded px-2 py-1 text-[11px] text-[#E0E0E0]"
                >
                  <option value="pulse">Pulse</option>
                  <option value="float">Float</option>
                  <option value="shake">Shake</option>
                  <option value="rotation">Rotation</option>
                  <option value="opacity_flicker">Opacity Flicker</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-[#888] flex-1">
                  Intensity
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={v.intensity ?? 0.5}
                    onChange={(e) => updateStackAt(idx, { intensity: parseFloat(e.target.value) })}
                    className="w-full accent-[#00FF9D]"
                  />
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={v.frequency ?? v.speed ?? 1}
                  onChange={(e) => updateStackAt(idx, { frequency: parseFloat(e.target.value) })}
                  className="w-16 bg-[#0a0a0a] border border-[#333] rounded px-2 py-1 text-[11px] text-[#E0E0E0]"
                />
              </div>
              <div className="w-full h-10 bg-[#0a0a0a] border border-[#333] rounded overflow-hidden">
                <svg viewBox="0 0 100 30" className="w-full h-full">
                  <polyline
                    fill="none"
                    stroke="#00FF9D"
                    strokeWidth="1"
                    points={Array.from({ length: 50 }).map((_, i) => {
                      const t = i / 10;
                      const intensity = (v.intensity ?? 0.5) * 8;
                      const freq = v.frequency ?? v.speed ?? 1;
                      const y = 15 + Math.sin(t * freq) * intensity;
                      const x = (i / 50) * 100;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                </svg>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-[#888]">
                <label className="flex flex-col gap-1">
                  Phase
                  <input
                    type="number"
                    min={0}
                    max={360}
                    value={v.phaseOffset ?? 0}
                    onChange={(e) => updateStackAt(idx, { phaseOffset: parseFloat(e.target.value) })}
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded px-2 py-1 text-[11px] text-[#E0E0E0]"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Hue Amp
                  <input
                    type="number"
                    min={0}
                    max={180}
                    value={v.hueAmplitude ?? 0}
                    onChange={(e) => updateStackAt(idx, { hueAmplitude: parseFloat(e.target.value) })}
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded px-2 py-1 text-[11px] text-[#E0E0E0]"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Target
                  <select
                    value={v.target || 'fill'}
                    onChange={(e) => updateStackAt(idx, { target: e.target.value as VibeConfig['target'] })}
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded px-2 py-1 text-[11px] text-[#E0E0E0]"
                  >
                    <option value="fill">Fill</option>
                    <option value="stroke">Stroke</option>
                    <option value="both">Both</option>
                  </select>
                </label>
                {v.type === 'opacity_flicker' && (
                  <label className="flex flex-col gap-1">
                    Flicker
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={v.intensity ?? 0.2}
                      onChange={(e) => updateStackAt(idx, { intensity: parseFloat(e.target.value) })}
                      className="w-full accent-[#00FF9D]"
                    />
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <div>
        <label className="text-xs text-[#888] block mb-1">Type</label>
        <select
          value={(vibeStack[0]?.type || vibe?.type) || 'pulse'}
          onChange={(e) => updateTarget({ type: e.target.value as VibeConfig['type'] })}
          className="w-full bg-[#0a0a0a] border border-[#333] rounded px-2 py-1 text-xs text-[#E0E0E0]"
        >
          <option value="pulse">Pulse</option>
          <option value="float">Float</option>
          <option value="shake">Shake</option>
          <option value="rotation">Rotation</option>
          <option value="opacity_flicker">Opacity Flicker</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-[#888] block mb-1">Intensity</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={(vibeStack[0]?.intensity ?? vibe?.intensity) ?? 0.5}
          onChange={(e) => updateTarget({ intensity: parseFloat(e.target.value) })}
          className="w-full accent-[#00FF9D]"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-[#888] flex flex-col gap-1">
          Speed/Hz
          <input
            type="number"
            min={0}
            step={0.1}
            value={(vibeStack[0]?.frequency ?? vibeStack[0]?.speed ?? vibe?.frequency ?? vibe?.speed) ?? 1}
            onChange={(e) => updateTarget({ frequency: parseFloat(e.target.value) })}
            className="w-full bg-[#0a0a0a] border border-[#333] rounded px-2 py-1 text-xs text-[#E0E0E0]"
          />
        </label>
        <label className="text-xs text-[#888] flex flex-col gap-1">
          Phase (deg)
          <input
            type="number"
            min={0}
            max={360}
            value={vibe?.phaseOffset ?? 0}
            onChange={(e) => updateTarget({ phaseOffset: parseFloat(e.target.value) })}
            className="w-full bg-[#0a0a0a] border border-[#333] rounded px-2 py-1 text-xs text-[#E0E0E0]"
          />
        </label>
      </div>
      <div>
        <label className="text-xs text-[#888] block mb-1">Hue Amplitude (deg)</label>
        <input
          type="number"
          min={0}
          max={180}
          value={(vibeStack[0]?.hueAmplitude ?? vibe?.hueAmplitude) ?? 0}
          onChange={(e) => updateTarget({ hueAmplitude: parseFloat(e.target.value) })}
          className="w-full bg-[#0a0a0a] border border-[#333] rounded px-2 py-1 text-xs text-[#E0E0E0]"
        />
      </div>
      <div>
        <label className="text-xs text-[#888] block mb-1">Target</label>
        <select
          value={(vibeStack[0]?.target || vibe?.target) || 'fill'}
          onChange={(e) => updateTarget({ target: e.target.value as VibeConfig['target'] })}
          className="w-full bg-[#0a0a0a] border border-[#333] rounded px-2 py-1 text-xs text-[#E0E0E0]"
        >
          <option value="fill">Fill</option>
          <option value="stroke">Stroke</option>
          <option value="both">Both</option>
        </select>
      </div>
    </div>
  );
};
