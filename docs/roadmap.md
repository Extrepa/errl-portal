# Roadmap

Short-term
- Stabilize portal pages and links (about, apps, tools)
- Refine FX pipeline (bubbles, hue, goo) and remove duplicates
- Organize assets under `src/assets/portal`, `src/assets/shared`, and `src/assets/legacy`
- Decide on deployment target (GitHub Pages or static host)
- Bridge legacy studio experiments into the React hub (`/studio/*`)

Mid-term
- Introduce basic e2e smoke via Playwright
- Add CI for build + typecheck on PRs
- Create ADRs for navigation and asset strategy
- Unify asset store so Code Lab, Math Lab, and Shape Madness share uploads

Backlog
- Pin widget polish
- Dev panel presets
- Accessibility review
- Rewrite remaining legacy studio pages as React surfaces to retire the iframe fallback
