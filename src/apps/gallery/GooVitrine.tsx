import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { GalleryItem } from './useGalleryManifest';

type Props = {
  item: GalleryItem | null;
  visible: boolean;
};

/** Goo vitrine — restrained drag on a single featured piece. */
export default function GooVitrine({ item, visible }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  if (!visible || !item) return null;

  const onPointerDown = (e: ReactPointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    const clamp = (n: number) => Math.max(-48, Math.min(48, n));
    setOffset({ x: clamp(drag.current.ox + dx * 0.35), y: clamp(drag.current.oy + dy * 0.35) });
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <section className="gallery-room gallery-room--vitrine" aria-labelledby="gallery-vitrine-title">
      <h2 id="gallery-vitrine-title" className="gallery-room__title">
        Goo Vitrine
      </h2>
      <p className="gallery-room__sub">Drag gently — the piece resists</p>
      <div
        ref={ref}
        className="gallery-vitrine__glass"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img src={item.src} alt={item.title} draggable={false} />
      </div>
    </section>
  );
}
