import React, { useEffect } from 'react';

/**
 * BubbleMouseTrail
 * React wrapper that mounts the portal variant assets/logic.
 * Assumes a single instance per page (script expects #bubbling-cursor-container id).
 */
export default function BubbleMouseTrail() {
  useEffect(() => {
    const key = 'errl-bubble-mouse-trail-script';
    if (!document.querySelector(`script[data-key="${key}"]`)) {
      const s = document.createElement('script');
      s.type = 'module';
      s.src = '/apps/projects/bubble-mouse-trail/script.js';
      s.setAttribute('data-key', key);
      document.body.appendChild(s);
    }
  }, []);

  return (
    <div id="bubbling-cursor-container" />
  );
}
