# Gallery immersive architecture (Phase 5)

**Status:** Floating Hall + room spikes shipped at `/gallery/` (2026-06-06).

## Intent

The Gallery becomes a dreamlike exhibition space rather than a flat grid. Assets and downloads move to the forum; the gallery holds curated visual work only.

## Rooms

| Room | Status | Content | Interaction |
|------|--------|---------|-------------|
| Floating hall | **Done** | Renders, photography, pin art | R3F parallax drift, Lenis scroll |
| CRT wall | **Spike** | Manifest slice in faux CRT frames | Scanline bezel, static images |
| Goo vitrine | **Spike** | Featured piece | Restrained drag |
| Pin shelf | **Spike** | Pin designs from manifest | Depth carousel |

Unified Lenis scroll journey: hall → CRT → vitrine → shelf (`gallery/main.tsx` chapter thresholds).

## Technical approach

- Reuse `src/apps/gallery/` + landing `quality.ts` for tier gating.
- Lenis on `/gallery/` (native scroll when `prefers-reduced-motion`).
- Manifest: `src/apps/static/pages/gallery/manifest.json`

## Dependencies

- Homepage cinematic phases shipped (`scene/App.tsx`).
- Metaball lab shader validated at `/fx/metaball-lab/`.
- Tier A includes `gallery-floating-hall.spec.ts`.

## Upgrade merge (gallery focus)

Upgrade repo `StudioScene` / `ArtFrame` / `CameraRig` implement ring-carousel **click-to-focus** camera lerp. Current gallery uses **Lenis scroll chapters** instead — complementary, not either/or.

**Merge path (P4):** Port focus-on-click to `FloatingHall.tsx`; keep scroll room journey. See `docs/upgrade-merge-handoff.md` §7 P4 and upgrade `errl-portal-nextjs/components/canvas/ArtFrame.tsx`.

---

## Completion plan (2026-06-06)

### What works today

- `/gallery/` React app: Lenis scroll chapters, `FloatingHall` R3F parallax, tier gating (`quality.ts`)
- Room spikes: `CrtWall`, `GooVitrine`, `PinShelf` (static/CSS interactions)
- Manifest loader (`useGalleryManifest.ts`) with `%BASE_URL%` resolution
- Playwright smoke: `tests/gallery-floating-hall.spec.ts`

### Asset sync (2026-06-06)

Source of truth: `/Users/extrepa/Errl/Photos/Projects/Errl` (main folder only; `previews/` skipped — larger dupes).

```bash
npm run gallery:sync
```

**7 albums / 326 images** copied to `src/shared/assets/legacy/gallery/`:

| Album | Count |
|-------|------:|
| OpenArt — October 2025 | 247 |
| Lizard Codex | 36 |
| Lizard Cups | 12 |
| Mushroom Forest | 10 |
| Extrepa Logos | 10 |
| 3D Renders | 6 |
| Errl's World | 5 |

**Excluded:** pamphlet, wizard pins, icons/pins/sprites, legacy `errl-N.png`, OpenArt PNG twins, hash assets, `previews/`. **132** unclassified one-offs left on disk for manual curation later. No "Selenius" files found.

### Blockers (remaining)

| Issue | Impact | Fix |
|-------|--------|-----|
| ~~No image assets in repo~~ | **Done** via `gallery:sync` | Re-run after adding photos |
| **Manifest unmaintained** | 100+ manual entries, no validation | Add `tools/gallery/validate-manifest.mjs` + CI check |
| **No texture fallbacks** | Broken URLs show empty R3F frames | Placeholder texture + per-item error state in `FloatingHall` |
| **Subpage layout overflow** | Gallery page + shared static CSS used `100vh` + `background-attachment: fixed` → spurious scrollbars | Fixed in `errlStaticPage.css` (pseudo-element bg, `100dvh`, `overflow-x: clip`) |

### Finish checklist (priority order)

**P0 — Make it load (1–2 days)**

1. Restore gallery image assets under `src/shared/assets/legacy/gallery/` *or* point manifest `src`/`cover` at CDN URLs
2. Trim CI test manifest (`tests/fixtures/gallery-manifest.json`, 3–5 images) for deterministic Playwright
3. Texture fallback in `FloatingHall.tsx` when `useTexture` fails

**P1 — Core UX (2–3 days)**

4. Album picker UI (manifest already has `albums[]`; app only loads `recent` slice)
5. Click-to-focus camera lerp on frames (upgrade `ArtFrame` / `CameraRig` port)
6. Lightbox or detail panel (title, full-res, optional download link)

**P2 — Polish (1–2 days)**

7. Thumbnail → full-res progressive load (manifest `thumb` field or build-time resize)
8. Manifest validation script in `npm run safety-check` or CI
9. Keyboard/a11y: focusable frames, `aria` on room sections

**P3 — Optional**

10. Merge metaball/goo shader accents from landing (tier-gated)
11. Forum handoff for asset downloads (per original intent in this doc)

### Files to touch

- Assets: `src/shared/assets/legacy/gallery/`, `vite.config.ts` copy plugin
- Data: `src/apps/static/pages/gallery/manifest.json`, `useGalleryManifest.ts`
- 3D: `FloatingHall.tsx`, `gallery/main.tsx` chapters
- Spikes: `CrtWall.tsx`, `GooVitrine.tsx`, `PinShelf.tsx`
- Tests: `tests/gallery-floating-hall.spec.ts`, new fixture manifest
