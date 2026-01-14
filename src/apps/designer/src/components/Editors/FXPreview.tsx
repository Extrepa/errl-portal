import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../state/useStore';
import { getVibeEffect } from '../../engine/vibeLogic';

export const FXPreview: React.FC = () => {
  const { selection, project } = useStore();
  const selectedAsset = selection.assetId 
    ? project?.library.assets.find(a => a.id === selection.assetId)
    : null;

  if (!selectedAsset || !selectedAsset.fx) {
    return null;
  }

  const vibeEffect = getVibeEffect(selectedAsset.fx);
  if (!vibeEffect) {
    return null;
  }

  return (
    <motion.div
      animate={vibeEffect}
      style={{
        display: 'inline-block',
      }}
      dangerouslySetInnerHTML={{ __html: selectedAsset.data }}
    />
  );
};

