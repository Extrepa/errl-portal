import React, { useEffect } from 'react';

/**
 * GravityStickerField
 * React wrapper that mounts the portal variant assets/logic.
 * Assumes a single instance per page (script expects #c canvas id).
 */
export default function GravityStickerField() {
  useEffect(() => {
    const key = 'errl-gravity-sticker-field-script';
    if (!document.querySelector(`script[data-key="${key}"]`)) {
      const s = document.createElement('script');
      s.type = 'module';
      s.src = '/apps/projects/gravity-sticker-field/script.js';
      s.setAttribute('data-key', key);
      document.body.appendChild(s);
    }
  }, []);

  return (
    <div>
      <canvas id="c" />
      <div className="ui">Drag stickers • They fall & collide • Errl</div>
    </div>
  );
}
