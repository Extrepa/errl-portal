# Cursor Notes - 2026-04-30

## ERRL About + Studio modular refresh

- Replaced hardcoded About page narrative blocks with modular content-driven rendering.
- Added new "About Extrepa" section scaffold with editable placeholder profile data.
- Added "Explore the Portal" directional cards to route visitors deeper into key areas.
- Reworked Studio page to render project cards from structured data.
- Added readiness scale (1-5), blockers, contribution ideas, tags, and last-updated metadata.
- Introduced shared static render helpers used by both About and Studio static pages.
- Build validation passed with existing non-blocking warnings unrelated to this change.

## About copy rewrite pass (balanced voice)

- Rewrote `about-content.mjs` copy to balance atmosphere with clearer first-time user orientation.
- Removed placeholder Extrepa text and replaced it with polished default starter copy.
- Aligned Explore card CTA phrasing to consistent "Explore X" language and reordered cards by newcomer priority.
- Added explicit bridge copy connecting vibe-coding ethos to Studio build-state transparency.
- Normalized Studio project CTA labels to "Open Tool" for cleaner action consistency.
- Verified updated copy against canonical shipped-route docs to avoid overstating live capabilities.
- Re-ran `npm run portal:build`; build passed with existing non-blocking warnings.

## About origin clarification

- Updated About narrative to clearly separate ERRL's hand-drawn, pre-AI origin from the AI-assisted website/tooling workflow.
- Adjusted hero/intro and vibe-coding lines so AI attribution applies to site implementation, not character creation.
- Confirmed no lint issues after the copy correction.
