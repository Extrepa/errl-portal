export type GalleryViewMode = 'circles' | 'orbit' | 'grid';

const MODES: { id: GalleryViewMode; label: string; hint: string }[] = [
  { id: 'circles', label: 'Circles', hint: 'Round thumbnail wall' },
  { id: 'orbit', label: 'Orbit', hint: 'Spinning 3D hall' },
  { id: 'grid', label: 'Grid', hint: 'Dense photo wall' },
];

type Props = {
  mode: GalleryViewMode;
  onChange: (mode: GalleryViewMode) => void;
  compact?: boolean;
};

export default function GalleryViewDial({ mode, onChange, compact }: Props) {
  return (
    <div
      className={`gallery-view-switcher${compact ? ' gallery-view-switcher--compact' : ''}`}
      role="tablist"
      aria-label="Gallery layouts"
    >
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          role="tab"
          aria-selected={mode === m.id}
          aria-controls={`gallery-panel-${m.id}`}
          title={m.hint}
          className={`gallery-view-switcher__tab${mode === m.id ? ' gallery-view-switcher__tab--active' : ''}`}
          onClick={() => onChange(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
