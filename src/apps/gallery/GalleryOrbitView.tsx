import { useCallback, useEffect, useRef, useState } from 'react';
import FloatingHall from './FloatingHall';
import type { GalleryItem } from './useGalleryManifest';

type Props = {
  items: GalleryItem[];
  onSelect: (item: GalleryItem) => void;
};

const AUTO_SPEED = 0.018;
const WHEEL_SENSITIVITY = 0.00085;
const DRAG_SENSITIVITY = 0.0028;
const TOUCH_SENSITIVITY = 0.002;
const DRAG_CLICK_THRESHOLD = 8;

export default function GalleryOrbitView({ items, onSelect }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const windowRef = useRef(0);
  const dragRef = useRef({ active: false, moved: false, lastX: 0, totalMove: 0 });
  const [windowKey, setWindowKey] = useState(0);

  useEffect(() => {
    progressRef.current = 0;
    windowRef.current = 0;
    setWindowKey((k) => k + 1);
  }, [items]);

  const syncWindow = useCallback(
    (count: number) => {
      if (items.length <= count) return;
      const next = Math.floor(progressRef.current * Math.max(1, items.length - count));
      if (next !== windowRef.current) {
        windowRef.current = next;
        setWindowKey((k) => k + 1);
      }
    },
    [items.length],
  );

  const nudge = useCallback(
    (delta: number) => {
      progressRef.current = (progressRef.current + delta) % 1;
      if (progressRef.current < 0) progressRef.current += 1;
      syncWindow(13);
    },
    [syncWindow],
  );

  const handleSelect = useCallback(
    (item: GalleryItem) => {
      if (dragRef.current.moved) return;
      onSelect(item);
    },
    [onSelect],
  );

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!dragRef.current.active) {
        progressRef.current = (progressRef.current + AUTO_SPEED * dt) % 1;
        syncWindow(13);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [items, syncWindow]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const canvas = stage.querySelector('canvas');

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      nudge(e.deltaY * WHEEL_SENSITIVITY);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragRef.current = { active: true, moved: false, lastX: e.clientX, totalMove: 0 };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.lastX;
      dragRef.current.lastX = e.clientX;
      dragRef.current.totalMove += Math.abs(dx);
      if (dragRef.current.totalMove >= DRAG_CLICK_THRESHOLD) {
        dragRef.current.moved = true;
        stage.classList.add('gallery-orbit__stage--dragging');
      }
      if (dragRef.current.moved) nudge(-dx * DRAG_SENSITIVITY);
    };

    const onPointerUp = () => {
      if (!dragRef.current.active) return;
      const wasDrag = dragRef.current.moved;
      dragRef.current.active = false;
      stage.classList.remove('gallery-orbit__stage--dragging');
      window.setTimeout(() => {
        dragRef.current.moved = false;
        dragRef.current.totalMove = 0;
      }, wasDrag ? 100 : 0);
    };

    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? touchY;
      const dy = touchY - y;
      touchY = y;
      if (Math.abs(dy) > 0) {
        e.preventDefault();
        nudge(dy * TOUCH_SENSITIVITY);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        nudge(0.035);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        nudge(-0.035);
      }
    };

    stage.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    if (canvas) canvas.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('touchstart', onTouchStart, { passive: true });
    stage.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      stage.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      if (canvas) canvas.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('touchstart', onTouchStart);
      stage.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [items.length, nudge]);

  return (
    <div className="gallery-orbit" id="gallery-panel-orbit" role="tabpanel" aria-label="Spinning orbit hall">
      <div ref={stageRef} className="gallery-orbit__stage" tabIndex={0}>
        <FloatingHall
          items={items}
          progressRef={progressRef}
          windowKey={windowKey}
          onSelectItem={handleSelect}
        />
      </div>
    </div>
  );
}
