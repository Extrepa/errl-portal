/**
 * Bezier Curve Math Utilities
 * Calculations for Bezier curve manipulation
 */

export interface BezierPoint {
  x: number;
  y: number;
}

export interface BezierCurve {
  start: BezierPoint;
  control1?: BezierPoint;
  control2?: BezierPoint;
  end: BezierPoint;
}

/**
 * Calculate point on cubic Bezier curve at t (0-1)
 */
export const bezierPoint = (
  t: number,
  p0: BezierPoint,
  p1: BezierPoint,
  p2: BezierPoint,
  p3: BezierPoint
): BezierPoint => {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
  };
};

/**
 * Calculate point on quadratic Bezier curve at t (0-1)
 */
export const quadraticBezierPoint = (
  t: number,
  p0: BezierPoint,
  p1: BezierPoint,
  p2: BezierPoint
): BezierPoint => {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  return {
    x: mt2 * p0.x + 2 * mt * t * p1.x + t2 * p2.x,
    y: mt2 * p0.y + 2 * mt * t * p1.y + t2 * p2.y,
  };
};

/**
 * Calculate distance between two points
 */
export const distance = (p1: BezierPoint, p2: BezierPoint): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Find closest point on Bezier curve to a given point
 */
export const closestPointOnBezier = (
  point: BezierPoint,
  curve: BezierCurve
): { t: number; point: BezierPoint } => {
  if (!curve.control1 || !curve.control2) {
    // Linear or quadratic - simplified calculation
    return { t: 0.5, point: curve.end };
  }

  // Binary search for closest point
  let minT = 0;
  let maxT = 1;
  let closestT = 0.5;
  let minDistance = Infinity;

  for (let i = 0; i < 20; i++) {
    const t = (minT + maxT) / 2;
    const curvePoint = bezierPoint(t, curve.start, curve.control1, curve.control2, curve.end);
    const dist = distance(point, curvePoint);

    if (dist < minDistance) {
      minDistance = dist;
      closestT = t;
    }

    // Refine search
    const t1 = (minT + t) / 2;
    const t2 = (t + maxT) / 2;
    const p1 = bezierPoint(t1, curve.start, curve.control1, curve.control2, curve.end);
    const p2 = bezierPoint(t2, curve.start, curve.control1, curve.control2, curve.end);
    const d1 = distance(point, p1);
    const d2 = distance(point, p2);

    if (d1 < d2) {
      maxT = t;
    } else {
      minT = t;
    }
  }

  return {
    t: closestT,
    point: bezierPoint(closestT, curve.start, curve.control1, curve.control2, curve.end),
  };
};

/**
 * Convert control points to mirrored (smooth) handles
 */
export const mirrorControlPoint = (
  anchor: BezierPoint,
  control: BezierPoint
): BezierPoint => {
  // Mirror the control point across the anchor
  return {
    x: anchor.x - (control.x - anchor.x),
    y: anchor.y - (control.y - anchor.y),
  };
};

