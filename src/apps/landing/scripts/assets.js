// Errl asset map: single source of truth for canonical asset paths
// Use this to ensure the body is used by default and the face is only used where explicitly requested.
const base = import.meta.env.BASE_URL || '/';

window.ERRL_ASSETS = {
  body: `${base}shared/assets/portal/L4_Central/errl-body-with-limbs.svg`,
  face: `${base}shared/assets/portal/L4_Central/errl-face-2.svg`,
};
