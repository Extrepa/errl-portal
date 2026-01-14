/**
 * SVG Path Parser
 * Parses SVG path data into command objects for node editing
 */

export interface PathPoint {
  x: number;
  y: number;
  type?: 'anchor' | 'control';
  controlIn?: { x: number; y: number }; // Incoming control point
  controlOut?: { x: number; y: number }; // Outgoing control point
}

export interface PathCommand {
  type: 'M' | 'L' | 'C' | 'Q' | 'Z' | 'A' | 'H' | 'V' | 'S' | 'T';
  points: PathPoint[];
  raw: string; // Original command string
}

/**
 * Parse SVG path data into command objects
 */
export const parseSvgPath = (pathData: string): PathCommand[] => {
  if (!pathData || pathData.trim() === '') {
    return [];
  }

  const commands: PathCommand[] = [];
  
  // Match path commands and their parameters
  // This regex matches: command letter followed by numbers/spaces/commas
  const commandRegex = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
  let match;

  while ((match = commandRegex.exec(pathData)) !== null) {
    const commandType = match[1].toUpperCase() as PathCommand['type'];
    const params = match[2].trim();
    
    if (commandType === 'Z') {
      // Close path - no parameters
      commands.push({
        type: 'Z',
        points: [],
        raw: match[0],
      });
      continue;
    }

    // Parse numbers from parameters
    const numbers = params
      .split(/[\s,]+/)
      .filter(s => s.trim() !== '')
      .map(Number)
      .filter(n => !isNaN(n));

    const points: PathPoint[] = [];

    switch (commandType) {
      case 'M': // Move To
      case 'L': // Line To
        // Each pair is a point
        for (let i = 0; i < numbers.length; i += 2) {
          if (i + 1 < numbers.length) {
            points.push({
              x: numbers[i],
              y: numbers[i + 1],
              type: 'anchor',
            });
          }
        }
        break;

      case 'H': // Horizontal Line
        points.push({
          x: numbers[0] || 0,
          y: 0, // Will be filled from previous point
          type: 'anchor',
        });
        break;

      case 'V': // Vertical Line
        points.push({
          x: 0, // Will be filled from previous point
          y: numbers[0] || 0,
          type: 'anchor',
        });
        break;

      case 'C': // Cubic Bezier
        // Format: x1 y1 x2 y2 x y (two control points, then anchor)
        for (let i = 0; i < numbers.length; i += 6) {
          if (i + 5 < numbers.length) {
            points.push({
              x: numbers[i + 4],
              y: numbers[i + 5],
              type: 'anchor',
              controlIn: { x: numbers[i], y: numbers[i + 1] },
              controlOut: { x: numbers[i + 2], y: numbers[i + 3] },
            });
          }
        }
        break;

      case 'Q': // Quadratic Bezier
        // Format: x1 y1 x y (one control point, then anchor)
        for (let i = 0; i < numbers.length; i += 4) {
          if (i + 3 < numbers.length) {
            points.push({
              x: numbers[i + 2],
              y: numbers[i + 3],
              type: 'anchor',
              controlIn: { x: numbers[i], y: numbers[i + 1] },
            });
          }
        }
        break;

      case 'S': // Smooth Cubic Bezier (continues previous curve)
        // Format: x2 y2 x y (one control point, then anchor)
        for (let i = 0; i < numbers.length; i += 4) {
          if (i + 3 < numbers.length) {
            points.push({
              x: numbers[i + 2],
              y: numbers[i + 3],
              type: 'anchor',
              controlOut: { x: numbers[i], y: numbers[i + 1] },
            });
          }
        }
        break;

      case 'T': // Smooth Quadratic Bezier
        // Format: x y (anchor point, control inferred)
        for (let i = 0; i < numbers.length; i += 2) {
          if (i + 1 < numbers.length) {
            points.push({
              x: numbers[i],
              y: numbers[i + 1],
              type: 'anchor',
            });
          }
        }
        break;

      case 'A': // Arc
        // Format: rx ry x-axis-rotation large-arc-flag sweep-flag x y
        for (let i = 0; i < numbers.length; i += 7) {
          if (i + 6 < numbers.length) {
            points.push({
              x: numbers[i + 5],
              y: numbers[i + 6],
              type: 'anchor',
            });
          }
        }
        break;
    }

    if (points.length > 0) {
      commands.push({
        type: commandType,
        points,
        raw: match[0],
      });
    }
  }

  return commands;
};

/**
 * Rebuild SVG path data from command objects
 */
export const buildSvgPath = (commands: PathCommand[]): string => {
  return commands
    .map((cmd) => {
      if (cmd.type === 'Z') {
        return 'Z';
      }

      const parts: string[] = [cmd.type];

      cmd.points.forEach((point) => {
        if (cmd.type === 'C') {
          // Cubic Bezier: x1 y1 x2 y2 x y
          if (point.controlIn && point.controlOut) {
            parts.push(
              `${point.controlIn.x} ${point.controlIn.y} ${point.controlOut.x} ${point.controlOut.y} ${point.x} ${point.y}`
            );
          }
        } else if (cmd.type === 'Q') {
          // Quadratic Bezier: x1 y1 x y
          if (point.controlIn) {
            parts.push(`${point.controlIn.x} ${point.controlIn.y} ${point.x} ${point.y}`);
          }
        } else if (cmd.type === 'S') {
          // Smooth Cubic: x2 y2 x y
          if (point.controlOut) {
            parts.push(`${point.controlOut.x} ${point.controlOut.y} ${point.x} ${point.y}`);
          }
        } else if (cmd.type === 'H') {
          // Horizontal: x
          parts.push(`${point.x}`);
        } else if (cmd.type === 'V') {
          // Vertical: y
          parts.push(`${point.y}`);
        } else {
          // M, L, T, A: x y
          parts.push(`${point.x} ${point.y}`);
        }
      });

      return parts.join(' ');
    })
    .join(' ');
};
