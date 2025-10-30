/**
 * Parameter Control System
 * Live parameter editing with real-time scrubbing and value synchronization
 */
(function() {
  'use strict';

  // Only initialize if dev system is present
  if (typeof window.ErrlDevSystem === 'undefined') return;

  const ParameterControls = {
    // Active parameter editors
    activeControls: new Map(),
    
    // Value change callbacks
    changeCallbacks: new Map(),
    
    // Scrubbing state
    scrubbing: {
      active: false,
      element: null,
      startValue: 0,
      startX: 0,
      sensitivity: 1
    },

    init() {
      this.bindGlobalEvents();
      console.log('📊 Parameter Controls initialized');
      return this;
    },

    // Create control UI for a parameter
    createControl(param, currentValue, onChange) {
      const control = document.createElement('div');
      control.className = 'param-control';
      control.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        padding: 8px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      `;

      // Parameter label
      const label = document.createElement('label');
      label.textContent = param.label || param.id;
      label.style.cssText = `
        flex: 0 0 80px;
        font-size: 11px;
        color: #d7e6ff;
        text-align: left;
      `;

      // Value display with scrubbing
      const valueDisplay = document.createElement('span');
      valueDisplay.className = 'param-value-display';
      valueDisplay.style.cssText = `
        flex: 0 0 60px;
        font-family: monospace;
        font-size: 10px;
        color: #00e5ff;
        text-align: right;
        cursor: ew-resize;
        padding: 2px 4px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 3px;
        user-select: none;
      `;

      // Input element based on parameter type
      let input;
      switch (param.type) {
        case 'range':
          input = document.createElement('input');
          input.type = 'range';
          input.min = param.min || 0;
          input.max = param.max || 100;
          input.step = param.step || 1;
          input.value = currentValue;
          input.style.cssText = `
            flex: 1;
            height: 20px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            outline: none;
          `;
          break;

        case 'number':
          input = document.createElement('input');
          input.type = 'number';
          input.min = param.min;
          input.max = param.max;
          input.step = param.step || 1;
          input.value = currentValue;
          input.style.cssText = `
            flex: 1;
            padding: 4px 8px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            color: #fff;
            font-size: 11px;
          `;
          break;

        case 'checkbox':
          input = document.createElement('input');
          input.type = 'checkbox';
          input.checked = currentValue;
          input.style.cssText = `
            flex: 0 0 auto;
            transform: scale(1.2);
          `;
          break;

        case 'select':
          input = document.createElement('select');
          input.style.cssText = `
            flex: 1;
            padding: 4px 8px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            color: #fff;
            font-size: 11px;
          `;
          if (param.options) {
            param.options.forEach(option => {
              const opt = document.createElement('option');
              opt.value = option.value;
              opt.textContent = option.label;
              if (option.value === currentValue) opt.selected = true;
              input.appendChild(opt);
            });
          }
          break;

        default:
          input = document.createElement('input');
          input.type = 'text';
          input.value = currentValue;
          input.style.cssText = `
            flex: 1;
            padding: 4px 8px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            color: #fff;
            font-size: 11px;
          `;
          break;
      }

      // Update value display
      const updateValueDisplay = (value) => {
        let displayValue = value;
        if (param.unit) displayValue += param.unit;
        if (param.type === 'range' || param.type === 'number') {
          displayValue = parseFloat(value).toFixed(param.step < 1 ? 2 : 0) + (param.unit || '');
        }
        valueDisplay.textContent = displayValue;
      };

      updateValueDisplay(currentValue);

      // Event handling
      const handleChange = (newValue) => {
        updateValueDisplay(newValue);
        onChange(newValue);
        
        // Save state for undo/redo if dev system is available
        if (window.ErrlDevSystem) {
          window.ErrlDevSystem.saveState('parameter-change', param.id, currentValue, newValue);
        }
        
        currentValue = newValue;
      };

      // Input change events
      input.addEventListener('input', (e) => {
        const value = param.type === 'checkbox' ? e.target.checked : e.target.value;
        handleChange(value);
      });

      // Value display scrubbing for numeric parameters
      if (param.type === 'range' || param.type === 'number') {
        this.enableScrubbing(valueDisplay, param, currentValue, handleChange);
      }

      // Assemble control
      control.appendChild(label);
      if (param.type !== 'checkbox') {
        control.appendChild(input);
        control.appendChild(valueDisplay);
      } else {
        control.appendChild(valueDisplay);
        control.appendChild(input);
      }

      return control;
    },

    // Enable mouse scrubbing for numeric values
    enableScrubbing(element, param, initialValue, onChange) {
      let scrubbing = false;
      let startValue = initialValue;
      let startX = 0;
      
      const sensitivity = this.calculateSensitivity(param);
      
      element.addEventListener('mousedown', (e) => {
        e.preventDefault();
        scrubbing = true;
        startValue = parseFloat(element.textContent) || 0;
        startX = e.clientX;
        
        element.style.background = 'rgba(0, 229, 255, 0.2)';
        element.style.cursor = 'ew-resize';
        
        document.body.style.cursor = 'ew-resize';
        
        const onMouseMove = (e) => {
          if (!scrubbing) return;
          
          const deltaX = e.clientX - startX;
          const deltaValue = deltaX * sensitivity;
          let newValue = startValue + deltaValue;
          
          // Clamp to parameter bounds
          if (param.min !== undefined) newValue = Math.max(param.min, newValue);
          if (param.max !== undefined) newValue = Math.min(param.max, newValue);
          
          // Round to step
          if (param.step) {
            newValue = Math.round(newValue / param.step) * param.step;
          }
          
          onChange(newValue);
        };
        
        const onMouseUp = () => {
          scrubbing = false;
          element.style.background = 'rgba(0, 0, 0, 0.3)';
          element.style.cursor = 'ew-resize';
          document.body.style.cursor = '';
          
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    },

    calculateSensitivity(param) {
      const range = (param.max || 100) - (param.min || 0);
      const basePixels = 200; // pixels to traverse full range
      
      let sensitivity = range / basePixels;
      
      // Adjust for step size
      if (param.step) {
        sensitivity = Math.max(sensitivity, param.step / 10);
      }
      
      return sensitivity;
    },

    // Create a parameter group (multiple related controls)
    createParameterGroup(title, parameters, values, onChange) {
      const group = document.createElement('div');
      group.className = 'param-group';
      group.style.cssText = `
        margin-bottom: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        overflow: hidden;
      `;

      // Group header
      const header = document.createElement('div');
      header.style.cssText = `
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.3);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        font-weight: bold;
        font-size: 11px;
        color: #00e5ff;
        display: flex;
        justify-content: space-between;
        align-items: center;
      `;

      const titleSpan = document.createElement('span');
      titleSpan.textContent = title;

      const resetBtn = document.createElement('button');
      resetBtn.textContent = 'Reset';
      resetBtn.className = 'dev-btn-mini';
      resetBtn.addEventListener('click', () => {
        // Reset all parameters to defaults
        Object.entries(parameters).forEach(([key, param]) => {
          const defaultValue = param.default !== undefined ? param.default : (param.min || 0);
          onChange(key, defaultValue);
        });
      });

      header.appendChild(titleSpan);
      header.appendChild(resetBtn);

      // Group content
      const content = document.createElement('div');
      content.style.cssText = `
        padding: 12px;
      `;

      // Create controls for each parameter
      Object.entries(parameters).forEach(([key, param]) => {
        const currentValue = values[key] !== undefined ? values[key] : (param.default || 0);
        const control = this.createControl(param, currentValue, (newValue) => {
          onChange(key, newValue);
        });
        content.appendChild(control);
      });

      group.appendChild(header);
      group.appendChild(content);

      return group;
    },

    // Create preset buttons for common parameter combinations
    createPresetButtons(presets, onApplyPreset) {
      const container = document.createElement('div');
      container.style.cssText = `
        display: flex;
        gap: 4px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      `;

      presets.forEach(preset => {
        const btn = document.createElement('button');
        btn.textContent = preset.name;
        btn.className = 'dev-btn-mini';
        btn.style.cssText = `
          background: rgba(123, 92, 255, 0.2);
          border-color: rgba(123, 92, 255, 0.4);
          color: #7b5cff;
        `;
        
        btn.addEventListener('click', () => {
          onApplyPreset(preset.values);
          btn.style.background = 'rgba(123, 92, 255, 0.4)';
          setTimeout(() => {
            btn.style.background = 'rgba(123, 92, 255, 0.2)';
          }, 200);
        });

        container.appendChild(btn);
      });

      return container;
    },

    // Animation controls for parameters
    createAnimationControls(paramKey, currentValue, bounds, onAnimate) {
      const container = document.createElement('div');
      container.style.cssText = `
        display: flex;
        gap: 4px;
        align-items: center;
        margin-top: 4px;
        padding: 4px 8px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
      `;

      // Animation toggle
      const animateBtn = document.createElement('button');
      animateBtn.textContent = '▶';
      animateBtn.className = 'dev-btn-mini';
      animateBtn.title = 'Animate parameter';
      
      let animating = false;
      let animationId = null;
      
      animateBtn.addEventListener('click', () => {
        animating = !animating;
        animateBtn.textContent = animating ? '⏸' : '▶';
        
        if (animating) {
          const animate = (time) => {
            const cycle = (time / 3000) % 1; // 3 second cycle
            const wave = Math.sin(cycle * Math.PI * 2) * 0.5 + 0.5;
            const value = bounds.min + (bounds.max - bounds.min) * wave;
            onAnimate(value);
            
            if (animating) {
              animationId = requestAnimationFrame(animate);
            }
          };
          animationId = requestAnimationFrame(animate);
        } else {
          if (animationId) cancelAnimationFrame(animationId);
        }
      });

      // Speed control
      const speedLabel = document.createElement('span');
      speedLabel.textContent = 'Speed:';
      speedLabel.style.cssText = 'font-size: 9px; opacity: 0.8;';
      
      const speedSlider = document.createElement('input');
      speedSlider.type = 'range';
      speedSlider.min = '0.1';
      speedSlider.max = '3';
      speedSlider.step = '0.1';
      speedSlider.value = '1';
      speedSlider.style.cssText = `
        width: 60px;
        height: 12px;
      `;

      container.appendChild(animateBtn);
      container.appendChild(speedLabel);
      container.appendChild(speedSlider);

      return container;
    },

    // Bind global keyboard shortcuts
    bindGlobalEvents() {
      document.addEventListener('keydown', (e) => {
        // R = Reset selected element parameters
        if (e.key === 'r' && window.ErrlDevSystem?.selectedElement) {
          e.preventDefault();
          this.resetElementParameters(window.ErrlDevSystem.selectedElement);
        }
        
        // C = Copy parameters
        if (e.key === 'c' && e.metaKey && window.ErrlDevSystem?.selectedElement) {
          e.preventDefault();
          this.copyElementParameters(window.ErrlDevSystem.selectedElement);
        }
        
        // V = Paste parameters
        if (e.key === 'v' && e.metaKey && window.ErrlDevSystem?.selectedElement) {
          e.preventDefault();
          this.pasteElementParameters(window.ErrlDevSystem.selectedElement);
        }
      });
    },

    // Integration with dev system
    integrateWithDevSystem() {
      if (!window.ErrlDevSystem) return;

      // Override the parameter panel update
      const originalUpdateParams = window.ErrlDevSystem.updateElementParameters;
      
      window.ErrlDevSystem.updateElementParameters = () => {
        const paramsList = window.ErrlDevSystem.ui.inspector.querySelector('.parameters-list');
        if (!paramsList || !window.ErrlDevSystem.selectedElement) return;

        paramsList.innerHTML = '';

        // Get the layer for the selected element
        const layer = window.ErrlDevSystem.selectedLayer;
        if (!layer) {
          paramsList.innerHTML = '<p style="opacity: 0.7; font-size: 11px;">No layer data available</p>';
          return;
        }

        // Create parameter groups for each available effect type
        const availableEffects = layer.effects || [];
        
        availableEffects.forEach(effectId => {
          const effect = window.ErrlDevSystem.fxRegistry.get(effectId);
          if (!effect) return;

          // Get current values (integrate with existing controllers)
          const currentValues = this.getCurrentValues(effectId, window.ErrlDevSystem.selectedElement);
          
          const group = this.createParameterGroup(
            effect.label,
            effect.parameters,
            currentValues,
            (paramKey, newValue) => {
              this.applyParameterChange(effectId, paramKey, newValue, window.ErrlDevSystem.selectedElement);
            }
          );

          paramsList.appendChild(group);
        });

        if (availableEffects.length === 0) {
          paramsList.innerHTML = '<p style="opacity: 0.7; font-size: 11px;">No effects available for this layer</p>';
        }
      };
    },

    getCurrentValues(effectId, element) {
      // Integration point with existing effect systems
      const values = {};
      
      if (effectId === 'hue' && window.ErrlHueController) {
        const layer = window.ErrlDevSystem.getLayerForElement(element);
        if (layer && window.ErrlHueController.layers[layer.id]) {
          const layerState = window.ErrlHueController.layers[layer.id];
          values.hue = layerState.hue;
          values.saturation = layerState.saturation;
          values.intensity = layerState.intensity;
        }
      }
      
      return values;
    },

    applyParameterChange(effectId, paramKey, newValue, element) {
      // Integration point with existing effect systems
      const effect = window.ErrlDevSystem?.fxRegistry.get(effectId);
      if (effect && effect.apply) {
        const allParams = this.getCurrentValues(effectId, element);
        allParams[paramKey] = newValue;
        effect.apply(element, allParams);
      }
    },

    // Parameter clipboard
    parameterClipboard: null,

    copyElementParameters(element) {
      // Implementation for copying all parameters of an element
      this.parameterClipboard = this.extractElementParameters(element);
      console.log('📋 Copied parameters for', element);
    },

    pasteElementParameters(element) {
      if (!this.parameterClipboard) {
        console.warn('📋 No parameters in clipboard');
        return;
      }
      
      // Apply clipboard parameters to element
      this.applyElementParameters(element, this.parameterClipboard);
      console.log('📋 Pasted parameters to', element);
    },

    extractElementParameters(element) {
      // Extract all current parameter values from an element
      const params = {};
      
      // Get computed styles and properties
      const styles = window.getComputedStyle(element);
      params.transform = element.style.transform;
      params.filter = element.style.filter;
      params.opacity = styles.opacity;
      
      return params;
    },

    applyElementParameters(element, params) {
      // Apply parameter set to element
      Object.entries(params).forEach(([key, value]) => {
        if (key === 'transform') element.style.transform = value;
        if (key === 'filter') element.style.filter = value;
        if (key === 'opacity') element.style.opacity = value;
      });
    },

    resetElementParameters(element) {
      // Reset element to default state
      element.style.transform = '';
      element.style.filter = '';
      element.style.opacity = '';
      console.log('🔄 Reset parameters for', element);
    }
  };

  // Auto-initialize when dev system is ready
  if (window.ErrlDevSystem) {
    ParameterControls.init();
    ParameterControls.integrateWithDevSystem();
  } else {
    // Wait for dev system
    document.addEventListener('DOMContentLoaded', () => {
      if (window.ErrlDevSystem) {
        ParameterControls.init();
        ParameterControls.integrateWithDevSystem();
      }
    });
  }

  // Export
  window.ErrlParameterControls = ParameterControls;

})();