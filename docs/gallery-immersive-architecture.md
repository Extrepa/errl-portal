# Gallery immersive architecture (Phase 5)

**Status:** Planned — not yet implemented in UI.

## Intent

The Gallery becomes a dreamlike exhibition space rather than a flat grid. Assets and downloads move to the forum; the gallery holds curated visual work only.

## Proposed rooms

| Room | Content | Interaction |
|------|---------|-------------|
| Floating hall | Renders, photography, pin art | Parallax drift, soft hover glow |
| CRT wall | Music visuals, retro loops | Embedded players in faux CRT frames |
| Goo vitrine | Experimental WebGL pieces | Drag-to-inspect (restrained physics) |
| Pin shelf | Pin designs | Carousel with depth |

## Technical approach

- Reuse `src/apps/landing/scene/` R3F stack from homepage (`?scene3d=1` patterns).
- Lenis + GSAP ScrollTrigger per room for subpage `/gallery/` (same pattern as About smooth scroll).
- Manifest-driven media from existing gallery JSON; no new public asset hub links in nav.

## Dependencies

- Homepage cinematic phases shipped (`scene/App.tsx`).
- Metaball lab shader validated at `/fx/metaball-lab/`.
- Quality tiers (`scene/quality.ts`) gate bloom and mesh density on mobile.
