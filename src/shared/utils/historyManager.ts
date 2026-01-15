// History manager for designer app
// Fully implemented with undo/redo functionality

export class HistoryManager<T = any> {
  private history: T[] = [];
  private currentIndex: number = -1;
  private maxHistory: number = 50;

  constructor(initialState: T, options?: { mode?: string; maxHistory?: number }) {
    this.history = [initialState];
    this.currentIndex = 0;
    this.maxHistory = options?.maxHistory || 50;
  }

  pushState(state: T): void {
    // Remove any future history if we're not at the end
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(state);
    this.currentIndex++;
    
    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  undo(): T | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }

  redo(): T | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }

  getCanUndo(): boolean {
    return this.currentIndex > 0;
  }

  getCanRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }
}
