## 2026-01-19 cursor notes

### Errl phone controls fixes
- Adjusted `classicGooAutoSpeed` to allow true stop at 0 and removed forced minimum advance delta; improved auto-fade slider rounding to respect each slider's `step`.
- Fixed nav bubble Size control by moving scale to CSS variable `--navOrbScale` and updating wobble keyframes to multiply by it (JS no longer fights animation).
- Fixed hue controls by switching CSS hue application to variable+class (`.hue-enabled`) and removing `filter:` usage from bubble shine + hover that previously overrode hue.
- Centered Errl goo defaults by switching Displacement/Wobble/Speed sliders to 0..1 with default 0.5, updating repo defaults, and re-tuning goo constants so the midpoint is subtle.

### Follow-up (layout + animation feel)
- Prevented the Errl tab “Animation” label from being width-clamped/ellipsized by limiting `.sliderRow` label sizing rules to `label[for]`.
- Made the three Errl Goo rows (Displacement/Wobble/Speed) use an explicit grid layout via `sliderRow--auto` so the sliders + Auto toggles stay inside the phone.
- Added row padding for `sliderRow--auto` so the slider thumb ends don’t get clipped.
- Switched auto-fade `Auto Speed` back to a linear mapping (still \(0 = stop\)) so raising Auto Speed immediately causes the sliders to sweep and the goo to visibly update.

### Verification notes
- **Auto-fade core behavior (code)**: `classicGooControls.step()` now uses `rate = clamp(autoSpeed.value, 0, 0.25)` (linear), and bails cleanly when `rate <= 0`. The `advanceSlider()` path maintains an internal `state.norm` so tiny deltas accumulate even if the slider `step` is coarse, then rounds to the slider’s actual `step` via `roundToStep()` before dispatching `input`.
- **Errl Goo mapping (code)**: `apply()` reads Displacement/Wobble/Speed as 0..1 sliders; midpoint 0.5 produces subtle motion. The constants (dispScale / blur / noise freq / drip) are tuned so the effect remains visible without jumping.
- **Nav bubble size (code)**: `setNavOrbScale()` writes `--navOrbScale` onto `#navOrbit`, so the wobble animation composes with scale. Also forwards the value to WebGL with `window.errlGLSetOrbScale` when available.
- **Hue controls (code)**: `applyLayerCSS()` sets CSS vars (`--errlHueDeg`, `--errlHueSatPct`, `--errlHueBrightPct`), toggles `.hue-enabled`, and clears legacy inline `filter` properties; `hue-effects.css` only applies `filter:` when `.hue-enabled` is present.
- **UI/layout (code)**: `sliderRow--auto` enforces a 3-column grid for the Errl Goo rows and includes horizontal padding so slider thumbs don’t clip.
- **Manual UI verification (limits)**: In the current automated browser session, the phone panel appears to be in **minimized** mode (shows as a small purple orb at bottom-right). Automated clicks are intermittently failing (“Script failed to execute”), so I couldn’t reliably expand the panel here to visually confirm the in-phone fit; no runtime JS errors were observed in console during load.
- **User tweak observed**: `src/index.html` nav-bubble “Forum” link was changed to remove `target="_blank"` / `rel` (intentional per your edit); unrelated to Errl controls.
- **Repo hygiene note**: Working tree currently includes many `test-results/` artifact changes (adds/deletes/modifies). If you’re preparing a commit/PR, you’ll probably want to exclude or clean those separately.

### Repo hygiene actions (follow-up)
- Committed app/test/tool changes as `6d944d2`.
- Next: ignore and stop tracking `test-results/` so Playwright artifacts don’t churn the repo.

### Landing hue FX follow-up
- Restored `.hue-cycle-*` animations by keyframing a composed `filter` (base hue vars + offsets) instead of `filter: none`.
- Scoped `.hue-cycle-*` animations to only run on `.hue-controlled` elements when `.hue-enabled` is present, so the hue toggle still truly disables filter effects.
- Double-check: `.hue-cycle-*` on non-`.hue-controlled` nodes still animates (uses legacy `--errl-hue-shift` / `--errl-saturation` fallbacks). On `.hue-controlled` nodes, animation is forced off unless `.hue-enabled` is present, preventing the keyframes from reintroducing “always-on” filter effects.

