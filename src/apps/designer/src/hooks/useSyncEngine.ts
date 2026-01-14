import { useEffect, useMemo } from 'react';
import { useStore } from '../state/useStore';

/**
 * Sync Engine Hook
 * 
 * Implements the Master-Instance relationship:
 * - Library assets are the source of truth
 * - Library components are also sources of truth
 * - Scene objects reference assets or components by ID
 * - When asset data or component vibe changes, all scene instances update automatically
 */
export const useSyncEngine = () => {
  const { project, updateAssetData } = useStore();

  // Memoized selector to get all scene objects that reference a specific asset
  const getSceneInstancesForAsset = useMemo(() => {
    return (assetId: string) => {
      if (!project) return [];
      
      return project.scene.layers.flatMap((layer) =>
        layer.objects
          .filter((obj) => obj.ref === assetId)
          .map((obj) => ({ ...obj, layerId: layer.id }))
      );
    };
  }, [project]);

  // Memoized selector to get all scene objects that reference a specific component
  const getSceneInstancesForComponent = useMemo(() => {
    return (componentId: string) => {
      if (!project) return [];
      
      return project.scene.layers.flatMap((layer) =>
        layer.objects
          .filter((obj) => obj.ref === componentId)
          .map((obj) => ({ ...obj, layerId: layer.id }))
      );
    };
  }, [project]);

  // Memoized selector to watch library changes (assets and components)
  const watchLibraryChanges = useMemo(() => {
    if (!project) return null;
    
    // Return a map of asset IDs to their data and component IDs to their vibes
    const assetMap = new Map(
      project.library.assets.map((asset) => [asset.id, asset.data])
    );
    const componentMap = new Map(
      project.library.components.map((component) => [component.id, component.vibe])
    );
    
    return { assets: assetMap, components: componentMap };
  }, [project?.library.assets, project?.library.components]);

  // This hook can be extended with debouncing and ghosting logic
  return {
    getSceneInstancesForAsset,
    getSceneInstancesForComponent,
    watchLibraryChanges,
    updateAssetData,
  };
};

