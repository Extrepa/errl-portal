import React, { useState } from 'react';
import { Plus, Trash2, Play, Circle } from 'lucide-react';
import { useStore } from '../../state/useStore';
import { generateId } from '../../utils/helpers';
import type { StateMachine, StateMachineState, StateMachineTransition } from '../../state/types';

export const StateMachineEditor: React.FC = () => {
  const { selection, project, updateComponent } = useStore();
  const [editingStateId, setEditingStateId] = useState<string | null>(null);

  const selectedComponent = selection.componentId
    ? project?.library.components.find(c => c.id === selection.componentId)
    : null;

  const stateMachine = selectedComponent?.stateMachine;

  const handleAddState = () => {
    if (!selectedComponent) return;

    const newState: StateMachineState = {
      id: generateId('state'),
      name: `State ${(stateMachine?.states.length || 0) + 1}`,
    };

    const updatedMachine: StateMachine = {
      states: [...(stateMachine?.states || []), newState],
      transitions: stateMachine?.transitions || [],
      initialState: stateMachine?.initialState || newState.id,
    };

    updateComponent(selectedComponent.id, { stateMachine: updatedMachine });
  };

  const handleAddTransition = () => {
    if (!selectedComponent || !stateMachine || stateMachine.states.length < 2) return;

    const newTransition: StateMachineTransition = {
      id: generateId('transition'),
      from: stateMachine.states[0].id,
      to: stateMachine.states[1]?.id || stateMachine.states[0].id,
      trigger: { event: 'onClick' },
    };

    updateComponent(selectedComponent.id, {
      stateMachine: {
        ...stateMachine,
        transitions: [...stateMachine.transitions, newTransition],
      },
    });
  };

  const handleDeleteState = (stateId: string) => {
    if (!selectedComponent || !stateMachine) return;

    const updatedStates = stateMachine.states.filter(s => s.id !== stateId);
    const updatedTransitions = stateMachine.transitions.filter(
      t => t.from !== stateId && t.to !== stateId
    );

    updateComponent(selectedComponent.id, {
      stateMachine: {
        states: updatedStates,
        transitions: updatedTransitions,
        initialState: stateMachine.initialState === stateId
          ? updatedStates[0]?.id || ''
          : stateMachine.initialState,
      },
    });
  };

  if (!selectedComponent) {
    return (
      <div className="p-4">
        <p className="text-xs text-[#888888]">Select a component to configure state machine</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-[#333333]">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-medium text-[#E0E0E0]">State Machine</h4>
        {!stateMachine && (
          <button
            onClick={() => {
              const initialState: StateMachineState = {
                id: generateId('state'),
                name: 'Initial',
              };
              updateComponent(selectedComponent.id, {
                stateMachine: {
                  states: [initialState],
                  transitions: [],
                  initialState: initialState.id,
                },
              });
            }}
            className="px-2 py-1 text-xs bg-[#00FF9D] text-[#121212] rounded hover:bg-[#00E08C]"
          >
            Create State Machine
          </button>
        )}
      </div>

      {stateMachine && (
        <div className="space-y-4">
          {/* States */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs text-[#888888]">States</h5>
              <button
                onClick={handleAddState}
                className="px-2 py-1 text-[10px] bg-[#121212] border border-[#333333] rounded text-[#888888] hover:text-[#E0E0E0] flex items-center gap-1"
              >
                <Plus size={10} />
                Add State
              </button>
            </div>
            <div className="space-y-2">
              {stateMachine.states.map((state) => (
                <div
                  key={state.id}
                  className={`p-2 bg-[#121212] rounded border ${
                    stateMachine.initialState === state.id
                      ? 'border-[#00FF9D]'
                      : 'border-[#333333]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Circle size={8} className={stateMachine.initialState === state.id ? 'text-[#00FF9D]' : 'text-[#888888]'} />
                      <span className="text-xs text-[#E0E0E0]">{state.name}</span>
                      {stateMachine.initialState === state.id && (
                        <span className="text-[10px] text-[#00FF9D]">(initial)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (stateMachine.initialState !== state.id) {
                            updateComponent(selectedComponent.id, {
                              stateMachine: {
                                ...stateMachine,
                                initialState: state.id,
                              },
                            });
                          }
                        }}
                        className="px-1.5 py-0.5 text-[10px] bg-[#121212] border border-[#333333] rounded text-[#888888] hover:text-[#E0E0E0]"
                        title="Set as initial"
                      >
                        <Play size={8} />
                      </button>
                      <button
                        onClick={() => handleDeleteState(state.id)}
                        className="p-1 text-[#888888] hover:text-red-400"
                        title="Delete state"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transitions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs text-[#888888]">Transitions</h5>
              <button
                onClick={handleAddTransition}
                disabled={stateMachine.states.length < 2}
                className="px-2 py-1 text-[10px] bg-[#121212] border border-[#333333] rounded text-[#888888] hover:text-[#E0E0E0] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Plus size={10} />
                Add Transition
              </button>
            </div>
            <div className="space-y-2">
              {stateMachine.transitions.length === 0 ? (
                <p className="text-xs text-[#666666]">No transitions. Add one to connect states.</p>
              ) : (
                stateMachine.transitions.map((transition) => {
                  const fromState = stateMachine.states.find(s => s.id === transition.from);
                  const toState = stateMachine.states.find(s => s.id === transition.to);
                  return (
                    <div
                      key={transition.id}
                      className="p-2 bg-[#121212] rounded border border-[#333333]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-[#E0E0E0]">
                          {fromState?.name || 'Unknown'} → {toState?.name || 'Unknown'}
                        </div>
                        <button
                          onClick={() => {
                            updateComponent(selectedComponent.id, {
                              stateMachine: {
                                ...stateMachine,
                                transitions: stateMachine.transitions.filter(t => t.id !== transition.id),
                              },
                            });
                          }}
                          className="p-1 text-[#888888] hover:text-red-400"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                      <div className="mt-1 text-[10px] text-[#888888]">
                        Trigger: {transition.trigger.event || 'none'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => {
              updateComponent(selectedComponent.id, { stateMachine: undefined });
            }}
            className="w-full px-3 py-2 text-xs bg-[#121212] border border-red-500/50 rounded text-red-400 hover:bg-[#2D2D2D]"
          >
            Remove State Machine
          </button>
        </div>
      )}
    </div>
  );
};

