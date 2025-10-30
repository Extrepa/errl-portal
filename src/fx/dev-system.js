/**
 * Errl Portal Development System
 * Professional dev tools for FX management, layer inspection, and parameter tuning
 */
(function() {
  'use strict';

  // Only initialize if dev mode is enabled
  const urlParams = new URLSearchParams(window.location.search);
  const devMode = urlParams.get('dev') === 'true' || localStorage.getItem('errl-dev-mode') === 'true';
  
  if (!devMode) return;

  const DevSystem = {
    // Core state
    enabled: true,
    selectedElement: null,
    selectedLayer: null,
    
    // FX Registry - centralized effect management
    fxRegistry: new Map(),
    layerRegistry: new Map(),
    
    // UI References
    ui: {
      panel: null,
      inspector: null,
      layerManager: null,
      fxLibrary: null,
      parameterPanel: null
    },

    // History system for undo/redo
    history: {
      stack: [],
      index: -1,
      maxSize: 50
    },

    // Presets system
    presets: {
      current: {},
      saved: {}
    },

    init() {
      console.log('🎮 Errl Portal Dev System initializing...');
      
      this.registerDefaultLayers();
      this.registerDefaultFX();
      this.createDevUI();
      this.bindEvents();
      this.loadPresets();
      
      // Add visual indicators
      this.addDevModeIndicators();
      
      console.log('✅ Dev System ready!');
      return this;
    },

    // Layer Registry - mapping of all visual layers
    registerDefaultLayers() {
      const layers = [
        { 
          id: 'l0', 
          label: 'Background (L0)', 
          selectors: ['.l0'], 
          type: 'css',
          effects: ['hue', 'blur', 'brightness']
        },
        { 
          id: 'l1-gl', 
          label: 'WebGL Canvas (L1)', 
          selectors: ['#gl', 'canvas'], 
          type: 'webgl',
          effects: ['displacement', 'shimmer', 'hue']
        },
        { 
          id: 'l2', 
          label: 'Motes (L2)', 
          selectors: ['.l2', '.mote'], 
          type: 'css',
          effects: ['hue', 'opacity', 'scale']
        },
        { 
          id: 'l3', 
          label: 'Frame Drip (L3)', 
          selectors: ['.l3', '.drip'], 
          type: 'css',
          effects: ['hue', 'blur']
        },
        { 
          id: 'l4', 
          label: 'Errl Character (L4)', 
          selectors: ['.l4', '.errl', '#errl-img', '#errl-inline'], 
          type: 'mixed',
          effects: ['hue', 'goo', 'scale', 'rotation']
        },
        { 
          id: 'l5', 
          label: 'Navigation (L5)', 
          selectors: ['.l5', '.btn', '.ui-orbit'], 
          type: 'css',
          effects: ['hue', 'goo', 'physics']
        },
        { 
          id: 'l6', 
          label: 'Awakening (L6)', 
          selectors: ['.l6', '.portal-drip', '.sigil'], 
          type: 'css',
          effects: ['hue', 'opacity']
        },
        { 
          id: 'hud', 
          label: 'HUD Elements', 
          selectors: ['#hud', '.bubble', '.chip'], 
          type: 'css',
          effects: ['hue', 'scale']
        }
      ];

      layers.forEach(layer => {
        this.layerRegistry.set(layer.id, layer);
      });
    },

    // FX Registry - all available effects
    registerDefaultFX() {
      const effects = [
        {
          id: 'hue',
          label: 'Hue Rotation',
          category: 'Color',
          type: 'both', // css + webgl
          parameters: {
            hue: { type: 'range', min: 0, max: 360, step: 1, default: 0, unit: '°' },
            saturation: { type: 'range', min: 0, max: 2, step: 0.01, default: 1.0, unit: '%' },
            intensity: { type: 'range', min: 0, max: 1, step: 0.01, default: 1.0, unit: '%' }
          },
          apply: (element, params) => {
            if (window.ErrlHueController) {
              // Use existing hue controller
              const layer = this.getLayerForElement(element);
              if (layer) {
                window.ErrlHueController.setHue(params.hue, layer.id);
                window.ErrlHueController.setSaturation(params.saturation, layer.id);
                window.ErrlHueController.setIntensity(params.intensity, layer.id);
              }
            }
          }
        },
        {
          id: 'goo',
          label: 'Goo Filter',
          category: 'Distortion',
          type: 'css',
          parameters: {
            enabled: { type: 'checkbox', default: false },
            strength: { type: 'range', min: 0, max: 2, step: 0.01, default: 1.0 },
            wobble: { type: 'range', min: 0, max: 2, step: 0.01, default: 1.0 }
          },
          apply: (element, params) => {
            if (params.enabled) {
              element.classList.add('goo');
              // Apply strength and wobble via CSS custom properties
              element.style.setProperty('--goo-strength', params.strength);
              element.style.setProperty('--goo-wobble', params.wobble);
            } else {
              element.classList.remove('goo');
            }
          }
        },
        {
          id: 'transform',
          label: 'Transform',
          category: 'Spatial',
          type: 'css',
          parameters: {
            translateX: { type: 'range', min: -500, max: 500, step: 1, default: 0, unit: 'px' },
            translateY: { type: 'range', min: -500, max: 500, step: 1, default: 0, unit: 'px' },
            scale: { type: 'range', min: 0.1, max: 3, step: 0.01, default: 1.0 },
            rotate: { type: 'range', min: 0, max: 360, step: 1, default: 0, unit: '°' }
          },
          apply: (element, params) => {
            const transform = `translate(${params.translateX}px, ${params.translateY}px) scale(${params.scale}) rotate(${params.rotate}deg)`;
            element.style.transform = transform;
          }
        },
        {
          id: 'filter',
          label: 'CSS Filters',
          category: 'Visual',
          type: 'css',
          parameters: {
            blur: { type: 'range', min: 0, max: 20, step: 0.1, default: 0, unit: 'px' },
            brightness: { type: 'range', min: 0, max: 3, step: 0.01, default: 1.0 },
            contrast: { type: 'range', min: 0, max: 3, step: 0.01, default: 1.0 },
            opacity: { type: 'range', min: 0, max: 1, step: 0.01, default: 1.0 }
          },
          apply: (element, params) => {
            const filters = [];
            if (params.blur > 0) filters.push(`blur(${params.blur}px)`);
            if (params.brightness !== 1.0) filters.push(`brightness(${params.brightness})`);
            if (params.contrast !== 1.0) filters.push(`contrast(${params.contrast})`);
            if (params.opacity !== 1.0) filters.push(`opacity(${params.opacity})`);
            
            // Preserve existing filters (like hue rotation)
            const existingFilter = element.style.filter || '';
            const preservedFilters = existingFilter.split(' ').filter(f => 
              f.includes('hue-rotate') || f.includes('url(#')
            );
            
            const allFilters = [...preservedFilters, ...filters].join(' ');
            element.style.filter = allFilters;
          }
        }
      ];

      effects.forEach(effect => {
        this.fxRegistry.set(effect.id, effect);
      });
    },

    // UI Creation
    createDevUI() {
      // Main dev panel container
      this.ui.panel = this.createElement('div', 'errl-dev-panel', {
        style: `
          position: fixed;
          top: 20px;
          right: 20px;
          width: 400px;
          max-height: calc(100vh - 40px);
          background: rgba(10, 14, 22, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          color: #d7e6ff;
          font-family: Inter, system-ui, sans-serif;
          font-size: 12px;
          z-index: 10000;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        `
      });

      // Header
      const header = this.createElement('div', 'dev-header', {
        style: `
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0, 0, 0, 0.2);
        `,
        innerHTML: `
          <strong style="color: #00e5ff; font-size: 13px;">🎮 DEV TOOLS</strong>
          <div style="display: flex; gap: 8px;">
            <button class="dev-btn dev-minimize" title="Minimize">─</button>
            <button class="dev-btn dev-close" title="Close">×</button>
          </div>
        `
      });

      // Tab navigation
      const tabs = this.createElement('div', 'dev-tabs', {
        style: `
          display: flex;
          background: rgba(0, 0, 0, 0.2);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        `,
        innerHTML: `
          <button class="dev-tab active" data-tab="inspector">Inspector</button>
          <button class="dev-tab" data-tab="layers">Layers</button>
          <button class="dev-tab" data-tab="fx">FX Library</button>
          <button class="dev-tab" data-tab="presets">Presets</button>
        `
      });

      // Content area
      const content = this.createElement('div', 'dev-content', {
        style: `
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        `
      });

      // Assemble panel
      this.ui.panel.appendChild(header);
      this.ui.panel.appendChild(tabs);
      this.ui.panel.appendChild(content);
      document.body.appendChild(this.ui.panel);

      // Create tab content
      this.createInspectorTab(content);
      this.createLayersTab(content);
      this.createFXTab(content);
      this.createPresetsTab(content);

      // Style dev buttons
      this.addDevStyles();
    },

    createElement(tag, className, props = {}) {
      const el = document.createElement(tag);
      if (className) el.className = className;
      
      Object.entries(props).forEach(([key, value]) => {
        if (key === 'style') {
          el.setAttribute('style', value);
        } else if (key === 'innerHTML') {
          el.innerHTML = value;
        } else {
          el.setAttribute(key, value);
        }
      });
      
      return el;
    },

    createInspectorTab(container) {
      this.ui.inspector = this.createElement('div', 'dev-tab-content active', {
        'data-tab': 'inspector',
        innerHTML: `
          <div class="dev-section">
            <h3 style="margin: 0 0 12px 0; color: #00e5ff;">Element Inspector</h3>
            <p style="opacity: 0.8; margin: 0 0 16px 0; font-size: 11px;">Click any element to inspect its properties and effects.</p>
            <div class="selected-element" style="display: none;">
              <div class="element-info" style="background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                <div class="element-name" style="font-weight: bold; color: #0ff; margin-bottom: 4px;"></div>
                <div class="element-selector" style="font-family: monospace; opacity: 0.7; font-size: 10px;"></div>
                <div class="element-layer" style="margin-top: 8px;">
                  <span class="layer-badge" style="background: rgba(0, 229, 255, 0.2); padding: 2px 8px; border-radius: 4px; font-size: 10px;"></span>
                </div>
              </div>
              <div class="element-effects">
                <h4 style="margin: 0 0 8px 0; font-size: 12px;">Applied Effects</h4>
                <div class="effects-list"></div>
              </div>
              <div class="element-parameters" style="margin-top: 16px;">
                <h4 style="margin: 0 0 8px 0; font-size: 12px;">Parameters</h4>
                <div class="parameters-list"></div>
              </div>
            </div>
            <div class="no-selection" style="text-align: center; opacity: 0.5; padding: 40px 20px;">
              <div style="font-size: 24px; margin-bottom: 8px;">🎯</div>
              <div>Click an element to inspect</div>
            </div>
          </div>
        `
      });
      container.appendChild(this.ui.inspector);
    },

    createLayersTab(container) {
      this.ui.layerManager = this.createElement('div', 'dev-tab-content', {
        'data-tab': 'layers',
        innerHTML: `
          <div class="dev-section">
            <h3 style="margin: 0 0 12px 0; color: #00e5ff;">Layer Manager</h3>
            <div class="layer-controls" style="margin-bottom: 16px;">
              <button class="dev-btn-small" id="show-all-layers">Show All</button>
              <button class="dev-btn-small" id="hide-all-layers">Hide All</button>
              <button class="dev-btn-small" id="reset-layers">Reset</button>
            </div>
            <div class="layers-list"></div>
          </div>
        `
      });
      container.appendChild(this.ui.layerManager);
      this.populateLayersList();
    },

    createFXTab(container) {
      this.ui.fxLibrary = this.createElement('div', 'dev-tab-content', {
        'data-tab': 'fx',
        innerHTML: `
          <div class="dev-section">
            <h3 style="margin: 0 0 12px 0; color: #00e5ff;">FX Library</h3>
            <div class="fx-search" style="margin-bottom: 16px;">
              <input type="search" placeholder="Search effects..." style="width: 100%; padding: 8px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: #fff;">
            </div>
            <div class="fx-categories"></div>
          </div>
        `
      });
      container.appendChild(this.ui.fxLibrary);
      this.populateFXLibrary();
    },

    createPresetsTab(container) {
      const presetsTab = this.createElement('div', 'dev-tab-content', {
        'data-tab': 'presets',
        innerHTML: `
          <div class="dev-section">
            <h3 style="margin: 0 0 12px 0; color: #00e5ff;">Presets</h3>
            <div class="preset-controls" style="margin-bottom: 16px;">
              <input type="text" id="preset-name" placeholder="Preset name..." style="width: 200px; padding: 6px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #fff; margin-right: 8px;">
              <button class="dev-btn-small" id="save-preset">Save</button>
            </div>
            <div class="presets-list"></div>
          </div>
        `
      });
      container.appendChild(presetsTab);
    },

    populateLayersList() {
      const layersList = this.ui.layerManager.querySelector('.layers-list');
      layersList.innerHTML = '';

      this.layerRegistry.forEach((layer, id) => {
        const layerItem = this.createElement('div', 'layer-item', {
          style: `
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 8px;
            cursor: pointer;
          `,
          innerHTML: `
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div class="layer-name" style="font-weight: bold; color: #fff; margin-bottom: 4px;">${layer.label}</div>
                <div class="layer-type" style="opacity: 0.7; font-size: 10px;">${layer.type.toUpperCase()} • ${layer.effects.length} effects</div>
              </div>
              <div style="display: flex; gap: 4px;">
                <button class="layer-toggle dev-btn-mini" data-layer="${id}" title="Toggle visibility">👁</button>
                <button class="layer-solo dev-btn-mini" data-layer="${id}" title="Solo layer">🎯</button>
              </div>
            </div>
          `
        });

        layerItem.addEventListener('click', () => this.selectLayer(id));
        layersList.appendChild(layerItem);
      });
    },

    populateFXLibrary() {
      const categoriesContainer = this.ui.fxLibrary.querySelector('.fx-categories');
      const categories = {};

      // Group effects by category
      this.fxRegistry.forEach(effect => {
        if (!categories[effect.category]) {
          categories[effect.category] = [];
        }
        categories[effect.category].push(effect);
      });

      // Create category sections
      Object.entries(categories).forEach(([category, effects]) => {
        const categorySection = this.createElement('div', 'fx-category', {
          style: 'margin-bottom: 16px;',
          innerHTML: `
            <h4 style="margin: 0 0 8px 0; color: #00e5ff; font-size: 11px; text-transform: uppercase;">${category}</h4>
            <div class="fx-list" style="display: grid; gap: 8px;"></div>
          `
        });

        const fxList = categorySection.querySelector('.fx-list');
        effects.forEach(effect => {
          const effectItem = this.createElement('div', 'fx-item', {
            style: `
              background: rgba(0, 0, 0, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 6px;
              padding: 8px 12px;
              cursor: pointer;
              transition: all 0.2s;
            `,
            innerHTML: `
              <div style="font-weight: bold; margin-bottom: 2px;">${effect.label}</div>
              <div style="opacity: 0.7; font-size: 10px;">${effect.type.toUpperCase()} • ${Object.keys(effect.parameters).length} params</div>
            `
          });

          effectItem.addEventListener('click', () => this.openFXEditor(effect));
          effectItem.addEventListener('mouseenter', () => {
            effectItem.style.borderColor = 'rgba(0, 229, 255, 0.4)';
            effectItem.style.background = 'rgba(0, 229, 255, 0.1)';
          });
          effectItem.addEventListener('mouseleave', () => {
            effectItem.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            effectItem.style.background = 'rgba(0, 0, 0, 0.2)';
          });

          fxList.appendChild(effectItem);
        });

        categoriesContainer.appendChild(categorySection);
      });
    },

    addDevStyles() {
      const styles = `
        <style id="errl-dev-styles">
          .dev-btn, .dev-btn-small, .dev-btn-mini {
            background: rgba(0, 229, 255, 0.2);
            border: 1px solid rgba(0, 229, 255, 0.4);
            color: #00e5ff;
            border-radius: 4px;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.2s;
          }
          .dev-btn { padding: 6px 12px; font-size: 11px; }
          .dev-btn-small { padding: 4px 8px; font-size: 10px; }
          .dev-btn-mini { padding: 2px 6px; font-size: 9px; }
          
          .dev-btn:hover, .dev-btn-small:hover, .dev-btn-mini:hover {
            background: rgba(0, 229, 255, 0.3);
            transform: translateY(-1px);
          }
          
          .dev-tab {
            flex: 1;
            padding: 10px 16px;
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            cursor: pointer;
            transition: all 0.2s;
            font-size: 11px;
          }
          .dev-tab:hover { color: #00e5ff; }
          .dev-tab.active { 
            color: #00e5ff; 
            background: rgba(0, 229, 255, 0.1);
            border-bottom: 2px solid #00e5ff;
          }
          
          .dev-tab-content { display: none; }
          .dev-tab-content.active { display: block; }
          
          .errl-dev-panel::-webkit-scrollbar { width: 6px; }
          .errl-dev-panel::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
          .errl-dev-panel::-webkit-scrollbar-thumb { 
            background: rgba(0, 229, 255, 0.3); 
            border-radius: 3px; 
          }
          
          /* Element highlighting */
          .dev-highlight {
            outline: 2px dashed rgba(0, 229, 255, 0.8) !important;
            outline-offset: 2px !important;
            position: relative !important;
          }
          .dev-highlight::after {
            content: attr(data-dev-label);
            position: absolute;
            top: -24px;
            left: 0;
            background: rgba(0, 229, 255, 0.9);
            color: #000;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            pointer-events: none;
            z-index: 10001;
          }
          
          /* Mobile responsive */
          @media (max-width: 768px) {
            .errl-dev-panel {
              width: calc(100vw - 20px) !important;
              max-width: none !important;
              right: 10px !important;
              top: 10px !important;
            }
          }
        </style>
      `;
      document.head.insertAdjacentHTML('beforeend', styles);
    },

    addDevModeIndicators() {
      const indicator = this.createElement('div', 'dev-mode-indicator', {
        style: `
          position: fixed;
          bottom: 20px;
          left: 20px;
          background: rgba(0, 229, 255, 0.2);
          border: 1px solid rgba(0, 229, 255, 0.4);
          color: #00e5ff;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-family: monospace;
          z-index: 9999;
          backdrop-filter: blur(4px);
          display: flex;
          gap: 10px;
          align-items: center;
        `
      });
      const lab = document.createElement('span');
      lab.textContent = '🎮 DEV MODE';
      const btn = document.createElement('button');
      btn.id = 'exit-dev-mode';
      btn.textContent = 'Exit';
      btn.setAttribute('style', 'background:rgba(0,0,0,0.3); color:#00e5ff; border:1px solid rgba(0,229,255,0.5); border-radius:4px; padding:2px 6px; cursor:pointer; font-family:inherit; font-size:11px;');
      indicator.appendChild(lab);
      indicator.appendChild(btn);
      document.body.appendChild(indicator);
    },

    bindEvents() {
      // Tab switching
      this.ui.panel.addEventListener('click', (e) => {
        if (e.target.classList.contains('dev-tab')) {
          this.switchTab(e.target.dataset.tab);
        }
        
        // Panel controls
        if (e.target.classList.contains('dev-minimize')) {
          this.toggleMinimize();
        }
        if (e.target.classList.contains('dev-close')) {
          this.toggleDevPanel();
        }
      });

      // Element selection for inspection
      document.addEventListener('click', (e) => {
        if (e.target.closest('.errl-dev-panel')) return;
        
        // Check if holding Alt key for inspection mode
        if (e.altKey || e.target.hasAttribute('data-dev-inspectable')) {
          e.preventDefault();
          e.stopPropagation();
          this.selectElement(e.target);
        }
      });

      // Hover highlighting
      document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.errl-dev-panel')) return;
        
        if (e.altKey) {
          this.highlightElement(e.target);
        }
      });

      document.addEventListener('mouseout', (e) => {
        this.removeHighlight(e.target);
      });

      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || (e.metaKey && e.shiftKey && e.key === 'I')) {
          e.preventDefault();
          this.toggleDevPanel();
        }
        
        if (e.metaKey && e.key === 'z') {
          e.preventDefault();
          e.shiftKey ? this.redo() : this.undo();
        }
        
        if (e.key === 'Escape') {
          // Quick hide (does not disable dev-mode flag)
          const panel = this.ui.panel; if(panel) panel.style.display = 'none';
        }
      });
      // Exit button
      document.addEventListener('click', (e) => {
        const exitBtn = e.target.closest && e.target.closest('#exit-dev-mode');
        if (exitBtn) {
          try { localStorage.removeItem('errl-dev-mode'); } catch (err) {}
          const url = new URL(location.href);
          url.searchParams.delete('dev');
          location.href = url.pathname + (url.searchParams.toString()? ('?' + url.searchParams.toString()) : '') + url.hash;
        }
      });
    },

    switchTab(tabName) {
      // Update tab buttons
      this.ui.panel.querySelectorAll('.dev-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
      });
      
      // Update tab content
      this.ui.panel.querySelectorAll('.dev-tab-content').forEach(content => {
        content.classList.toggle('active', content.dataset.tab === tabName);
      });
    },

    selectElement(element) {
      this.selectedElement = element;
      this.selectedLayer = this.getLayerForElement(element);
      
      this.updateInspector();
      this.switchTab('inspector');
      
      // Add selection highlight
      document.querySelectorAll('.dev-selected').forEach(el => {
        el.classList.remove('dev-selected');
      });
      element.classList.add('dev-selected');
    },

    selectLayer(layerId) {
      this.selectedLayer = this.layerRegistry.get(layerId);
      // Highlight all elements in this layer
      if (this.selectedLayer) {
        this.selectedLayer.selectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            this.highlightElement(el, true);
          });
        });
      }
    },

    highlightElement(element, persistent = false) {
      this.removeHighlight();
      
      const layer = this.getLayerForElement(element);
      const label = layer ? layer.label : 'Element';
      
      element.classList.add('dev-highlight');
      element.setAttribute('data-dev-label', label);
      
      if (!persistent) {
        setTimeout(() => this.removeHighlight(element), 100);
      }
    },

    removeHighlight(element = null) {
      const targets = element ? [element] : document.querySelectorAll('.dev-highlight');
      targets.forEach(el => {
        if (el.classList) {
          el.classList.remove('dev-highlight');
          el.removeAttribute('data-dev-label');
        }
      });
    },

    getLayerForElement(element) {
      for (const [id, layer] of this.layerRegistry) {
        if (layer.selectors.some(selector => {
          try {
            return element.matches(selector) || element.closest(selector);
          } catch (e) {
            return false;
          }
        })) {
          return layer;
        }
      }
      return null;
    },

    updateInspector() {
      const inspector = this.ui.inspector;
      const selectedDiv = inspector.querySelector('.selected-element');
      const noSelectionDiv = inspector.querySelector('.no-selection');
      
      if (!this.selectedElement) {
        selectedDiv.style.display = 'none';
        noSelectionDiv.style.display = 'block';
        return;
      }
      
      selectedDiv.style.display = 'block';
      noSelectionDiv.style.display = 'none';
      
      // Update element info
      const elementName = inspector.querySelector('.element-name');
      const elementSelector = inspector.querySelector('.element-selector');
      const layerBadge = inspector.querySelector('.layer-badge');
      
      elementName.textContent = this.getElementDisplayName(this.selectedElement);
      elementSelector.textContent = this.getElementSelector(this.selectedElement);
      
      if (this.selectedLayer) {
        layerBadge.textContent = this.selectedLayer.label;
        layerBadge.style.display = 'inline-block';
      } else {
        layerBadge.style.display = 'none';
      }
      
      // Update effects list and parameters
      this.updateElementEffects();
      this.updateElementParameters();
    },

    updateElementEffects() {
      // Implementation for showing applied effects
      const effectsList = this.ui.inspector.querySelector('.effects-list');
      effectsList.innerHTML = '<p style="opacity: 0.7; font-size: 11px;">Effect detection coming soon...</p>';
    },

    updateElementParameters() {
      // Implementation for showing editable parameters
      const paramsList = this.ui.inspector.querySelector('.parameters-list');
      paramsList.innerHTML = '<p style="opacity: 0.7; font-size: 11px;">Parameter controls coming soon...</p>';
    },

    getElementDisplayName(element) {
      if (element.id) return `#${element.id}`;
      if (element.className) return `.${element.className.split(' ')[0]}`;
      return element.tagName.toLowerCase();
    },

    getElementSelector(element) {
      const parts = [];
      let current = element;
      
      while (current && current !== document.body) {
        let selector = current.tagName.toLowerCase();
        if (current.id) selector += `#${current.id}`;
        else if (current.className) selector += `.${current.className.split(' ')[0]}`;
        
        parts.unshift(selector);
        current = current.parentElement;
        
        if (parts.length > 3) break; // Limit depth
      }
      
      return parts.join(' > ');
    },

    toggleDevPanel() {
      const panel = this.ui.panel;
      panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    },

    toggleMinimize() {
      const content = this.ui.panel.querySelector('.dev-content');
      const tabs = this.ui.panel.querySelector('.dev-tabs');
      const isMinimized = content.style.display === 'none';
      
      content.style.display = isMinimized ? 'block' : 'none';
      tabs.style.display = isMinimized ? 'flex' : 'none';
    },

    openFXEditor(effect) {
      console.log('Opening FX editor for:', effect.label);
      // Implementation for opening parameter editor modal
    },

    // History system
    saveState(action, target, before, after) {
      const state = { action, target, before, after, timestamp: Date.now() };
      
      // Remove any states after current index
      this.history.stack = this.history.stack.slice(0, this.history.index + 1);
      
      // Add new state
      this.history.stack.push(state);
      this.history.index++;
      
      // Limit stack size
      if (this.history.stack.length > this.history.maxSize) {
        this.history.stack.shift();
        this.history.index--;
      }
    },

    undo() {
      if (this.history.index >= 0) {
        const state = this.history.stack[this.history.index];
        this.applyState(state, true); // Apply 'before' state
        this.history.index--;
        console.log('Undo:', state.action);
      }
    },

    redo() {
      if (this.history.index < this.history.stack.length - 1) {
        this.history.index++;
        const state = this.history.stack[this.history.index];
        this.applyState(state, false); // Apply 'after' state
        console.log('Redo:', state.action);
      }
    },

    applyState(state, useBefore) {
      // Implementation for applying saved states
      const values = useBefore ? state.before : state.after;
      // Apply the values to the target
    },

    // Presets system
    loadPresets() {
      try {
        const saved = localStorage.getItem('errl-dev-presets');
        if (saved) {
          this.presets.saved = JSON.parse(saved);
        }
      } catch (e) {
        console.warn('Failed to load presets:', e);
      }
    },

    savePreset(name, config) {
      this.presets.saved[name] = {
        ...config,
        timestamp: Date.now()
      };
      
      try {
        localStorage.setItem('errl-dev-presets', JSON.stringify(this.presets.saved));
      } catch (e) {
        console.warn('Failed to save preset:', e);
      }
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DevSystem.init());
  } else {
    DevSystem.init();
  }

  // Export to global scope for console access
  window.ErrlDevSystem = DevSystem;

})();