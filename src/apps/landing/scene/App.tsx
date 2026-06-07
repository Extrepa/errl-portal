import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ArrivalPhase from './phases/ArrivalPhase';
import TransitionPhase from './phases/TransitionPhase';
import MainPhase from './phases/MainPhase';
import ScrollNavDrive from './scroll/ScrollNavDrive';
import WarpOverlay from './nav/WarpOverlay';
import {
  dispatchSceneReady,
  setBodyScenePhase,
  setRbAmbientMode,
} from './bridge/legacyBridge';
import { applyNavRenderModeToDocument } from './navRenderMode';
import { mountWarpNavGlobal } from './nav/warpNav';

export type ScenePhase = 'arrival' | 'entering' | 'main';

const ENTERED_KEY = 'errl_entered_v1';

function readSkipArrival(): boolean {
  try {
    if (new URLSearchParams(window.location.search).get('skipIntro') === '1') return true;
    return sessionStorage.getItem(ENTERED_KEY) === '1';
  } catch (_) {
    return false;
  }
}

function markEntered() {
  try {
    sessionStorage.setItem(ENTERED_KEY, '1');
  } catch (_) {}
}

export default function App() {
  const [phase, setPhase] = useState<ScenePhase>(() => (readSkipArrival() ? 'main' : 'arrival'));
  const root = document.getElementById('errl-scene-root');

  useEffect(() => {
    applyNavRenderModeToDocument();
    mountWarpNavGlobal();
  }, []);

  useEffect(() => {
    setBodyScenePhase(phase);
    const el = document.getElementById('errl-scene-root');
    if (el) {
      el.classList.toggle('errl-scene-root--interactive', phase !== 'main');
      el.setAttribute('aria-hidden', phase === 'main' ? 'true' : 'false');
    }
    if (phase === 'main') {
      applyNavRenderModeToDocument();
      setRbAmbientMode();
      dispatchSceneReady();
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'main') return;
    const idle =
      typeof requestIdleCallback === 'function'
        ? requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 1);
    idle(() => {
      if (typeof (window as Window & { errlGLSetOverlay?: unknown }).errlGLSetOverlay === 'undefined') {
        /* legacy layers load via index scripts */
      }
    });
  }, [phase]);

  const handleEnter = useCallback(() => {
    markEntered();
    setPhase('entering');
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setPhase('main');
  }, []);

  if (!root) return null;

  return createPortal(
    <>
      {phase === 'arrival' ? <ArrivalPhase onEnter={handleEnter} /> : null}
      {phase === 'entering' ? <TransitionPhase onComplete={handleTransitionComplete} /> : null}
      {phase === 'main' ? <MainPhase /> : null}
      {phase === 'main' ? <ScrollNavDrive active /> : null}
      {phase === 'main' ? <WarpOverlay /> : null}
    </>,
    root,
  );
}
