# Cursor Notes - 2026-01-28

## Task: Update Landing Page Default Settings

The user provided a JSON settings file (`errl-portal-settings_2026-01-28T03-27-06-062Z.json`) and requested to make these the default for all users unless they've changed them.

### Changes Made:

1.  **Updated `public/apps/landing/config/errl-defaults.json`**:
    *   Updated all UI control defaults with values from the provided JSON.
    *   Added full `hue`, `rb`, `gl`, `goo`, and `nav` sections from the provided JSON to ensure the entire state is captured in the defaults.
    *   Added `rbAdvAnimSpeed` and `errlOutlineThickness` to the defaults.

2.  **Updated `src/apps/landing/scripts/portal-app.js`**:
    *   Updated the "baked defaults" fallback object to match the new settings.
    *   Updated `bundleFromRepoDefaults` to correctly ingest the full state (Hue, GL, RB, etc.) from the repo defaults JSON file instead of just the UI controls.
    *   Ensured `rbAdvAnimSpeed` and `errlOutlineThickness` are included in the fallback.

3.  **Updated `src/index.html`**:
    *   Updated hardcoded `value` and `checked` attributes for all relevant controls in the settings panel to match the new defaults. This ensures the UI reflects the defaults immediately on load.

### Key New Default Values:
- `rbSpeed`: 1.03
- `rbDensity`: 1.46
- `rbAlpha`: 0.87
- `rbWobble`: 0.98
- `rbFreq`: 0.95
- `rbSizeHz`: 0.67
- `rbJumboPct`: 0.33
- `rbJumboScale`: 1.95
- `rbAttract`: false
- `navRadius`: 1.26
- `navOrbSize`: 1.22
- `navWiggle`: 0.57
- `navFlow`: 1.07
- `navGrip`: 0.35
- `navDrip`: -0.02
- `navVisc`: 0.26
- `errlOutlineThickness`: 2.5
- `hueShift`: 158
- `hueSat`: 0.9
- `classicGooStrength`: 0.187
- `classicGooWobble`: 0.432
- `classicGooSpeed`: 0.201
- `classicGooAutoSpeed`: 0.16
