import React from 'react';

interface TransformHandlesProps {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  onTransform: (updates: { x?: number; y?: number; scale?: number; rotation?: number }) => void;
}

export const TransformHandles: React.FC<TransformHandlesProps> = ({
  x,
  y,
  scale,
  rotation,
  onTransform,
}) => {
  const handleSize = 8;
  const handleOffset = 20;

  return (
    <g>
      {/* Corner handles for scaling */}
      {[
        { x: -handleOffset, y: -handleOffset, cursor: 'nwse-resize' },
        { x: handleOffset, y: -handleOffset, cursor: 'nesw-resize' },
        { x: handleOffset, y: handleOffset, cursor: 'nwse-resize' },
        { x: -handleOffset, y: handleOffset, cursor: 'nesw-resize' },
      ].map((handle, i) => (
        <circle
          key={`corner-${i}`}
          cx={x + handle.x}
          cy={y + handle.y}
          r={handleSize / 2}
          fill="#00FF9D"
          stroke="#121212"
          strokeWidth={1}
          style={{ cursor: handle.cursor }}
          onMouseDown={(e) => {
            e.stopPropagation();
            // Scale transform logic would go here
          }}
        />
      ))}

      {/* Rotation handle */}
      <circle
        cx={x}
        cy={y - handleOffset - 10}
        r={handleSize / 2}
        fill="#7000FF"
        stroke="#121212"
        strokeWidth={1}
        style={{ cursor: 'grab' }}
        onMouseDown={(e) => {
          e.stopPropagation();
          // Rotation transform logic would go here
        }}
      />
    </g>
  );
};

