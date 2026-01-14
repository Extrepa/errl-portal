import React from 'react';

type Handle = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w';

interface TransformOverlayProps {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  onScaleStart: (handle: Handle, event: React.MouseEvent) => void;
  onRotateStart: (event: React.MouseEvent) => void;
}

export const TransformOverlay: React.FC<TransformOverlayProps> = ({
  x,
  y,
  width,
  height,
  rotation,
  onScaleStart,
  onRotateStart,
}) => {
  const handleSize = 8;
  const half = handleSize / 2;
  const rotHandleOffset = 18;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        width,
        height,
        transform: 'translateZ(0)',
      }}
    >
      <div
        className="absolute inset-0 border border-[#00FF9D]"
        style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center center' }}
      />
      <div
        className="absolute left-1/2"
        style={{
          top: -rotHandleOffset - handleSize,
          transform: 'translateX(-50%)',
          pointerEvents: 'auto',
        }}
        onMouseDown={onRotateStart}
      >
        <div
          className="rounded-full bg-[#7000FF] border border-[#121212]"
          style={{ width: handleSize, height: handleSize }}
        />
      </div>
      <div
        className="absolute"
        style={{ left: -half, top: -half, pointerEvents: 'auto' }}
        onMouseDown={(e) => onScaleStart('nw', e)}
      >
        <div className="bg-[#00FF9D] border border-[#121212]" style={{ width: handleSize, height: handleSize }} />
      </div>
      <div
        className="absolute"
        style={{ left: '50%', top: -half, pointerEvents: 'auto', transform: 'translateX(-50%)' }}
        onMouseDown={(e) => onScaleStart('n', e)}
      >
        <div className="bg-[#00FF9D] border border-[#121212]" style={{ width: handleSize, height: handleSize }} />
      </div>
      <div
        className="absolute"
        style={{ right: -half, top: -half, pointerEvents: 'auto' }}
        onMouseDown={(e) => onScaleStart('ne', e)}
      >
        <div className="bg-[#00FF9D] border border-[#121212]" style={{ width: handleSize, height: handleSize }} />
      </div>
      <div
        className="absolute"
        style={{ right: -half, top: '50%', pointerEvents: 'auto', transform: 'translateY(-50%)' }}
        onMouseDown={(e) => onScaleStart('e', e)}
      >
        <div className="bg-[#00FF9D] border border-[#121212]" style={{ width: handleSize, height: handleSize }} />
      </div>
      <div
        className="absolute"
        style={{ right: -half, bottom: -half, pointerEvents: 'auto' }}
        onMouseDown={(e) => onScaleStart('se', e)}
      >
        <div className="bg-[#00FF9D] border border-[#121212]" style={{ width: handleSize, height: handleSize }} />
      </div>
      <div
        className="absolute"
        style={{ left: '50%', bottom: -half, pointerEvents: 'auto', transform: 'translateX(-50%)' }}
        onMouseDown={(e) => onScaleStart('s', e)}
      >
        <div className="bg-[#00FF9D] border border-[#121212]" style={{ width: handleSize, height: handleSize }} />
      </div>
      <div
        className="absolute"
        style={{ left: -half, bottom: -half, pointerEvents: 'auto' }}
        onMouseDown={(e) => onScaleStart('sw', e)}
      >
        <div className="bg-[#00FF9D] border border-[#121212]" style={{ width: handleSize, height: handleSize }} />
      </div>
      <div
        className="absolute"
        style={{ left: -half, top: '50%', pointerEvents: 'auto', transform: 'translateY(-50%)' }}
        onMouseDown={(e) => onScaleStart('w', e)}
      >
        <div className="bg-[#00FF9D] border border-[#121212]" style={{ width: handleSize, height: handleSize }} />
      </div>
    </div>
  );
};
