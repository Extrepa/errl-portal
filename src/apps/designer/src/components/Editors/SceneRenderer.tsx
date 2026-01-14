import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { getVibeEffect } from '../../engine/vibeLogic';
import { getGlobalTransform } from '../../utils/transformUtils';
import { calculateAnchoredPosition } from '../../utils/responsiveUtils';
import { parsePaletteReferences, injectPaletteCSS } from '../../utils/svgParser';
import { applyFiltersToSvg } from '../../utils/filterUtils';
import { applyMaskToSvg } from '../../utils/maskManager';
import type { Asset, Component, SceneObject, Project } from '../../state/types';
import { useGlobalTicker } from '../../hooks/useGlobalTicker';
import { useVibeStack } from '../../hooks/useVibeStack';
import type { VibeConfig } from '../../state/types';
import { useStore } from '../../state/useStore';
import { applyHueToSvg } from '../../utils/svgColorApply';
import { getOpacityFlicker } from '../../utils/opacityFlicker';

interface SceneRendererProps {
  asset: Asset;
  component?: Component;
  object: SceneObject;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  project?: Project; // Needed for recursive rendering of nested components
  containerWidth?: number; // Container width for anchor calculations
  containerHeight?: number; // Container height for anchor calculations
}

export const SceneRenderer: React.FC<SceneRendererProps> = ({
  asset,
  component,
  object,
  isSelected,
  onClick,
  onMouseDown,
  project,
  containerWidth,
  containerHeight,
}) => {
  // Determine which SVG data to use (state-specific or default)
  let svgData = asset.data;
  if (object.current_state && asset.states) {
    const state = asset.states.find((s) => s.name === object.current_state);
    if (state) {
      svgData = state.data;
    }
  }

  // Parse palette references and inject CSS if palettes exist
  if (project?.library.palettes && project.library.palettes.length > 0) {
    svgData = parsePaletteReferences(svgData, project.library.palettes);
    svgData = injectPaletteCSS(svgData, project.library.palettes);
  }

  // Apply component filters if component has filters
  if (component?.filters && component.filters.length > 0) {
    const filterId = `filter-${component.id}-${object.id}`;
    svgData = applyFiltersToSvg(svgData, component.filters, filterId);
  }

  // Apply mask if object has a mask
  if (object.maskId && project) {
    const maskObj = project.scene.layers
      .flatMap((layer) => layer.objects)
      .find((o) => o.id === object.maskId);
    
    if (maskObj) {
      const maskId = `mask-${object.id}`;
      const maskType = object.maskType || 'clipPath';
      svgData = applyMaskToSvg(svgData, maskId, maskType);
    }
  }

  // Calculate global transform considering parent hierarchy
  let globalTransform = project ? getGlobalTransform(object, project) : {
    x: object.x,
    y: object.y,
    scale: object.scale,
    rotation: object.rotation || 0,
  };

  // Apply anchor calculations if anchor is set and container dimensions are provided
  if (object.anchor && containerWidth && containerHeight) {
    const anchoredPos = calculateAnchoredPosition(object, containerWidth, containerHeight);
    globalTransform = { ...globalTransform, x: anchoredPos.x, y: anchoredPos.y };
  }

  // Use component's vibe if available, otherwise use asset's fx
  const vibeConfig = component?.vibe || asset.fx;
  const vibeEffect = vibeConfig ? getVibeEffect(vibeConfig) : null;
  const ComponentWrapper = vibeEffect ? motion.div : 'div';
  const motionProps = vibeEffect ? { animate: vibeEffect } : {};
  const tickerTime = useGlobalTicker();
  const vibePreviewEnabled = useStore((state) => state.vibePreviewEnabled);
  const vibeStack = useMemo<VibeConfig[]>(() => {
    if (component?.vibeStack && component.vibeStack.length > 0) return component.vibeStack;
    if (component?.vibe) return [component.vibe];
    if (asset.fxStack && asset.fxStack.length > 0) return asset.fxStack;
    if (asset.fx) return [asset.fx];
    return [];
  }, [component?.vibeStack, component?.vibe, asset.fxStack, asset.fx]);
  const stackedVibe = useVibeStack(vibeStack, vibePreviewEnabled ? tickerTime : 0);
  const flickerVibe = vibeStack.find((v) => v.type === 'opacity_flicker');
  const computedOpacity = flickerVibe ? getOpacityFlicker(flickerVibe.intensity) : undefined;
  const hueRotatedSvg = useMemo(() => {
    if (stackedVibe.hueRotate === undefined) return svgData;
    const target =
      vibeStack.find((v) => v.hueAmplitude && v.hueAmplitude !== 0)?.target || 'both';
    return applyHueToSvg(svgData, stackedVibe.hueRotate, target === undefined ? 'both' : target);
  }, [svgData, stackedVibe.hueRotate, vibeStack]);

  // Render nested children if component has children
  const renderNestedChildren = () => {
    if (!component?.children || !project) return null;

    return (
      <div className="absolute inset-0 pointer-events-none">
        {component.children.map((childId, index) => {
          // Check if childId is a component or asset
          const childComponent = project.library.components.find(c => c.id === childId);
          const childAsset = childComponent
            ? project.library.assets.find(a => a.id === childComponent.base_asset)
            : project.library.assets.find(a => a.id === childId);
          
          if (!childAsset) return null;

          // Create a temporary scene object for the child (relative positioning)
          const childObject: SceneObject = {
            id: `nested-${childId}-${index}`,
            ref: childId,
            x: 0, // Children are positioned relative to parent
            y: 0,
            z: index,
            scale: 1,
          };

          return (
            <SceneRenderer
              key={childId}
              asset={childAsset}
              component={childComponent}
              object={childObject}
              isSelected={false}
              onClick={() => {}}
              project={project}
            />
          );
        })}
      </div>
    );
  };

  // Check visibility and lock state
  const isVisible = object.visible ?? true;
  const isLocked = object.locked ?? false;

  if (!isVisible) {
    return null; // Don't render if not visible
  }

  return (
    <ComponentWrapper
      {...motionProps}
      onClick={onClick}
      onMouseDown={onMouseDown}
      className="absolute cursor-move select-none"
      style={{
        left: `${globalTransform.x + stackedVibe.translate.x}px`,
        top: `${globalTransform.y + stackedVibe.translate.y}px`,
        transform: `scale(${globalTransform.scale * stackedVibe.scale}) rotate(${globalTransform.rotation}deg)`,
        transformOrigin: 'center center',
        zIndex: object.z,
        outline: isSelected ? '2px solid #00FF9D' : 'none',
        outlineOffset: '2px',
        pointerEvents: isLocked ? 'none' : 'auto',
        opacity: isLocked ? 0.7 : computedOpacity ?? 1,
        filter: stackedVibe.hueRotate !== undefined && stackedVibe.appliedToStroke && stackedVibe.appliedToFill
          ? `hue-rotate(${stackedVibe.hueRotate}deg)`
          : undefined,
      }}
    > 
      <div
        dangerouslySetInnerHTML={{ __html: hueRotatedSvg }}
        style={
          stackedVibe.hueRotate !== undefined && (!stackedVibe.appliedToStroke || !stackedVibe.appliedToFill)
            ? {
                filter:
                  stackedVibe.hueRotate !== undefined && stackedVibe.appliedToStroke
                    ? `hue-rotate(${stackedVibe.hueRotate}deg)`
                    : undefined,
                WebkitFilter:
                  stackedVibe.hueRotate !== undefined && stackedVibe.appliedToStroke
                    ? `hue-rotate(${stackedVibe.hueRotate}deg)`
                    : undefined,
              }
            : undefined
        }
      />
      {renderNestedChildren()}
      {/* Lock indicator overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#000000]/20 pointer-events-none">
          <Lock size={24} className="text-yellow-400" />
        </div>
      )}
    </ComponentWrapper>
  );
};
