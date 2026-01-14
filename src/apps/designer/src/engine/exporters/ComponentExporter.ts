import type { Project, Asset, Component } from '../../state/types';

/**
 * Component Module Exporter
 * Exports a standalone React/JS component with SVG embedded and FX logic as props
 */
export const exportComponent = (
  project: Project,
  componentId: string
): string => {
  const component = project.library.components.find((c) => c.id === componentId);
  if (!component) {
    throw new Error(`Component ${componentId} not found`);
  }

  const asset = project.library.assets.find((a) => a.id === component.base_asset);
  if (!asset) {
    throw new Error(`Asset ${component.base_asset} not found`);
  }

  const componentName = component.name.replace(/[^a-zA-Z0-9]/g, '');
  const hasVibe = component.vibe || asset.fx;
  const hasEvents = component.events && component.events.length > 0;

  const reactComponent = `import React${hasEvents ? ', { useState, useEffect }' : ''} from 'react';
${hasVibe ? "import { motion } from 'framer-motion';" : ''}

interface ${componentName}Props {
  className?: string;
  style?: React.CSSProperties;
  scale?: number;
  rotation?: number;
  x?: number;
  y?: number;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  className = '',
  style = {},
  scale = 1,
  rotation = 0,
  x = 0,
  y = 0,
}) => {
  ${hasVibe ? generateVibeAnimation(component.vibe || asset.fx) : ''}
  ${hasEvents ? generateEventHandlers(component.events || []) : ''}
  
  const Component = ${hasVibe ? 'motion.div' : "'div'"};
  const motionProps = ${hasVibe ? 'vibeAnimation' : '{}'};
  const eventHandlers = ${hasEvents ? 'getEventHandlers()' : '{}'};

  return (
    <Component
      {...motionProps}
      {...eventHandlers}
      className={className}
      style={{
        ...style,
        transform: \`translate(\${x}px, \${y}px) scale(\${scale}) rotate(\${rotation}deg)\`,
      }}
      dangerouslySetInnerHTML={{ __html: \`${escapeHtml(asset.data)}\` }}
    />
  );
};
`;

  return reactComponent;
};

const generateVibeAnimation = (vibe: any): string => {
  if (!vibe || !vibe.type) return '';
  
  const animations: Record<string, string> = {
    pulse: `const vibeAnimation = {
    scale: [1, 1 + ${vibe.intensity || 0.5}, 1],
    transition: { duration: ${2 / (vibe.speed || 1)}, repeat: Infinity, ease: 'easeInOut' }
  };`,
    glow: `const vibeAnimation = {
    filter: [
      \`drop-shadow(0 0 0px ${vibe.color || '#00FF9D'})\`,
      \`drop-shadow(0 0 ${vibe.radius || 10}px ${vibe.color || '#00FF9D'})\`
    ],
    transition: { duration: 1.5, repeat: Infinity, yoyo: true, ease: 'easeInOut' }
  };`,
    float: `const vibeAnimation = {
    y: [0, -${vibe.amplitude || 10}, 0],
    transition: { duration: ${3 / (vibe.frequency || 1)}, repeat: Infinity, ease: 'easeInOut' }
  };`,
    shake: `const vibeAnimation = {
    x: [-${vibe.intensity || 5}, ${vibe.intensity || 5}, -${vibe.intensity || 5}, ${vibe.intensity || 5}, 0],
    y: [-${vibe.intensity || 5}, ${vibe.intensity || 5}, -${vibe.intensity || 5}, ${vibe.intensity || 5}, 0],
    transition: { duration: ${0.5 / (vibe.speed || 1)}, repeat: Infinity, ease: 'linear' }
  };`,
    rotation: `const vibeAnimation = {
    rotate: [0, 360],
    transition: { duration: ${2 / (vibe.speed || 1)}, repeat: Infinity, ease: 'linear' }
  };`,
  };

  return animations[vibe.type] || '';
};

const generateEventHandlers = (events: Component['events']): string => {
  if (!events || events.length === 0) return '';

  const handlers: string[] = [];
  const handlerBodies: string[] = [];

  events.forEach((event) => {
    switch (event.trigger) {
      case 'onClick':
        handlers.push(`const handleClick = () => {`);
        break;
      case 'onHover':
        handlers.push(`const handleMouseEnter = () => {`);
        break;
      case 'onTimer':
        handlers.push(`useEffect(() => {
          const timer = setInterval(() => {`);
        break;
      case 'onProximity':
        // Proximity detection would need more complex implementation
        handlers.push(`// Proximity event: ${event.params?.proximityDistance || 100}px`);
        return;
    }

    switch (event.action) {
      case 'playVibe':
        handlerBodies.push(`    // Play vibe: ${event.params?.vibeType || 'pulse'}`);
        break;
      case 'switchState':
        handlerBodies.push(`    // Switch to state: ${event.params?.stateName || ''}`);
        break;
      case 'emitSignal':
        handlerBodies.push(`    // Emit signal: ${event.params?.signalName || ''}`);
        break;
    }

    if (event.trigger === 'onTimer') {
      handlers.push(`          }, ${event.params?.timerDuration || 1000});
          return () => clearInterval(timer);
        }, []);`);
    } else {
      handlers.push(`  ${handlerBodies.join('\n  ')}`);
      handlers.push(`};`);
    }
  });

  const eventProps: string[] = [];
  events.forEach((event) => {
    switch (event.trigger) {
      case 'onClick':
        eventProps.push('onClick: handleClick');
        break;
      case 'onHover':
        eventProps.push('onMouseEnter: handleMouseEnter');
        break;
    }
  });

  return `
  ${handlers.join('\n')}
  
  const getEventHandlers = () => ({
    ${eventProps.join(',\n    ')}
  });
`;
};

const escapeHtml = (html: string): string => {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

