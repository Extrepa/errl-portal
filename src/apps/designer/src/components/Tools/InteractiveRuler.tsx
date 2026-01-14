import React, { useState, useEffect, useRef } from 'react';
import { Ruler } from 'lucide-react';
import { distance } from '../../utils/measurementUtils';

interface Point {
  x: number;
  y: number;
}

interface InteractiveRulerProps {
  onMeasure?: (distance: number, angle: number) => void;
  onCancel?: () => void;
}

export const InteractiveRuler: React.FC<InteractiveRulerProps> = ({ onMeasure, onCancel }) => {
  const [points, setPoints] = useState<Point[]>([]);
  const [isActive, setIsActive] = useState(false);
  const canvasRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const handleClick = (e: MouseEvent) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (points.length === 0) {
        setPoints([{ x, y }]);
      } else if (points.length === 1) {
        const secondPoint = { x, y };
        setPoints([...points, secondPoint]);

        const dist = distance(points[0].x, points[0].y, x, y);
        const ang = Math.atan2(y - points[0].y, x - points[0].x) * (180 / Math.PI);
        onMeasure?.(dist, ang);
        
        // Reset after a moment
        setTimeout(() => {
          setPoints([]);
          setIsActive(false);
        }, 2000);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPoints([]);
        setIsActive(false);
        onCancel?.();
      }
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, points, onMeasure, onCancel]);

  const activate = () => {
    setPoints([]);
    setIsActive(true);
  };

  if (!isActive && points.length === 0) {
    return (
      <button
        onClick={activate}
        className="p-2 rounded text-[#888888] hover:bg-[#2D2D2D] hover:text-[#E0E0E0]"
        title="Interactive Ruler (Click two points to measure)"
      >
        <Ruler size={16} />
      </button>
    );
  }

  return (
    <div className="relative">
      {points.length > 0 && (
        <div className="absolute top-2 left-2 bg-[#1A1A1A] border border-[#333333] rounded p-2 z-50">
          <div className="text-xs text-[#E0E0E0]">
            {points.length === 1 ? 'Click second point...' : 'Measuring...'}
          </div>
          {points.length === 2 && (
            <div className="text-[10px] text-[#888888] mt-1">
              Distance: {distance(points[0].x, points[0].y, points[1].x, points[1].y).toFixed(2)}px
            </div>
          )}
        </div>
      )}
      <svg
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-40"
        style={{ width: '100%', height: '100%' }}
      >
        {points.length > 0 && (
          <circle
            cx={points[0].x}
            cy={points[0].y}
            r={4}
            fill="#00FF9D"
            stroke="#121212"
            strokeWidth={1}
          />
        )}
        {points.length === 2 && (
          <>
            <line
              x1={points[0].x}
              y1={points[0].y}
              x2={points[1].x}
              y2={points[1].y}
              stroke="#00FF9D"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <circle
              cx={points[1].x}
              cy={points[1].y}
              r={4}
              fill="#00FF9D"
              stroke="#121212"
              strokeWidth={1}
            />
          </>
        )}
      </svg>
    </div>
  );
};

