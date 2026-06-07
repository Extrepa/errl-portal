import type { GalleryViewMode } from './GalleryViewDial';

type Props = {
  mode: GalleryViewMode;
  value: number;
  onChange: (value: number) => void;
};

export function tileSizePx(mode: GalleryViewMode, value: number): number {
  const t = value / 100;
  if (mode === 'circles') return Math.round(48 + t * 112);
  if (mode === 'grid') return Math.round(96 + t * 184);
  return 120;
}

export default function GalleryDensitySlider({ mode, value, onChange }: Props) {
  if (mode !== 'circles' && mode !== 'grid') return null;

  return (
    <label className="gallery-density" title="Adjust thumbnail size">
      <span className="gallery-density__label">Tile size</span>
      <span className="gallery-density__icon" aria-hidden="true">
        ⊟
      </span>
      <input
        type="range"
        className="gallery-density__range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${tileSizePx(mode, value)} pixels`}
      />
      <span className="gallery-density__icon" aria-hidden="true">
        ⊞
      </span>
    </label>
  );
}
