/**
 * Alignment detection utilities for smart guides
 */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  alignment: 'left' | 'centerX' | 'right' | 'top' | 'centerY' | 'bottom';
  targets: string[]; // Object IDs that align
}

/**
 * Calculate bounding box for a scene object
 */
export const getObjectBounds = (
  x: number,
  y: number,
  scale: number,
  width: number = 100,
  height: number = 100
): BoundingBox => {
  return {
    x,
    y,
    width: width * scale,
    height: height * scale,
  };
};

/**
 * Get alignment points from a bounding box (left, center, right, top, middle, bottom)
 */
export const getAlignmentPoints = (bbox: BoundingBox) => {
  return {
    left: bbox.x,
    centerX: bbox.x + bbox.width / 2,
    right: bbox.x + bbox.width,
    top: bbox.y,
    centerY: bbox.y + bbox.height / 2,
    bottom: bbox.y + bbox.height,
  };
};

/**
 * Detect alignment between a moving object and other objects
 */
export const detectAlignment = (
  movingBounds: BoundingBox,
  otherBounds: BoundingBox[],
  threshold: number = 5
): AlignmentGuide[] => {
  const guides: AlignmentGuide[] = [];
  const movingPoints = getAlignmentPoints(movingBounds);

  otherBounds.forEach((other, index) => {
    const otherPoints = getAlignmentPoints(other);

    // Vertical alignments (X axis)
    const verticalAlignments = [
      { type: 'left' as const, pos: movingPoints.left, otherPos: otherPoints.left },
      { type: 'centerX' as const, pos: movingPoints.centerX, otherPos: otherPoints.centerX },
      { type: 'right' as const, pos: movingPoints.right, otherPos: otherPoints.right },
    ];

    verticalAlignments.forEach(({ type, pos, otherPos }) => {
      if (Math.abs(pos - otherPos) < threshold) {
        guides.push({
          type: 'vertical',
          position: otherPos,
          alignment: type,
          targets: [`obj_${index}`],
        });
      }
    });

    // Horizontal alignments (Y axis)
    const horizontalAlignments = [
      { type: 'top' as const, pos: movingPoints.top, otherPos: otherPoints.top },
      { type: 'centerY' as const, pos: movingPoints.centerY, otherPos: otherPoints.centerY },
      { type: 'bottom' as const, pos: movingPoints.bottom, otherPos: otherPoints.bottom },
    ];

    horizontalAlignments.forEach(({ type, pos, otherPos }) => {
      if (Math.abs(pos - otherPos) < threshold) {
        guides.push({
          type: 'horizontal',
          position: otherPos,
          alignment: type,
          targets: [`obj_${index}`],
        });
      }
    });
  });

  // Deduplicate guides at the same position
  const uniqueGuides = guides.reduce((acc, guide) => {
    const existing = acc.find(
      (g) => g.type === guide.type && Math.abs(g.position - guide.position) < 1
    );
    if (existing) {
      existing.targets.push(...guide.targets);
    } else {
      acc.push(guide);
    }
    return acc;
  }, [] as AlignmentGuide[]);

  return uniqueGuides;
};
