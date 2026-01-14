/**
 * State Machine Runtime Engine
 * Handles state transitions and state-based actions
 */

import type { StateMachine, StateMachineState, StateMachineTransition } from '../state/types';

export interface StateMachineRuntime {
  currentState: string;
  machine: StateMachine;
  transition: (trigger: string, context?: Record<string, any>) => boolean;
  getCurrentState: () => StateMachineState | undefined;
  reset: () => void;
}

export class StateMachineEngine implements StateMachineRuntime {
  currentState: string;
  machine: StateMachine;

  constructor(machine: StateMachine) {
    this.machine = machine;
    this.currentState = machine.initialState;
  }

  transition(trigger: string, context?: Record<string, any>): boolean {
    const currentStateObj = this.getCurrentState();
    if (!currentStateObj) return false;

    // Find valid transition
    const validTransition = this.machine.transitions.find((t) => {
      if (t.from !== this.currentState) return false;
      if (t.trigger.event && t.trigger.event !== trigger) return false;
      if (t.trigger.condition) {
        // Evaluate condition (simple string matching for now)
        // In a real implementation, this would use a proper expression evaluator
        try {
          // Simple condition evaluation - replace variables with context values
          let condition = t.trigger.condition;
          if (context) {
            Object.entries(context).forEach(([key, value]) => {
              condition = condition.replace(new RegExp(`\\b${key}\\b`, 'g'), String(value));
            });
          }
          // Very basic evaluation - in production, use a proper expression parser
          return true; // Simplified for now
        } catch {
          return false;
        }
      }
      return true;
    });

    if (validTransition) {
      this.currentState = validTransition.to;
      return true;
    }

    return false;
  }

  getCurrentState(): StateMachineState | undefined {
    return this.machine.states.find((s) => s.id === this.currentState);
  }

  reset(): void {
    this.currentState = this.machine.initialState;
  }
}

/**
 * Create a state machine runtime instance
 */
export const createStateMachineRuntime = (machine: StateMachine): StateMachineRuntime => {
  return new StateMachineEngine(machine);
};

