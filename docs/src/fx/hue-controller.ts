(() => {
  // Known layers and selectors
  const LAYERS: Record<string, { label: string; selectors?: string[]; type?: string }> = {
    background: { label: 'Background (L0)', selectors: ['.l0'] },
    motes: { label: 'Motes (L2)', selectors: ['.l2 .mote', '#motesLayer .mote', '.mote'] },
    drip: { label: 'Drip Frame (L3)', selectors: ['.l3 .drip'] },
    errl: { label: 'Errl (L4)', selectors: ['#errl-img', '#errl-inline', '.l4 .errl'] },
    nav: { label: 'Nav Bubbles (L5)', selectors: ['.ui-orbit .btn'] },
    awakening: { label: 'Awakening (L6)', selectors: ['.l6 .portal-drip', '.l6 .sigil'] },
    hud: { label: 'HUD', selectors: ['#hud', '#hud .bubble', '#hud .chip'] },
    glOverlay: { label: 'GL Overlay', type: 'webglOverlay' },
    bgBubbles: { label: 'GL Background Bubbles', type: 'webglBubbles' },
  };

  const DEFAULT_LAYER_STATE = { hue: 0, saturation: 1.0, intensity: 1.0, enabled: true };

  const HueController: any = {
    layers: Object.keys(LAYERS).reduce((acc: any, k) => {
      acc[k] = { ...DEFAULT_LAYER_STATE };
      return acc;
    }, {} as any),
    currentTarget: 'nav',

    cssEnabled: true,
    webglEnabled: true,

    webglRefs: {
      bgBubbles: null,
      glOverlay: null,
    } as any,

    webglFilters: {
      bgBubbles: null,
      glOverlay: null,
    } as any,

    animation: {
      active: false,
      startTime: 0,
      speed: 1.0,
      layer: 'nav',
    },

    init() {
      this.loadSettings();
      this.ensureClasses();
      this.applyAllCSS();
      this.triggerUpdate(this.currentTarget);
      return this;
    },

    getLayers() {
      return Object.keys(LAYERS).map((k) => ({ key: k, label: (LAYERS as any)[k].label }));
    },

    setTarget(layer: string) {
      if ((LAYERS as any)[layer]) this.currentTarget = layer;
    },

    registerWebGLLayer(layerKey: 'bgBubbles' | 'glOverlay', ref: any) {
      if (!(layerKey in this.webglRefs)) return;
      this.webglRefs[layerKey] = ref;
      this.applyWebGLLayer(layerKey);
    },

    ensureClasses() {
      const addClass = (sel: string) => {
        document.querySelectorAll(sel).forEach((el) => {
          (el as HTMLElement).classList.add('hue-controlled');
        });
      };
      for (const k of Object.keys(LAYERS)) {
        if ((LAYERS as any)[k].selectors) {
          for (const s of (LAYERS as any)[k].selectors as string[]) addClass(s);
        }
      }
    },

    layerFilterString(state: any) {
      const deg = ((state.hue % 360) + 360) % 360;
      const sat = Math.max(0, state.saturation);
      const mixBoost = 0.05 + 0.25 * state.intensity;
      return `hue-rotate(${deg}deg) saturate(${(sat * 100).toFixed(0)}%) brightness(${(100 + mixBoost * 10).toFixed(0)}%)`;
    },

    applyLayerCSS(layer: string) {
      if (!this.cssEnabled) return;
      const def = (LAYERS as any)[layer];
      if (!def || !def.selectors) return;
      const st = this.layers[layer];
      for (const sel of def.selectors as string[]) {
        document.querySelectorAll(sel).forEach((el) => {
          let f = st.enabled ? this.layerFilterString(st) : '';
          if (layer === 'errl' && (el as HTMLElement).classList && (el as HTMLElement).classList.contains('goo')) {
            f = f ? `url(#errl-goo) ${f}` : 'url(#errl-goo)';
          }
          (el as HTMLElement).style.filter = f;
        });
      }
    },

    applyAllCSS() {
      for (const k of Object.keys(LAYERS)) this.applyLayerCSS(k);
    },

    applyWebGLLayer(layer: 'bgBubbles' | 'glOverlay') {
      if (!this.webglEnabled || !(window as any).ErrlHueFilter) return;
      const st = this.layers[layer];
      if (layer === 'bgBubbles') {
        const fx = this.webglRefs.bgBubbles;
        if (fx && fx.sprites) {
          if (!this.webglFilters.bgBubbles) this.webglFilters.bgBubbles = new (window as any).ErrlHueFilter();
          const F = this.webglFilters.bgBubbles;
          F.hue = st.hue; F.saturation = st.saturation; F.intensity = st.intensity;
          fx.sprites.forEach((s: any) => {
            if (!s) return; s.filters = (s.filters || []).filter((f: any) => !(f instanceof (window as any).ErrlHueFilter));
            if (st.enabled) s.filters.push(F);
          });
        }
      } else if (layer === 'glOverlay') {
        const spr = this.webglRefs.glOverlay;
        if (spr) {
          if (!this.webglFilters.glOverlay) this.webglFilters.glOverlay = new (window as any).ErrlHueFilter();
          const F = this.webglFilters.glOverlay;
          F.hue = st.hue; F.saturation = st.saturation; F.intensity = st.intensity;
          spr.filters = (spr.filters || []).filter((f: any) => !(f instanceof (window as any).ErrlHueFilter));
          if (st.enabled) spr.filters.push(F);
        }
      }
    },

    setHue(hue: number, layer: string = this.currentTarget) {
      this.layers[layer].hue = (((hue % 360) + 360) % 360);
      this.persist(); this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer);
    },
    setSaturation(sat: number, layer: string = this.currentTarget) {
      this.layers[layer].saturation = Math.max(0, Math.min(2, sat));
      this.persist(); this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer);
    },
    setIntensity(inten: number, layer: string = this.currentTarget) {
      this.layers[layer].intensity = Math.max(0, Math.min(1, inten));
      this.persist(); this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer);
    },
    setEnabled(on: boolean, layer: string = this.currentTarget) {
      this.layers[layer].enabled = !!on;
      this.persist(); this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer);
    },

    applyTheme(layer: string, theme: string) {
      const themes: Record<string, any> = {
        normal: { hue: 0, saturation: 1.0, intensity: 1.0 },
        warm: { hue: 30, saturation: 1.1, intensity: 1.0 },
        cool: { hue: 180, saturation: 1.05, intensity: 1.0 },
        electric: { hue: 270, saturation: 1.3, intensity: 1.0 },
        sunset: { hue: 15, saturation: 1.25, intensity: 1.0 },
        ocean: { hue: 200, saturation: 1.15, intensity: 1.0 },
        forest: { hue: 120, saturation: 1.1, intensity: 1.0 },
      };
      const cfg = themes[theme];
      if (!cfg) return;
      Object.assign(this.layers[layer], cfg);
      this.persist(); this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer);
    },

    toggleAnimation(speed = 1, layer: string = this.currentTarget) {
      if (this.animation.active) this.stopAnimation(); else this.startAnimation(speed, layer);
    },
    startAnimation(speed = 1, layer: string = this.currentTarget) {
      this.animation.active = true; this.animation.startTime = Date.now(); this.animation.speed = speed; this.animation.layer = layer; this.animationLoop();
    },
    stopAnimation() { this.animation.active = false; },
    animationLoop() {
      if (!this.animation.active) return;
      const elapsed = Date.now() - this.animation.startTime;
      const cycle = 15000 / this.animation.speed;
      const p = (elapsed % cycle) / cycle;
      const h = p * 360;
      const L = this.animation.layer;
      this.layers[L].hue = h;
      this.applyLayerCSS(L); this.applyWebGLLayer(L); this.triggerUpdate(L);
      requestAnimationFrame(() => this.animationLoop());
    },

    triggerUpdate(layer: string) {
      const event = new CustomEvent('hueUpdate', { detail: { layer, state: { ...this.layers[layer] } } });
      document.dispatchEvent(event);
    },

    persist() {
      try {
        localStorage.setItem('errl_hue_layers', JSON.stringify(this.layers));
      } catch (e) {}
    },
    loadSettings() {
      try {
        const raw = localStorage.getItem('errl_hue_layers');
        if (raw) {
          const obj = JSON.parse(raw);
          for (const k of Object.keys(this.layers)) {
            if (obj[k]) this.layers[k] = Object.assign({}, DEFAULT_LAYER_STATE, obj[k]);
          }
        }
      } catch (e) {}
    },

    reset(layer: string | null = null) {
      if (layer && this.layers[layer]) {
        this.layers[layer] = { ...DEFAULT_LAYER_STATE };
        this.persist(); this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer);
        return;
      }
      for (const k of Object.keys(this.layers)) {
        this.layers[k] = { ...DEFAULT_LAYER_STATE } as any;
        this.applyLayerCSS(k); this.applyWebGLLayer(k);
      }
      this.persist(); this.triggerUpdate(this.currentTarget);
    },
  };

  (window as any).ErrlHueController = HueController;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => HueController.init());
  } else {
    HueController.init();
  }
})();
