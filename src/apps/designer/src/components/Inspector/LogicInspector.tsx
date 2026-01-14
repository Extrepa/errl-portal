import React, { useState } from 'react';
import { Plus, Trash2, Play, MousePointer, Clock, Radio } from 'lucide-react';
import { useStore } from '../../state/useStore';
import { generateId } from '../../utils/helpers';
import type { ComponentEvent, EventTrigger, EventAction } from '../../state/types';

export const LogicInspector: React.FC = () => {
  const { selection, project, updateComponent } = useStore();
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const selectedComponent = selection.componentId
    ? project?.library.components.find(c => c.id === selection.componentId)
    : null;

  const events = selectedComponent?.events || [];

  const handleAddEvent = () => {
    if (!selectedComponent) return;

    const newEvent: ComponentEvent = {
      id: generateId('event'),
      trigger: 'onClick',
      action: 'playVibe',
      params: {},
    };

    updateComponent(selectedComponent.id, {
      events: [...events, newEvent],
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!selectedComponent) return;
    updateComponent(selectedComponent.id, {
      events: events.filter(e => e.id !== eventId),
    });
  };

  const handleUpdateEvent = (eventId: string, updates: Partial<ComponentEvent>) => {
    if (!selectedComponent) return;
    updateComponent(selectedComponent.id, {
      events: events.map(e => e.id === eventId ? { ...e, ...updates } : e),
    });
  };

  const getTriggerIcon = (trigger: EventTrigger) => {
    switch (trigger) {
      case 'onClick':
        return <MousePointer size={12} />;
      case 'onHover':
        return <MousePointer size={12} />;
      case 'onTimer':
        return <Clock size={12} />;
      case 'onProximity':
        return <Radio size={12} />;
      default:
        return null;
    }
  };

  if (!selectedComponent) {
    return (
      <div className="p-4">
        <p className="text-xs text-[#888888]">Select a component to configure events</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-[#333333]">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-medium text-[#E0E0E0]">Event Logic</h4>
        <button
          onClick={handleAddEvent}
          className="px-2 py-1 text-xs bg-[#00FF9D] text-[#121212] rounded hover:bg-[#00E08C] flex items-center gap-1"
        >
          <Plus size={12} />
          Add Event
        </button>
      </div>

      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="text-xs text-[#666666]">No events configured. Add an event to create interactions.</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="p-3 bg-[#121212] rounded border border-[#333333]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getTriggerIcon(event.trigger)}
                  <span className="text-xs text-[#E0E0E0] font-medium">
                    When {event.trigger.replace('on', '')}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="p-1 text-[#888888] hover:text-red-400"
                  title="Delete event"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Trigger Selection */}
              <div className="mb-2">
                <label className="text-xs text-[#888888] block mb-1">Trigger</label>
                <select
                  value={event.trigger}
                  onChange={(e) => handleUpdateEvent(event.id, { trigger: e.target.value as EventTrigger })}
                  className="w-full px-2 py-1 text-xs bg-[#0a0a0a] border border-[#333333] rounded text-[#E0E0E0]"
                >
                  <option value="onClick">On Click</option>
                  <option value="onHover">On Hover</option>
                  <option value="onTimer">On Timer</option>
                  <option value="onProximity">On Proximity</option>
                </select>
              </div>

              {/* Action Selection */}
              <div className="mb-2">
                <label className="text-xs text-[#888888] block mb-1">Then</label>
                <select
                  value={event.action}
                  onChange={(e) => handleUpdateEvent(event.id, { action: e.target.value as EventAction })}
                  className="w-full px-2 py-1 text-xs bg-[#0a0a0a] border border-[#333333] rounded text-[#E0E0E0]"
                >
                  <option value="playVibe">Play Vibe</option>
                  <option value="switchState">Switch State</option>
                  <option value="emitSignal">Emit Signal</option>
                </select>
              </div>

              {/* Action Parameters */}
              {event.action === 'playVibe' && (
                <div>
                  <label className="text-xs text-[#888888] block mb-1">Vibe Type</label>
                  <select
                    value={event.params?.vibeType || 'pulse'}
                    onChange={(e) => handleUpdateEvent(event.id, {
                      params: { ...event.params, vibeType: e.target.value },
                    })}
                    className="w-full px-2 py-1 text-xs bg-[#0a0a0a] border border-[#333333] rounded text-[#E0E0E0]"
                  >
                    <option value="pulse">Pulse</option>
                    <option value="glow">Glow</option>
                    <option value="float">Float</option>
                    <option value="shake">Shake</option>
                    <option value="rotation">Rotation</option>
                  </select>
                </div>
              )}

              {event.action === 'switchState' && (
                <div>
                  <label className="text-xs text-[#888888] block mb-1">State Name</label>
                  <input
                    type="text"
                    value={event.params?.stateName || ''}
                    onChange={(e) => handleUpdateEvent(event.id, {
                      params: { ...event.params, stateName: e.target.value },
                    })}
                    placeholder="e.g., active, hover"
                    className="w-full px-2 py-1 text-xs bg-[#0a0a0a] border border-[#333333] rounded text-[#E0E0E0]"
                  />
                </div>
              )}

              {event.action === 'emitSignal' && (
                <div>
                  <label className="text-xs text-[#888888] block mb-1">Signal Name</label>
                  <input
                    type="text"
                    value={event.params?.signalName || ''}
                    onChange={(e) => handleUpdateEvent(event.id, {
                      params: { ...event.params, signalName: e.target.value },
                    })}
                    placeholder="e.g., buttonClicked"
                    className="w-full px-2 py-1 text-xs bg-[#0a0a0a] border border-[#333333] rounded text-[#E0E0E0]"
                  />
                </div>
              )}

              {event.trigger === 'onTimer' && (
                <div className="mt-2">
                  <label className="text-xs text-[#888888] block mb-1">
                    Duration (ms): {event.params?.timerDuration || 1000}
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={event.params?.timerDuration || 1000}
                    onChange={(e) => handleUpdateEvent(event.id, {
                      params: { ...event.params, timerDuration: parseInt(e.target.value) },
                    })}
                    className="w-full"
                  />
                </div>
              )}

              {event.trigger === 'onProximity' && (
                <div className="mt-2">
                  <label className="text-xs text-[#888888] block mb-1">
                    Distance: {event.params?.proximityDistance || 100}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={event.params?.proximityDistance || 100}
                    onChange={(e) => handleUpdateEvent(event.id, {
                      params: { ...event.params, proximityDistance: parseInt(e.target.value) },
                    })}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

