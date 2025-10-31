(() => {
  const rootNS = (window as any).ErrlFX = (window as any).ErrlFX || {};

  // Ensure a shared global registry so effect modules can self-register
  (rootNS as any)._registry = (rootNS as any)._registry || new Map<string, any>();

  class FXManager {
    app: any;
    root: any;
    effects: Map<string, any>;
    _registry: Map<string, any>;

    constructor({ app = null, rootContainer = null }: { app?: any; rootContainer?: any } = {}) {
      this.app = app;
      this.root = rootContainer;
      this.effects = new Map();
      // Instance should see and share the global registry
      this._registry = (window as any).ErrlFX._registry;
    }
    register(name: string, factory: (args: { app: any; root: any; opts?: any }) => any) {
      // Write-through to the shared registry
      (window as any).ErrlFX._registry.set(name, factory);
      this._registry = (window as any).ErrlFX._registry;
    }
    enable(name: string, opts: any = {}) {
      if (this.effects.has(name)) return this.effects.get(name);
      // Look up in the shared registry as well
      const fac = (this._registry && this._registry.get(name)) || ((window as any).ErrlFX._registry && (window as any).ErrlFX._registry.get(name));
      if (!fac) return null;
      const inst = fac({ app: this.app, root: this.root, opts });
      this.effects.set(name, inst);
      return inst;
    }
    disable(name: string) {
      const inst = this.effects.get(name);
      if (inst && inst.destroy) inst.destroy();
      this.effects.delete(name);
    }
    set(name: string, params: any) {
      const inst = this.effects.get(name);
      if (inst && typeof inst.set === 'function') inst.set(params);
    }
    pauseAll() {
      for (const i of this.effects.values()) {
        if (i.pause) i.pause();
      }
    }
    resumeAll() {
      for (const i of this.effects.values()) {
        if (i.resume) i.resume();
      }
    }
  }

  (rootNS as any).Manager = FXManager;
})();
