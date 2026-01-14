// Types based on ARCH_DATA_SCHEMA.md

export type AssetType = 'svg' | 'png' | 'component';

export interface AudioReactiveConfig {
  parameter: string; // e.g., 'intensity', 'speed', 'radius'
  frequencyBand: 'bass' | 'mid' | 'treble';
  multiplier: number;
  smoothing?: number;
}

export interface VibeConfig {
  type?: 'pulse' | 'glow' | 'float' | 'shake' | 'rotation' | 'opacity_flicker';
  intensity?: number;
  speed?: number;
  frequency?: number;
  phaseOffset?: number;
  hueAmplitude?: number; // For color-cycle vibes
  target?: 'fill' | 'stroke' | 'both';
  color?: string;
  radius?: number;
  amplitude?: number;
  audioReactive?: AudioReactiveConfig;
}

export interface AssetState {
  name: string;
  data: string; // SVG string for this state
}

export interface AssetVersion {
  id: string;
  timestamp: number;
  data: string; // SVG string for this version
  name?: string; // Optional version name
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  data: string; // SVG string or image data URL (default state)
  fx?: VibeConfig;
  fxStack?: VibeConfig[];
  tags?: string[];
  states?: AssetState[]; // Multi-state support
  history?: AssetVersion[]; // Version history
}

export type EventTrigger = 'onHover' | 'onClick' | 'onProximity' | 'onTimer';
export type EventAction = 'playVibe' | 'switchState' | 'emitSignal';

export interface ComponentEvent {
  id: string;
  trigger: EventTrigger;
  action: EventAction;
  params?: {
    vibeType?: string;
    stateName?: string;
    signalName?: string;
    timerDuration?: number;
    proximityDistance?: number;
  };
}

export interface StateMachineState {
  id: string;
  name: string;
  actions?: {
    playVibe?: string;
    switchAssetState?: string;
  };
}

export interface StateMachineTransition {
  id: string;
  from: string; // State ID
  to: string; // State ID
  trigger: {
    event?: string;
    condition?: string;
  };
}

export interface StateMachine {
  states: StateMachineState[];
  transitions: StateMachineTransition[];
  initialState: string; // State ID
}

export interface Component {
  id: string;
  name: string;
  base_asset: string; // Reference to asset ID
  logic?: string; // Vibe check script reference
  vibe?: VibeConfig;
  vibeStack?: VibeConfig[];
  tags?: string[];
  children?: string[]; // Array of component/asset IDs for nested components
  events?: ComponentEvent[]; // Event triggers and actions
  stateMachine?: StateMachine; // Interaction state machine
  filters?: FilterDefinition[]; // SVG filters applied to component
}

// Filter definition for components (imported from FilterStack or defined here)
export interface FilterDefinition {
  id: string;
  type: 'blur' | 'shadow' | 'glow' | 'prismatic' | 'colorMatrix';
  enabled: boolean;
  params: Record<string, number | string>;
}

export interface AnchorConfig {
  x: 'left' | 'center' | 'right';
  y: 'top' | 'middle' | 'bottom';
}

export interface SceneObject {
  id: string;
  ref: string; // Reference to asset or component ID
  x: number;
  y: number;
  z: number;
  scale: number;
  rotation?: number;
  group_id?: string; // Reference to group ID if part of a group
  current_state?: string; // Name of the asset state to use
  parent_id?: string; // Reference to parent SceneObject ID for hierarchy
  anchor?: AnchorConfig; // Anchor point for responsive layout
  visible?: boolean; // Visibility state (default: true)
  locked?: boolean; // Lock state (default: false)
  maskId?: string; // Reference to mask shape object ID
  maskType?: 'clipPath' | 'mask'; // Type of masking
}

export interface Group {
  id: string;
  name: string;
  object_ids: string[]; // IDs of objects in this group
}

export interface SceneLayer {
  id: string;
  name?: string;
  objects: SceneObject[];
}

export interface ProjectMeta {
  name: string;
  resolution: [number, number];
  fps?: number;
}

export interface VibeTemplate {
  id: string;
  name: string;
  vibe: VibeConfig;
  tags?: string[];
  stacked?: VibeConfig[];
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: Record<string, string>; // e.g., { "primary_red": "#ff0000", "secondary_blue": "#0000ff" }
}

export interface Prefab {
  id: string;
  name: string;
  sceneGraph: {
    layers: SceneLayer[];
    objects: SceneObject[];
  };
}

export interface ProjectLibrary {
  assets: Asset[];
  components: Component[];
  vibe_templates?: VibeTemplate[];
  palettes?: ColorPalette[];
  prefabs?: Prefab[];
}

export interface ProjectScene {
  layers: SceneLayer[];
  background?: string;
  groups?: Group[]; // Groups of objects
}

export interface Project {
  meta: ProjectMeta;
  library: ProjectLibrary;
  scene: ProjectScene;
}

// Store state
export interface AppMode {
  type: 'svg-edit' | 'fx-lab' | 'scene-maker' | 'export';
}

export interface Selection {
  assetId?: string;
  componentId?: string;
  sceneObjectId?: string;
  layerId?: string;
  selectedObjectIds?: string[]; // For multi-select
}

// Grid settings
export interface GridSettings {
  enabled: boolean;
  size: 8 | 16 | 32;
  visible: boolean;
}

// Tool types
export type ToolType = 
  | 'select'
  | 'pen'
  | 'node-editor'
  | 'rectangle'
  | 'circle'
  | 'star'
  | 'text'
  | 'line'
  | 'hand'
  | 'fit-to-view'
  | 'boolean-union'
  | 'boolean-subtract'
  | 'boolean-intersect'
  | 'boolean-exclude'
  | 'measurement'
  | null;

// Node types for path editing
export type NodeType = 'sharp' | 'smooth' | 'broken';

// Timeline and Animation
export interface TimelineState {
  isPlaying: boolean;
  currentTime: number; // Current time in seconds
  duration: number; // Total duration in seconds
  playbackSpeed: number; // Speed multiplier (0.25, 0.5, 1, 2, 4)
  loop: boolean;
}

export interface Keyframe {
  id: string;
  time: number;
  value: number | string;
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface PropertyTrack {
  property: 'x' | 'y' | 'scale' | 'rotation' | 'opacity' | 'color';
  keyframes: Keyframe[];
}
