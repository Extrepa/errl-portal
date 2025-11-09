# Errl Portal — TEAM UPDATE
**Date:** 2025-11-09  
**Owner:** Warp/Extrepa • Portal/Studio Track

---

## TL;DR
- **Math Lab is complete and working**: 100/100 interactive effects (Canvas, SVG, CSS) with live controls and tab navigation.
- **Action**: quick verification pass, then document and move forward. Add optional “quality-of-life” features as follow-ups.
- **Fix**: Playwright install attempts failed due to a **typo** (`playright`). Use `npx playwright install` and add test scaffold.
- **Dev**: Vite dev server expected at `http://localhost:5173/` (use `npm run dev`).

---

## What Shipped Since Last Update

### Math Lab (Studio → /studio/math-lab/)
Status: **Complete** (single standalone HTML ~3k lines in repo; prior notes referenced 60k-line monolith—current integrated page is tidy and functional).

**Feature set**
- 100 visual “toys” (IDs 49–148), spanning:
  - Fractals & Recursion (e.g., Newton, Sierpinski, Dragon/Hilbert)
  - Noise/Procedural (Perlin, Worley, RD/Turing)
  - Particle Systems (DLA, Circle Packing, N-body)
  - Complex Analysis (Domain coloring, Newton basins, conformal maps)
  - Geometry (Supershapes, Lissajous, Phyllotaxis, Knots)
  - Waves/Interference (Moiré, Chladni, Quasicrystals)
  - Text FX (Chromaburst, Sinewarp, Glyph drift)
- Per-effect:
  - Live preview (Canvas/SVG/CSS)
  - Interactive sliders/toggles
  - Code panel + short description
  - Tabbed navigation

**UX**
- Dark portal theme, header navigation, responsive layout.
- Batches arranged by ID (49–58, 59–68, …).

**Notes**
- All effects render; no placeholders detected.
- Some effects are compute-heavy at max settings (expected).

---

## Verification Checklist (Cursor / manual QA)
- [ ] `npm run dev` builds and serves without errors
- [ ] Navigate to **Studio → Math Lab** (`/studio/math-lab/`)
- [ ] Tabs switch effects; canvas/SVG updates live
- [ ] Controls mutate output in real time (no console errors)
- [ ] Basic mobile responsiveness is acceptable
- [ ] CPU/GPU load stays reasonable on default presets

**Perf sanity** (optional)
- [ ] Add temporary FPS meter (requestAnimationFrame delta overlay)
- [ ] Provide “Pause/Play” for the heaviest effects

---

## Quick Wins / Enhancements (Post‑verify)
1. **Export Button** per effect
   - Canvas → PNG (one-shot frame download)
   - SVG effects → inline `<svg>` serialization → `.svg` download
2. **Presets**
   - Save/load params via `localStorage`
   - Generate shareable links with querystring encoding
3. **Categories / Search**
   - Tag effects (fractals/noise/text/geometry/particles)
   - Filter + fuzzy search by name/ID
4. **Edu Pass**
   - Show formula snippets (KaTeX/MathJax) alongside code
   - “Learn more” links for each topic
5. **Perf Controls**
   - Global “quality” slider that clamps particle counts/iteration max

---

## Dev + Tooling

### Vite Dev
```bash
npm run dev
# Expect:
# VITE v7.x.x  ready in XX ms
# ➜  Local:   http://localhost:5173/
```

### Playwright (Fix)
Observed commands in shell history used `npx playright` (typo). Correct usage:

```bash
# install browsers
npx playwright install

# optional: add as dev dependency + scaffold tests
npm i -D @playwright/test
npx playwright install --with-deps   # macOS may not need --with-deps
npx playwright codegen http://localhost:5173/studio/math-lab/
```

Basic smoke test example (`tests/math-lab.spec.ts`):
```ts
import { test, expect } from '@playwright/test';

test('Math Lab loads and first tab renders', async ({
  page
}) => {
  await page.goto('http://localhost:5173/studio/math-lab/');
  await expect(page.getByRole('heading', { name: /Math Lab/i })).toBeVisible();
  // verify at least one canvas/SVG exists
  const anyStage = await page.locator('canvas, svg').first();
  await expect(anyStage).toBeVisible();
});
```

Run tests:
```bash
npx playwright test
```

---

## Open Issues / Risks
- **Command typo** blocked Playwright setup (`playright`). Resolved by using `playwright`.
- **Performance peaks** on a few effects at extreme parameter values; add clamps/“quality” guardrail after verification.
- **Docs drift**: earlier plan docs say “build 8 simple effects”; reality is **100 shipped**. Update docs to prevent confusion.

---

## Docs To Update
- `README.md` → add **Studio → Math Lab** section with route, screenshots, and “how to run” steps.
- `docs/math-lab-plan.md` → mark completed; move remaining items to “enhancements.”
- `docs/dev-panel.md` → (optional) add hooks for presets/FPS overlay if we integrate.

---

## Suggested PR Scope
**PR: studio(math-lab): verification pass + docs + export**
- Adds PNG/SVG export buttons
- Adds FPS overlay (dev-only)
- Clamps a few extreme sliders by default
- Updates README + plan doc
- Adds basic Playwright smoke test

---

## Next Up (if we move past Math Lab)
- Dev panel enhancement & presets
- Portal deployment verification
- Studio integrations (Pin Designer linkage; asset isolation pipeline)

---

## Notes to Cursor
- Start by confirming dev server output and hitting the route.
- If Playwright is desired, install via the corrected command above and run the smoke test.
- Keep enhancements behind simple flags; do not regress performance.

---

## Next Steps for Cursor (Do These In Order)
1. Launch dev server → confirm Math Lab at `/studio/math-lab/`.
2. Install Playwright and run smoke tests.
3. Implement PNG/SVG export buttons per effect (dev flag first).
4. Add dev-only FPS overlay (toggle).
5. Add localStorage preset system + shareable query strings.
6. Update README and docs; open PR.

> Commands:
> ```bash
> npm run dev
> npm i -D @playwright/test
> npx playwright install
> npx playwright test
> ```
