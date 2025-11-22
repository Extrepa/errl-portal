import React, { useEffect } from 'react';

/**
 * HolographicCursorTrail
 * React wrapper that mounts the portal variant assets/logic.
 * Assumes a single instance per page (script expects #holographic-cursor-container id).
 */
export default function HolographicCursorTrail() {
  useEffect(() => {
    const key = 'errl-holographic-cursor-trail-script';
    if (!document.querySelector(`script[data-key="${key}"]`)) {
      const s = document.createElement('script');
      s.type = 'module';
      s.src = '/apps/projects/holographic-cursor-trail/script.js';
      s.setAttribute('data-key', key);
      document.body.appendChild(s);
    }
  }, []);

  return (
    <div id="holographic-cursor-container" />
  );
}
