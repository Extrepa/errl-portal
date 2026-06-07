import type { CSSProperties } from 'react';
import GalleryLazyImage from './GalleryLazyImage';
import type { GalleryItem } from './useGalleryManifest';

type Props = {
  items: GalleryItem[];
  cellMinPx: number;
  onSelect: (item: GalleryItem) => void;
};

export default function GalleryGridView({ items, cellMinPx, onSelect }: Props) {
  return (
    <div
      className="gallery-grid"
      id="gallery-panel-grid"
      role="tabpanel"
      aria-label="Photo grid"
      style={{ '--gallery-cell-min': `${cellMinPx}px` } as CSSProperties}
    >
      <ul className="gallery-grid__list">
        {items.map((item) => (
          <li key={item.src}>
            <button type="button" className="gallery-grid__card" onClick={() => onSelect(item)}>
              <GalleryLazyImage src={item.src} alt="" className="gallery-grid__frame" />
              <span className="gallery-grid__name">{item.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
