import React, { useEffect, useState } from 'react';
import { useStore } from '../../state/useStore';
import { X } from 'lucide-react';

interface ScreensaverModeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScreensaverMode: React.FC<ScreensaverModeProps> = ({ isOpen, onClose }) => {
  const { project, timeline } = useStore();
  const [currentObjectIndex, setCurrentObjectIndex] = useState(0);

  useEffect(() => {
    if (!isOpen || !project) return;

    // Cycle through scene objects
    const allObjects = project.scene.layers.flatMap((layer) => layer.objects);
    if (allObjects.length === 0) return;

    const interval = setInterval(() => {
      setCurrentObjectIndex((prev) => (prev + 1) % allObjects.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [isOpen, project]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyPress);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const allObjects = project.scene.layers.flatMap((layer) => layer.objects);
  const currentObject = allObjects[currentObjectIndex];

  if (!currentObject) {
    return (
      <div className="fixed inset-0 bg-[#121212] z-[100] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#888888] mb-4">No objects in scene</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#00FF9D] text-[#121212] rounded hover:bg-[#00E08C]"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Get the component or asset for the current object
  const component = project.library.components.find((c) => c.id === currentObject.ref);
  const asset = project.library.assets.find((a) => a.id === currentObject.ref);

  const svgData = component?.base_asset
    ? project.library.assets.find((a) => a.id === component.base_asset)?.data || asset?.data
    : asset?.data;

  return (
    <div className="fixed inset-0 bg-[#121212] z-[100] flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-[#1A1A1A]/80 border border-[#333333] rounded text-[#E0E0E0] hover:bg-[#2D2D2D] z-10"
        title="Close (Esc)"
      >
        <X size={20} />
      </button>

      {/* Object Display */}
      <div className="w-full h-full flex items-center justify-center">
        {svgData && (
          <div
            className="max-w-[90vw] max-h-[90vh]"
            style={{
              transform: `scale(${currentObject.scale || 1}) rotate(${currentObject.rotation || 0}deg)`,
            }}
            dangerouslySetInnerHTML={{ __html: svgData }}
          />
        )}
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {allObjects.map((_, index) => (
          <div
            key={index}
            className={`h-1 w-8 rounded transition-colors ${
              index === currentObjectIndex ? 'bg-[#00FF9D]' : 'bg-[#333333]'
            }`}
          />
        ))}
      </div>

      {/* Object Info */}
      <div className="absolute bottom-4 right-4 bg-[#1A1A1A]/80 border border-[#333333] rounded p-3">
        <div className="text-xs text-[#E0E0E0]">
          {component?.name || asset?.name || currentObject.ref || 'Unnamed Object'}
        </div>
        <div className="text-[10px] text-[#888888] mt-1">
          {currentObjectIndex + 1} / {allObjects.length}
        </div>
      </div>
    </div>
  );
};

