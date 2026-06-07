import type { CSSProperties } from 'react';
import GalleryLazyImage from './GalleryLazyImage';
import type { GalleryItem } from './useGalleryManifest';

type Props = {
  items: GalleryItem[];
  orbSizePx: number;
  onSelect: (item: GalleryItem) => void;
};

export default function GalleryCirclesView({ items, orbSizePx, onSelect }: Props) {
  return (
    <div
      className="gallery-circles"
      id="gallery-panel-circles"
      role="tabpanel"
      aria-label="Circle thumbnails"
      style={{ '--gallery-orb-size': `${orbSizePx}px` } as CSSProperties}
    >
      <ul className="gallery-circles__grid">
        {items.map((item) => (
          <li key={item.src}>
            <button type="button" className="gallery-circles__item" onClick={() => onSelect(item)}>
              <GalleryLazyImage src={item.src} alt="" className="gallery-circles__orb" />
              <span className="gallery-circles__name">{item.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
