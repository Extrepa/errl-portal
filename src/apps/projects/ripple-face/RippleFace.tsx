import React, { useEffect } from 'react';

/**
 * RippleFace
 * React wrapper that mounts the portal variant assets/logic.
 * Assumes a single instance per page (script expects #e img and #fx canvas ids).
 */
export default function RippleFace() {
  useEffect(() => {
    const key = 'errl-ripple-face-script';
    if (!document.querySelector(`script[data-key="${key}"]`)) {
      const s = document.createElement('script');
      s.type = 'module';
      s.src = '/apps/projects/ripple-face/script.js';
      s.setAttribute('data-key', key);
      document.body.appendChild(s);
    }
  }, []);

  return (
    <div className="wrap" style={{ position: 'relative' }}>
      <div className="img" style={{ position: 'relative', width: 'min(70vmin, 720px)', aspectRatio: '1 / 1' }}>
        <img id="e" src="/apps/projects/ripple-face/assets/errl-face.svg" alt="Errl Face" />
        <canvas id="fx" />
      </div>
    </div>
  );
}
