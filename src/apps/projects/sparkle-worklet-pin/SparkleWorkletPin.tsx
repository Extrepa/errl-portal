import React, { useEffect } from 'react';

/**
 * SparkleWorkletPin
 * React wrapper that mounts the portal variant assets/logic.
 * Assumes a single instance per page (script expects #enamel and #tw ids).
 */
export default function SparkleWorkletPin() {
  useEffect(() => {
    const key = 'errl-sparkle-worklet-pin-script';
    if (!document.querySelector(`script[data-key="${key}"]`)) {
      const s = document.createElement('script');
      s.type = 'module';
      s.src = '/apps/projects/sparkle-worklet-pin/script.js';
      s.setAttribute('data-key', key);
      document.body.appendChild(s);
    }
  }, []);

  return (
    <div className="wrap" style={{ display: 'grid', placeItems: 'center', minHeight: '100%' }}>
      <div className="pin" style={{ position: 'relative', width: 'min(60vmin,420px)', aspectRatio: '1 / 1', borderRadius: 24, padding: 14, overflow: 'hidden' }}>
        <div className="enamel" id="enamel" style={{ position: 'absolute', inset: '8%', borderRadius: 22 }} />
        <div className="face" style={{ position: 'absolute', inset: '20%', borderRadius: '50%' }} />
      </div>
      <div className="ui" style={{ marginTop: 12 }}>
        <label>Twinkle <input id="tw" type="range" min={0} max={10} step={0.01} defaultValue={0} /></label>
      </div>
    </div>
  );
}
