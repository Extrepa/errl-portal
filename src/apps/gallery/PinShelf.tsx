import { useMemo, type CSSProperties } from 'react';
import type { GalleryItem } from './useGalleryManifest';

type Props = {
  items: GalleryItem[];
  scrollProgress: number;
  visible: boolean;
};

/** Pin shelf — depth carousel from manifest slice. */
export default function PinShelf({ items, scrollProgress, visible }: Props) {
  const pins = useMemo(() => items.filter((i) => /pin|badge|coin/i.test(i.title + i.src)).slice(0, 8), [items]);
  const slice = pins.length >= 3 ? pins : items.slice(0, 6);

  if (!visible || slice.length === 0) return null;

  return (
    <section className="gallery-room gallery-room--shelf" aria-labelledby="gallery-shelf-title">
      <h2 id="gallery-shelf-title" className="gallery-room__title">
        Pin Shelf
      </h2>
      <p className="gallery-room__sub">Collectibles in depth</p>
      <ul className="gallery-shelf-track" style={{ '--shelf-shift': scrollProgress } as CSSProperties}>
        {slice.map((item, i) => {
          const t = slice.length > 1 ? i / (slice.length - 1) : 0.5;
          const depth = 1 - Math.abs(t - scrollProgress) * 0.6;
          return (
            <li
              key={item.src}
              className="gallery-shelf-pin"
              style={{ transform: `scale(${0.72 + depth * 0.35})`, zIndex: Math.round(depth * 10) }}
            >
              <img src={item.src} alt={item.title} loading="lazy" draggable={false} />
              <span>{item.title}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
