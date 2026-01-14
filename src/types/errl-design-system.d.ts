declare module '@errl-design-system' {
  import { ReactNode } from 'react';
  
  export interface EffectMode {
    // Add effect mode types if needed
  }
  
  export interface ErrlWrapperProps {
    children: ReactNode;
    componentId?: string;
    effect?: EffectMode;
    className?: string;
    style?: React.CSSProperties;
    applyBorder?: boolean;
    applyGlow?: boolean;
    applyBackground?: boolean;
  }
  
  export function ErrlWrapper(props: ErrlWrapperProps): JSX.Element;
  
  export interface ThemeControlsProps {
    compact?: boolean;
  }
  
  export function ThemeControls(props: ThemeControlsProps): JSX.Element;
  
  export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element;
  
  export function useErrlTheme(): any;
  export function useErrlThemeContext(): any;
}

declare module '@errl-design-system/styles/errlDesignSystem.css' {
  const content: string;
  export default content;
}
