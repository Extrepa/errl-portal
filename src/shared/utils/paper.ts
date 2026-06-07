// Paper.js utilities for SVG path operations
// Paper.js is already installed in package.json

import paper from 'paper';

export type BooleanOperation = 'union' | 'subtract' | 'intersect' | 'exclude';

let paperLoaded = false;
let paperCanvas: HTMLCanvasElement | null = null;

export async function loadPaperJS(): Promise<void> {
  if (paperLoaded) return;
  
  // Paper.js requires a canvas for initialization
  if (typeof window !== 'undefined') {
    // Create a temporary hidden canvas for Paper.js
    if (!paperCanvas) {
      paperCanvas = document.createElement('canvas');
      paperCanvas.width = 100;
      paperCanvas.height = 100;
      paperCanvas.style.display = 'none';
      paperCanvas.style.position = 'absolute';
      paperCanvas.style.top = '-9999px';
      document.body.appendChild(paperCanvas);
    }
    
    // Initialize Paper.js with the canvas
    if (!paper.project) {
      paper.setup(paperCanvas);
    }
  }
  
  paperLoaded = true;
}

// Helper removed - paths are created directly in functions

export async function performBooleanOperation(
  path1: string,
  path2: string,
  operation: BooleanOperation = 'union'
): Promise<string | null> {
  await loadPaperJS();
  
  if (!paperCanvas) {
    console.warn('Paper.js canvas not available');
    return path1;
  }
  
  try {
    // Create a temporary project for this operation
    const tempProject = new paper.Project(paperCanvas);
    
    // Paper.js Path constructor accepts path data directly
    const p1 = new paper.Path(path1);
    const p2 = new paper.Path(path2);
    
    if (!p1 || !p2 || !p1.segments || !p2.segments) {
      console.warn('Failed to parse one or both paths');
      tempProject.remove();
      return path1;
    }
    
    let result: paper.PathItem | null = null;
    
    switch (operation) {
      case 'union':
        result = p1.unite(p2);
        break;
      case 'subtract':
        result = p1.subtract(p2);
        break;
      case 'intersect':
        result = p1.intersect(p2);
        break;
      case 'exclude':
        result = p1.exclude(p2);
        break;
      default:
        console.warn('Unknown boolean operation:', operation);
        tempProject.remove();
        return path1;
    }
    
    if (!result || !(result instanceof paper.Path)) {
      console.warn('Boolean operation returned invalid result');
      tempProject.remove();
      return path1;
    }
    
    const pathData = (result as paper.Path).pathData || '';
    tempProject.remove();
    
    return pathData;
  } catch (error) {
    console.warn('Boolean operation failed:', error);
    return path1;
  }
}

export async function performBooleanOperationMultiple(
  paths: string[],
  operation: BooleanOperation = 'union'
): Promise<string | null> {
  if (paths.length === 0) return null;
  if (paths.length === 1) return paths[0];
  
  await loadPaperJS();
  
  if (!paperCanvas) {
    console.warn('Paper.js canvas not available');
    return paths[0] || null;
  }
  
  try {
    // Create a temporary project for this operation
    const tempProject = new paper.Project(paperCanvas);
    
    // Import all paths
    const paperPaths: paper.Path[] = [];
    for (const pathData of paths) {
      try {
        const path = new paper.Path(pathData);
        if (path && path.segments) {
          paperPaths.push(path);
        }
      } catch (error) {
        console.warn('Failed to parse path:', error);
      }
    }
    
    if (paperPaths.length === 0) {
      console.warn('No valid paths to merge');
      tempProject.remove();
      return paths[0] || null;
    }
    
    if (paperPaths.length === 1) {
      const pathData = paperPaths[0].pathData || '';
      tempProject.remove();
      return pathData;
    }
    
    // Start with first path, then combine with each subsequent path
    let result: paper.Path = paperPaths[0];
    
    for (let i = 1; i < paperPaths.length; i++) {
      const next = paperPaths[i];
      
      let operationResult: paper.PathItem | null = null;
      
      switch (operation) {
        case 'union':
          operationResult = result.unite(next);
          break;
        case 'subtract':
          operationResult = result.subtract(next);
          break;
        case 'intersect':
          operationResult = result.intersect(next);
          break;
        case 'exclude':
          operationResult = result.exclude(next);
          break;
      }
      
      if (!operationResult || !(operationResult instanceof paper.Path)) {
        console.warn('Boolean operation returned invalid result at step', i);
        tempProject.remove();
        return paths[0];
      }
      
      result = operationResult as paper.Path;
    }
    
    const pathData = result.pathData || '';
    tempProject.remove();
    
    return pathData;
  } catch (error) {
    console.warn('Multiple boolean operation failed:', error);
    return paths[0] || null;
  }
}

export async function simplifySvgPaths(svg: string, tolerance?: number): Promise<string> {
  await loadPaperJS();
  
  const tol = tolerance || 2.5;
  
  if (!paperCanvas) {
    console.warn('Paper.js canvas not available');
    return svg;
  }
  
  try {
    // Parse SVG to extract path elements
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    const pathElements = doc.querySelectorAll('path');
    
    if (pathElements.length === 0) {
      return svg;
    }
    
    // Create temporary project
    const tempProject = new paper.Project(paperCanvas);
    
    // Simplify each path
    pathElements.forEach((pathEl) => {
      const pathData = pathEl.getAttribute('d');
      if (!pathData) return;
      
      try {
        const paperPath = new paper.Path(pathData);
        if (paperPath && paperPath.segments) {
          paperPath.simplify(tol);
          const simplified = paperPath.pathData;
          if (simplified) {
            pathEl.setAttribute('d', simplified);
          }
        }
      } catch (error) {
        console.warn('Failed to simplify path:', error);
      }
    });
    
    tempProject.remove();
    
    return new XMLSerializer().serializeToString(doc);
  } catch (error) {
    console.warn('Path simplification failed:', error);
    return svg;
  }
}

export async function expandStrokeToFill(svg: string, width?: number): Promise<string> {
  await loadPaperJS();
  
  if (!paperCanvas) {
    console.warn('Paper.js canvas not available');
    return svg;
  }
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    const pathElements = doc.querySelectorAll('path');
    
    if (pathElements.length === 0) {
      return svg;
    }
    
    const tempProject = new paper.Project(paperCanvas);
    
    pathElements.forEach((pathEl) => {
      const strokeVal = pathEl.getAttribute('stroke');
      if (!strokeVal || strokeVal === 'none') return;
      
      const strokeWidthStr = pathEl.getAttribute('stroke-width') || String(width || 1);
      const strokeWidth = parseFloat(strokeWidthStr) || 1;
      const pathData = pathEl.getAttribute('d');
      if (!pathData) return;
      
      try {
        const originalPath = new paper.Path(pathData);
        if (!originalPath || !originalPath.segments || originalPath.length === 0) return;
        
        const halfWidth = strokeWidth / 2;
        const length = originalPath.length;
        // Sample every 2 pixels (minimum 10 steps, maximum 200 steps for performance)
        const stepSize = 2;
        const steps = Math.max(10, Math.min(200, Math.ceil(length / stepSize)));
        
        const leftPoints: paper.Point[] = [];
        const rightPoints: paper.Point[] = [];
        
        for (let i = 0; i <= steps; i++) {
          const offset = (i / steps) * length;
          const point = originalPath.getPointAt(offset);
          const normal = originalPath.getNormalAt(offset);
          if (point && normal) {
            const scaledNormal = normal.normalize().multiply(halfWidth);
            leftPoints.push(point.add(scaledNormal));
            rightPoints.push(point.subtract(scaledNormal));
          }
        }
        
        let outlinePath: paper.PathItem | null = null;
        
        if (originalPath.closed) {
          // Closed path: Subtract inner path from outer path
          const outer = new paper.Path();
          leftPoints.forEach(p => outer.add(p));
          outer.closed = true;
          
          const inner = new paper.Path();
          rightPoints.forEach(p => inner.add(p));
          inner.closed = true;
          
          outlinePath = outer.subtract(inner);
          outer.remove();
          inner.remove();
        } else {
          // Open path: build outline wrapping around caps
          const outline = new paper.Path();
          leftPoints.forEach(p => outline.add(p));
          // Wrap around end cap and add right points in reverse order
          for (let i = rightPoints.length - 1; i >= 0; i--) {
            outline.add(rightPoints[i]);
          }
          outline.closed = true;
          outlinePath = outline;
        }
        
        if (outlinePath && outlinePath.pathData) {
          pathEl.setAttribute('d', outlinePath.pathData);
          pathEl.removeAttribute('stroke');
          pathEl.removeAttribute('stroke-width');
          pathEl.setAttribute('fill', strokeVal);
        }
        
        originalPath.remove();
        if (outlinePath) outlinePath.remove();
        
      } catch (err) {
        console.warn('Failed to offset path:', err);
      }
    });
    
    tempProject.remove();
    return new XMLSerializer().serializeToString(doc);
  } catch (error) {
    console.warn('Stroke to fill expansion failed:', error);
    return svg;
  }
}
