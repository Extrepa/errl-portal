# Portal navigation, Design visibility, forum-aligned header

**Status:** Shipped on `main` (2026-04).  
**Scope:** Landing orb nav, static pill headers, React `PortalHeader`, WebGL orbs, Errl Phone.

## Behavior

- **Default:** The **Design** entry is **hidden** (not removed from HTML) until enabled.
- **Storage:** `localStorage` key `errl_portal_show_design_nav` — only set to `'true'` when the user turns on **Show Design in navigation** (Errl Phone → **DEV** → Portal (admin)).
- **Document flag:** `html[data-errl-hide-design-nav]` toggles CSS that hides `[data-errl-nav="design"]`. A small inline script in the `<head>` of key pages reduces first-paint flash.
- **Subpages:** [`src/shared/scripts/portal-nav-visibility.mjs`](../../src/shared/scripts/portal-nav-visibility.mjs) syncs the same key and dispatches `errl-design-nav-visibility` for same-tab updates.

## Code map

| Area | File(s) |
|------|---------|
| Phone toggle, visible-bubble helper, skin/GL sync | [`src/apps/landing/scripts/portal-app.js`](../../src/apps/landing/scripts/portal-app.js) |
| WebGL orbs (visible only + rebuild) | [`src/apps/landing/scripts/webgl.js`](../../src/apps/landing/scripts/webgl.js) |
| Shared header (forum-style dark/cyan) | [`src/shared/styles/errlPortalHeader.css`](../../src/shared/styles/errlPortalHeader.css) |
| Studio header | [`src/apps/studio/src/app/components/portal-header.css`](../../src/apps/studio/src/app/components/portal-header.css) (imports shared) |
| React nav | [`src/apps/studio/src/app/components/PortalHeader.tsx`](../../src/apps/studio/src/app/components/PortalHeader.tsx) |

## Tests

- Playwright: `@controls Design nav hidden by default; DEV toggle shows Design bubble` in [`tests/errl-phone-controls.spec.ts`](../../tests/errl-phone-controls.spec.ts).
- Related nav/UI tests were updated for default-hidden Design and viewport behavior.

## Admin note

Controls are **client-only** (anyone can change `localStorage`). Server-side or signed flags are out of scope here.

## Reference

- Forum visual reference: `errl-portal-forum-docs` — `src/app/globals.css` (`.site-header`).
- Errl Phone layers and WebGL: [errl-phone-capabilities.md](./errl-phone-capabilities.md).
