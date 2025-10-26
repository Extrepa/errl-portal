// Global ambient declarations for browser runtime globals used by legacy FX modules
export {}; // ensure this file is treated as a module

declare const PIXI: any;

declare global {
  interface ErrlFXNS {
    Manager: any;
    Bubbles?: any;
    _registry?: Map<string, any>;
  }
  interface Window {
    ErrlFX: ErrlFXNS;
    ErrlHueFilter: any;
    ErrlHueController: any;
  }
}
