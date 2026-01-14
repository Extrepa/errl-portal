import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../state/useStore';
import { SVGEditor } from './SVGEditor';
import { FXToolbar } from '../Toolbars/FXToolbar';

export const FocusWindow: React.FC = () => {
  const { mode } = useStore();
  const [showMinimap, setShowMinimap] = useState(false);

  useEffect(() => {
    // Show minimap in SVG Edit mode
    setShowMinimap(mode.type === 'svg-edit');
  }, [mode.type]);

  // Switch between SVG Editor and FX Lab based on mode
  if (mode.type === 'svg-edit' || mode.type === 'fx-lab') {
    const borderColor = mode.type === 'svg-edit' ? '#00FF9D' : '#FF007A';
    return (
      <motion.div
        className="flex flex-col relative"
        style={{ 
          width: '40%',
          borderRight: `1px solid ${borderColor}`,
          boxShadow: `0 0 1px ${borderColor}`,
        }}
        initial={false}
        animate={{ width: mode.type === 'svg-edit' ? '40%' : '40%' }}
        transition={{ duration: 0.3 }}
      >
        {mode.type === 'fx-lab' && <FXToolbar />}
        <SVGEditor />
        
        {/* Mini-map in SVG Edit mode */}
        <AnimatePresence>
          {showMinimap && mode.type === 'svg-edit' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-4 right-4 w-32 h-20 bg-[#1E1E1E] border border-[#333333] rounded overflow-hidden"
              style={{ zIndex: 100 }}
            >
              <div className="w-full h-full bg-[#121212] opacity-50" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <div className="flex-1 bg-[#1E1E1E] border-r border-[#333333] flex flex-col overflow-hidden">
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[#888888] text-sm">Focus Window - Select a mode</p>
      </div>
    </div>
  );
};

