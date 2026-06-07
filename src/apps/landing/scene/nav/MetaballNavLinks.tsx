import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { getMetaball, getSculpture, subscribeSceneControls } from '../bridge/sceneControls';
import type { SceneMetaballSettings, SceneSculptureSettings } from '../sceneTypes';
import { getScene3dBubbleRadiusPx, isErrlLayoutReady } from './orbitLayout';
import { NAV_ITEMS } from './navConfig';
import { useNavPhysicsContext } from './NavPhysicsContext';
import { getNavOrbHueStarts, navOrbVisualVars } from './navOrbColor';
import { prefetchWarpRoute, startWarpNav } from './warpNav';

export type MetaballNavLinksProps = {
  className?: string;
  /** Force horizontal labels and billboard orbs (no 3D spin). */
  flatLabels?: boolean;
  /** Route orb visuals through #uiGoo merge field (CSS path). */
  useGooField?: boolean;
};

type PointerNdc = { x: number; y: number; active: boolean };

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (_) {
    return false;
  }
}

/** Shrink long labels (Gallery, Studio) so they fit inside the orb. */
function labelScaleFor(label: string): number {
  const n = label.length;
  if (n <= 5) return 1;
  return clamp(5.2 / n, 0.68, 0.92);
}

function arcVarsForLabel(label: string, orbRadiusPx: number): CSSProperties {
  const n = label.length;
  const arcSpanDeg = Math.min(90, 14 * n);
  const stepDeg = n > 1 ? arcSpanDeg / (n - 1) : 0;
  const startDeg = -arcSpanDeg / 2;
  return {
    '--arc-start': `${startDeg}deg`,
    '--arc-step': `${stepDeg}deg`,
    '--orb-r': `${orbRadiusPx}px`,
    '--letter-count': String(n),
  } as CSSProperties;
}

function NavLabel({
  label,
  arc,
  orbRadiusPx,
}: {
  label: string;
  arc: boolean;
  orbRadiusPx: number;
}) {
  if (!arc) {
    return <span className="label errl-metaball-link__label errl-metaball-link__label--flat">{label}</span>;
  }
  return (
    <span
      className="label errl-metaball-link__label errl-metaball-link__label--arc"
      aria-hidden="true"
      style={arcVarsForLabel(label, orbRadiusPx) as CSSProperties}
    >
      <span className="errl-metaball-link__label-ring">
        {label.split('').map((ch, ci) => (
          <span key={`${label}-${ci}`} className="errl-metaball-link__letter" style={{ '--i': ci } as CSSProperties}>
            {ch}
          </span>
        ))}
      </span>
    </span>
  );
}

function orbStyleVars(item: (typeof NAV_ITEMS)[number], ballDiamPx: number, i: number): CSSProperties {
  return {
    '--nav-ball-color': item.color,
    '--nav-ball-diam': `${ballDiamPx}px`,
    '--label-scale': String(labelScaleFor(item.label)),
    '--orb-i': String(i),
  } as CSSProperties;
}

/**
 * Scene3d nav: DOM hit targets + labels positioned by shared physics.
 * CSS goo field draws mergeable orbs; WebGL (when mounted) replaces orb fill.
 */
export default function MetaballNavLinks({
  className = 'errl-metaball-nav',
  flatLabels = false,
  useGooField = false,
}: MetaballNavLinksProps) {
  const physics = useNavPhysicsContext();
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const gooOrbRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const readyRef = useRef(false);
  const sculptureRef = useRef<SceneSculptureSettings>(getSculpture());
  const metaballRef = useRef<SceneMetaballSettings>(getMetaball());
  const pointerRef = useRef<PointerNdc>({ x: 0, y: 0, active: false });
  const [orbGlow, setOrbGlow] = useState(() => getMetaball().glow);
  const [orbMerge, setOrbMerge] = useState(() => getMetaball().mergeK);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440,
  );
  const [arcLabels, setArcLabels] = useState(() => (typeof window !== 'undefined' ? !prefersReducedMotion() : true));
  const [motionEnabled, setMotionEnabled] = useState(
    () =>
      typeof document !== 'undefined' && document.body.classList.contains('errl-nav-intro-done'),
  );
  const [colorDrift, setColorDrift] = useState(() =>
    typeof window !== 'undefined' ? !prefersReducedMotion() : true,
  );
  const hueStartsRef = useRef(getNavOrbHueStarts());

  const ballDiamPx = Math.round(getScene3dBubbleRadiusPx(viewportWidth) * 2);
  const orbRadiusPx = ballDiamPx / 2;
  const useArcLabels = !flatLabels && arcLabels;
  const showGooField = useGooField;

  useEffect(() => {
    const unsub = subscribeSceneControls((s) => {
      sculptureRef.current = s.sculpture;
      metaballRef.current = s.metaball;
      setOrbGlow(s.metaball.glow);
      setOrbMerge(s.metaball.mergeK);
    });
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    const blurNode = document.getElementById('navGooBlurNode');
    if (!blurNode) return;
    blurNode.setAttribute('stdDeviation', String(4 + orbMerge * 8));
  }, [orbMerge]);

  useEffect(() => {
    if (flatLabels) return undefined;
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const sync = () => setArcLabels(!mq.matches);
      sync();
      mq.addEventListener('change', sync);
      return () => mq.removeEventListener('change', sync);
    } catch (_) {
      return undefined;
    }
  }, [flatLabels]);

  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const sync = () => setColorDrift(!mq.matches);
      sync();
      mq.addEventListener('change', sync);
      return () => mq.removeEventListener('change', sync);
    } catch (_) {
      return undefined;
    }
  }, []);

  useEffect(() => {
    const onMove = (ev: PointerEvent) => {
      pointerRef.current = {
        x: (ev.clientX / window.innerWidth) * 2 - 1,
        y: -((ev.clientY / window.innerHeight) * 2 - 1),
        active: true,
      };
    };
    const onLeave = () => {
      pointerRef.current = { ...pointerRef.current, active: false };
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  useEffect(() => {
    const enableMotion = () => setMotionEnabled(true);
    if (document.body.classList.contains('errl-nav-intro-done')) {
      enableMotion();
    }
    const onSnapIntro = () => {
      readyRef.current = false;
      physics.snapToOrbit(0);
    };
    window.addEventListener('errl:nav-snap-intro', onSnapIntro);
    window.addEventListener('errl:nav-intro-done', enableMotion);
    return () => {
      window.removeEventListener('errl:nav-snap-intro', onSnapIntro);
      window.removeEventListener('errl:nav-intro-done', enableMotion);
    };
  }, [physics]);

  useEffect(() => {
    const onViewportChange = () => {
      setViewportWidth(window.innerWidth);
      if (isErrlLayoutReady()) {
        physics.snapToOrbit(motionEnabled ? undefined : 0);
      }
    };
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('orientationchange', onViewportChange);
    return () => {
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('orientationchange', onViewportChange);
    };
  }, [physics, motionEnabled]);

  useEffect(() => {
    let rafId = 0;
    let lastTs = 0;

    const applyPosition = (
      el: HTMLElement | null,
      s: ReturnType<typeof physics.getStates>[number],
      animateMotion: boolean,
    ) => {
      if (!el) return;
      el.style.left = `${s.x}px`;
      el.style.top = `${s.y}px`;
      const depthScale = animateMotion ? 1 + s.z : 1;
      const introActive = document.body.classList.contains('errl-scene-entering');
      if (animateMotion) {
        el.style.transform = `translate(-50%, -50%) scale(${depthScale})`;
      } else if (!introActive) {
        el.style.transform = 'translate(-50%, -50%)';
      }
      el.style.zIndex = String(6 + Math.round((animateMotion ? s.z : 0) * 20));
    };

    const applyOrbVisuals = (
      el: HTMLElement | null,
      i: number,
      neighborIdx: number,
      mergeProximity: number,
      tSec: number,
    ) => {
      if (!el) return;
      el.style.setProperty('--nav-orb-merge-local', String(mergeProximity));
      if (!colorDrift) return;
      const speedMul = sculptureRef.current.floatSpeed ?? 1;
      const neighborStart =
        neighborIdx >= 0 ? (hueStartsRef.current[neighborIdx] ?? null) : null;
      const vars = navOrbVisualVars(
        hueStartsRef.current[i] ?? 0,
        neighborStart,
        i,
        tSec,
        mergeProximity,
        speedMul,
      );
      el.style.setProperty('--nav-ball-color', vars.primary);
      el.style.setProperty('--nav-ball-color-2', vars.iridescent2);
      el.style.setProperty('--nav-ball-color-3', vars.iridescent3);
      el.style.setProperty('--nav-ball-color-merge', vars.merge);
      el.style.setProperty('--nav-orb-iridescent-spin', `${vars.spinDeg}deg`);
      el.style.setProperty('--nav-orb-merge-mix', String(vars.mergeMix));
    };

    const applyStates = (states: ReturnType<typeof physics.getStates>, animateMotion: boolean) => {
      const colorT = performance.now() * 0.001;
      let maxMerge = 0;
      states.forEach((s, i) => {
        const el = linkRefs.current[i];
        if (!el) return;

        let nearestD = Infinity;
        let nearestIdx = -1;
        states.forEach((other, j) => {
          if (i === j) return;
          const d = Math.hypot(other.x - s.x, other.y - s.y);
          if (d < nearestD) {
            nearestD = d;
            nearestIdx = j;
          }
        });
        const mergeProximity = clamp(1 - (nearestD - ballDiamPx) / (ballDiamPx * 1.35), 0, 1);
        maxMerge = Math.max(maxMerge, mergeProximity);

        if (!flatLabels && animateMotion) {
          const tSec = performance.now() * 0.001;
          el.style.setProperty('--ring-spin', `${tSec * 0.55 + i * 1.15}rad`);
          el.style.setProperty('--orb-spin', `${tSec * 0.42 + i * 0.9}rad`);
        }

        applyPosition(el, s, animateMotion);
        applyPosition(gooOrbRefs.current[i], s, animateMotion);
        applyOrbVisuals(el, i, nearestIdx, mergeProximity, colorT);
        applyOrbVisuals(gooOrbRefs.current[i], i, nearestIdx, mergeProximity, colorT);
        el.classList.add('errl-metaball-link--ready');
        gooOrbRefs.current[i]?.classList.add('errl-metaball-goo-orb--ready');
      });

      const blurNode = document.getElementById('navGooBlurNode');
      if (blurNode) {
        const mb = metaballRef.current.mergeK;
        blurNode.setAttribute('stdDeviation', String(5 + mb * 7 + maxMerge * 8));
      }
    };

    const tick = (ts: number) => {
      if (!lastTs) lastTs = ts;
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;

      if (isErrlLayoutReady()) {
        if (!readyRef.current) {
          physics.snapToOrbit(motionEnabled ? undefined : 0);
          readyRef.current = true;
          document.body.classList.add('errl-layout-ready');
        }
        if (motionEnabled) {
          physics.step(
            dt,
            pointerRef.current,
            () => sculptureRef.current,
            () => metaballRef.current,
          );
        } else {
          physics.snapToOrbit(0);
        }
        applyStates(physics.getStates(), motionEnabled);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [physics, flatLabels, motionEnabled, showGooField, ballDiamPx, colorDrift]);

  const rootClass = [
    className,
    'errl-scene-3d-nav',
    flatLabels ? 'errl-metaball-nav--flat' : '',
    showGooField ? 'errl-metaball-nav--goo' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const linkLayerStyle = {
    '--nav-orb-glow': String(orbGlow),
    '--nav-orb-merge': String(orbMerge),
  } as CSSProperties;

  return (
    <div className={rootClass} aria-hidden={false}>
      {showGooField ? (
        <div className="errl-metaball-nav__goo-field" aria-hidden style={linkLayerStyle}>
          {NAV_ITEMS.map((item, i) => (
            <span
              key={`goo-${item.key}`}
              ref={(el) => {
                gooOrbRefs.current[i] = el;
              }}
              className="errl-metaball-goo-orb errl-metaball-link__orb"
              data-nav-bubble-key={item.key}
              style={orbStyleVars(item, ballDiamPx, i)}
            />
          ))}
        </div>
      ) : null}
      <div className="errl-scene-3d-labels errl-metaball-nav__links" aria-hidden={false} style={linkLayerStyle}>
        {NAV_ITEMS.map((item, i) => (
          <a
            key={item.key}
            ref={(el) => {
              linkRefs.current[i] = el;
            }}
            href={item.href}
            className="errl-metaball-link errl-scene-3d-label"
            data-nav-bubble-key={item.key}
            aria-label={item.label}
            style={orbStyleVars(item, ballDiamPx, i)}
            {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            onMouseEnter={item.external ? undefined : () => prefetchWarpRoute(item.href)}
            onFocus={item.external ? undefined : () => prefetchWarpRoute(item.href)}
            onClick={
              item.external
                ? undefined
                : (e) => {
                    e.preventDefault();
                    startWarpNav(item.href);
                  }
            }
          >
            {!showGooField ? <span className="errl-metaball-link__orb" aria-hidden="true" /> : null}
            <NavLabel label={item.label} arc={useArcLabels} orbRadiusPx={orbRadiusPx} />
          </a>
        ))}
      </div>
    </div>
  );
}
