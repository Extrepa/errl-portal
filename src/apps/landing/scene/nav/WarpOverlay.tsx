import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getWarpNavState, subscribeWarpNav, type WarpNavState } from './warpNav';
import WalkingErrlLoader from './WalkingErrlLoader';

/** Hero walking Errl over the live starfield while the next page preloads. */
export default function WarpOverlay() {
  const [warp, setWarp] = useState<WarpNavState>(() =>
    typeof window !== 'undefined' ? getWarpNavState() : { stage: 'IDLE', targetRoute: null },
  );

  useEffect(() => subscribeWarpNav(setWarp), []);

  const visible = warp.stage === 'OUT';

  if (typeof document === 'undefined' || !visible) return null;

  return createPortal(
    <div className="errl-warp-overlay" role="presentation" aria-hidden="true">
      <WalkingErrlLoader />
    </div>,
    document.body,
  );
}
