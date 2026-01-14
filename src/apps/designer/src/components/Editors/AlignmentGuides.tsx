import React from 'react';
import type { AlignmentGuide } from '../../utils/alignmentUtils';

interface AlignmentGuidesProps {
  guides: AlignmentGuide[];
  containerWidth: number;
  containerHeight: number;
}

export const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({
  guides,
  containerWidth,
  containerHeight,
}) => {
  if (guides.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10"
      style={{ width: containerWidth, height: containerHeight }}
    >
      {guides.map((guide, index) => {
        if (guide.type === 'vertical') {
          return (
            <line
              key={`v-${index}`}
              x1={guide.position}
              y1={0}
              x2={guide.position}
              y2={containerHeight}
              stroke="#FF00FF"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity={0.8}
            />
          );
        } else {
          return (
            <line
              key={`h-${index}`}
              x1={0}
              y1={guide.position}
              x2={containerWidth}
              y2={guide.position}
              stroke="#FF00FF"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity={0.8}
            />
          );
        }
      })}
    </svg>
  );
};

