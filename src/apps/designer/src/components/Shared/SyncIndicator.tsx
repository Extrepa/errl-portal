import React from 'react';
import { Radio } from 'lucide-react';
import { useStore } from '../../state/useStore';

export const SyncIndicator: React.FC = () => {
  const { selection, project } = useStore();
  
  // Check if there's a selected asset or component that has instances on the stage
  const hasSync = React.useMemo(() => {
    if (!project) return false;
    
    // Check for component selection
    if (selection.componentId) {
      const component = project.library.components.find(c => c.id === selection.componentId);
      if (component) {
        // Check if this component is used in the scene
        const componentUsed = project.scene.layers.some(layer =>
          layer.objects.some(obj => obj.ref === selection.componentId)
        );
        if (componentUsed) return true;
        
        // Also check if the base asset is used
        return project.scene.layers.some(layer =>
          layer.objects.some(obj => obj.ref === component.base_asset)
        );
      }
    }
    
    // Check for asset selection
    if (selection.assetId) {
      // Check if this asset is used directly in the scene
      const assetUsed = project.scene.layers.some(layer =>
        layer.objects.some(obj => obj.ref === selection.assetId)
      );
      if (assetUsed) return true;
      
      // Also check if any components using this asset are in the scene
      const componentsUsingAsset = project.library.components.filter(
        c => c.base_asset === selection.assetId
      );
      return componentsUsingAsset.some(component =>
        project.scene.layers.some(layer =>
          layer.objects.some(obj => obj.ref === component.id)
        )
      );
    }
    
    return false;
  }, [selection.assetId, selection.componentId, project]);

  if (!hasSync) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-[#00FF9D]">
      <Radio size={12} className="animate-pulse" />
      <span>Live</span>
    </div>
  );
};

