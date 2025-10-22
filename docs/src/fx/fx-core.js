(function(){
  const rootNS = window.ErrlFX = window.ErrlFX || {};

  // Ensure a shared global registry so effect modules can self-register
  rootNS._registry = rootNS._registry || new Map();

  class FXManager{
    constructor({ app=null, rootContainer=null }={}){
      this.app = app; this.root = rootContainer; this.effects = new Map();
      // Instance should see and share the global registry
      this._registry = rootNS._registry;
    }
    register(name, factory){
      // Write-through to the shared registry
      rootNS._registry.set(name, factory);
      this._registry = rootNS._registry;
    }
    enable(name, opts={}){
      if(this.effects.has(name)) return this.effects.get(name);
      // Look up in the shared registry as well
      const fac = (this._registry && this._registry.get(name)) || (rootNS._registry && rootNS._registry.get(name));
      if(!fac) return null;
      const inst = fac({ app:this.app, root:this.root, opts });
      this.effects.set(name, inst); return inst;
    }
    disable(name){ const inst = this.effects.get(name); if(inst && inst.destroy) inst.destroy(); this.effects.delete(name); }
    set(name, params){ const inst = this.effects.get(name); if(inst && typeof inst.set === 'function') inst.set(params); }
    pauseAll(){ for(const i of this.effects.values()){ if(i.pause) i.pause(); } }
    resumeAll(){ for(const i of this.effects.values()){ if(i.resume) i.resume(); } }
  }

  rootNS.Manager = FXManager;
})();
