import type { GalleryItem } from './useGalleryManifest';

type Props = {
  items: GalleryItem[];
  visible: boolean;
};

/** CRT wall spike — faux CRT frames for loop / visual pieces. */
export default function CrtWall({ items, visible }: Props) {
  const slice = items.filter((i) => /loop|crt|video|anim/i.test(i.title + i.src)).slice(0, 4);
  const frames = slice.length ? slice : items.slice(0, 3);

  if (!visible || frames.length === 0) return null;

  return (
    <section className="gallery-room gallery-room--crt" aria-labelledby="gallery-crt-title">
      <h2 id="gallery-crt-title" className="gallery-room__title">
        CRT Wall
      </h2>
      <p className="gallery-room__sub">Retro loops in glowing tubes</p>
      <ul className="gallery-crt-grid">
        {frames.map((item) => (
          <li key={item.src} className="gallery-crt-frame">
            <div className="gallery-crt-frame__bezel" role="img" aria-label={item.title}>
              <img src={item.src} alt={item.title} loading="lazy" draggable={false} />
              <span className="gallery-crt-frame__scanlines" aria-hidden="true" />
            </div>
            <span className="gallery-crt-frame__label">{item.title}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
