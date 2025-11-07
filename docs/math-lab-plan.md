# Math Lab Implementation Plan — 88 Effects

## Overview
Plan for implementing all 88 placeholder effects (61-148) in the Psychedelic Math Lab.

## Implementation Strategy

### Phase 1: Simple CSS/Canvas Effects (Quick wins)
**Priority: High** — Easy to implement, immediate visual impact

1. **moire-lines** (61) — Radial Moiré — Two rotating line fields
2. **superellipse** (68) — Superellipse Frames — Minkowski curves
3. **lissajous** (67) — Lissajous Lace — Parametric harmonics
4. **mod-bands** (99) — Modulus Bands — Striped patterns
5. **polar-roses** (104) — Polar Roses — r=cos(kθ) petals
6. **conics** (105) — Hypnotic Conics — Ellipses/hyperbolas
7. **spirograph** (89) — Spirograph Engines — Hypotrochoids
8. **radial-weave** (121) — Radial Gradient Weave — Interlaced radials

**Estimated time:** 2-3 hours

---

### Phase 2: Noise-Based Effects
**Priority: High** — Reusable noise primitives

9. **perlin-smoke** (62) — Perlin Smoke Sheets — 2D noise advection
10. **worley** (102) — Worley Noise Cells — Cellular noise
11. **fbm-sky** (116) — fBm Sky — Layered noise clouds
12. **marble** (125) — Signed Noise Marble — Turbulence veins
13. **contours** (87) — Topo Contour Lines — Heightmap contours
14. **nebula** (146) — Hypershift Gradient Nebula — Gradients + noise

**Estimated time:** 3-4 hours

---

### Phase 3: Particle Systems
**Priority: Medium** — Extend existing particleField primitive

15. **curl-rivers** (63) — Curl Noise Rivers — Particles on curl field
16. **metaballs** (103) — Metaballs Pool — Soft merging blobs
17. **dla** (117) — Diffusion-Limited Aggregation — Random walker crystals
18. **nbody** (142) — Orbital Flow Trails — N-body trails
19. **bedforms** (90) — Butterfly Field Dunes — Vector field ripples
20. **polar-foam** (133) — Polar Foam Packing — Circular foam

**Estimated time:** 4-5 hours

---

### Phase 4: Fractals & Recursive Patterns
**Priority: High** — Classic visual appeal

21. **newton** (92) — Newton Fractal z³−1 — Basins of attraction
22. **fern** (93) — Barnsley Fern — IFS rendering
23. **koch** (94) — Koch Snowflake — Recursive edge growth
24. **dragon** (95) — Dragon Curve Ribbon — Self-similar folds
25. **hilbert** (96) — Hilbert Space Fill — Space-filling curve
26. **sierpinski** (134) — Sierpinski Tri Tiles — Recursive tri removal
27. **menger** (91) — Menger Carpet Cuts — Recursive holes
28. **apollonian** (66) — Apollonian Gasket — Packed tangent circles

**Estimated time:** 5-6 hours

---

### Phase 5: Geometric Patterns
**Priority: Medium** — Visual variety

29. **circle-pack** (75) — Circle Packing Waves — Greedy packing
30. **voronoi** (147) — Voronoi Bloom — Relaxed cells mosaic
31. **delaunay** (148) — Delaunay Wireframe — Triangulated mesh
32. **voronoi-pulse** (111) — Pulsing Voronoi Rings — Annular cells
33. **kaleid-voronoi** (123) — Kaleid Voronoi Mirror — Mirrored sectors
34. **quasicrystal** (64) — Quasicrystal Starfield — Aperiodic tilings
35. **penrose** (65) — Penrose Kite-Dart — Aperiodic tiling
36. **bitmask** (97) — Bitmask Quilt — Cellular bitwise textures

**Estimated time:** 4-5 hours

---

### Phase 6: Complex Math & Attractors
**Priority: Medium** — Advanced mathematics

37. **clifford** (69) — Clifford Attractor Glow — Strange attractor
38. **ikeda** (70) — Ikeda Map Mist — Chaotic map
39. **lorenz** (71) — Lorenz Ribbon — Butterfly attractor
40. **roots-garden** (124) — Complex Roots Garden — Polynomial basins
41. **strange-map** (85) — Strange Map Scroll — Iterated complex maps
42. **phase-carpets** (77) — Complex Phase Carpets — Phase-only coloring
43. **log-spirals** (108) — Complex Log Spirals — Growth spirals
44. **warp-grids** (132) — Complex Warp Grids — Sample grids through maps

**Estimated time:** 6-7 hours

---

### Phase 7: Advanced Rendering
**Priority: Low** — Complex but impressive

45. **raymarch-2d** (83) — Raymarch Glow Orbs — Soft min blending
46. **sdf-play** (82) — SDF Shape Playground — Smooth unions
47. **hyper-grid** (81) — Hyperbolic Grid Warp — Curved grid lines
48. **trefoil** (86) — Trefoil Tube — 3D-like projection
49. **parallax** (78) — Heightmap Parallax — Tilted layers
50. **eikonal** (119) — Eikonal Rays — Variable medium rays

**Estimated time:** 5-6 hours

---

### Phase 8: Wave & Interference
**Priority: Medium** — Physics-based

51. **interference** (84) — Wave Interference Flowers — Radial wave sums
52. **chladni** (139) — Chladni Plate Nodes — Nodal vibration patterns
53. **wavelet** (110) — Wavelet Tapestry — Localized wave sum
54. **polar-labyrinth** (143) — Polar Sine Labyrinth — Thresholded sine
55. **caustic-grid** (118) — Sunken Grid Caustics — Refractive displacement
56. **conic-caustics** (79) — Conic Caustics — Simulated light caustics

**Estimated time:** 4-5 hours

---

### Phase 9: Text & Image Effects
**Priority: Low** — Specialized use cases

57. **diffraction-text** (88) — Diffraction Text Grids — Text + grids
58. **halftone** (145) — Halftone Warp Portrait — Live halftone
59. **shadow-text** (129) — Shadow March Text — Moving shadows
60. **glyph-drift** (131) — Bezier Glyph Drift — Text outline drift
61. **sinewarp-text** (114) — Sinewarp Text — BG-position warp
62. **logo-melt** (144) — Conformal Logo Melt — Warp logo

**Estimated time:** 3-4 hours

---

### Phase 10: Specialized Effects
**Priority: Low** — Unique visual styles

63. **turing** (80) — Turing Stripe Garden — Gray–Scott RD
64. **edge-react** (72) — Reaction Rings — Edge detect feedback
65. **kaleidoscope** (73) — Kaleidoscope Shader — Mirror tessellation
66. **hex-flow** (74) — Hex Flow Field — Velocity vectors
67. **fourier** (76) — Fourier Drawing — Epicycles
68. **primes** (98) — Prime Spiral Constellations — Primes on spirals
69. **phyllotaxis** (100) — Phyllotaxis Seeds — Sunflower spirals
70. **golden-flow** (122) — Golden Angle Flow — Phyllotaxis streamlines

**Estimated time:** 5-6 hours

---

### Phase 11: Advanced Patterns
**Priority: Low** — Complex implementations

71. **super-terrain** (101) — Superformula Terrain — Radial height field
72. **polar-zipper** (130) — Polar SDF Zipper — Stitched radial shapes
73. **polar-bricks** (137) — Polar Brickwork — Concentric bricks
74. **quilt-conics** (140) — Quilted Conics — Patchwork tiles
75. **bilateral** (141) — Bilateral Symmetry Paint — Rorschach mirroring
76. **escher-tiles** (113) — Escherized Tessellations — Morph tiles
77. **svg-mesh** (112) — Gradient Mesh Beasts — SVG mesh blend
78. **bezier-foam** (115) — Bezier Foam — Bubble-like cells

**Estimated time:** 6-7 hours

---

### Phase 12: Remaining Effects
**Priority: Low** — Final touches

79. **torus-knot** (109) — Torus Knot Map — Parametric knot
80. **harmonics** (106) — Spherical Harmonics Heat — 2D projection
81. **moire-checker** (107) — Moiré Checker Warps — Offset grids
82. **anamorph** (120) — Anamorphic Stretch — Transform illusions
83. **orbit-rings** (126) — Gradient Orbit Rings — Conic rings
84. **flames** (127) — Fractal Flames 2D — Variations
85. **amoeba** (128) — Amoeba Marchers — Elastic contours
86. **tangent-trails** (135) — Tangent Bundle Trails — Field alignment
87. **arc-weave** (136) — Arc Lattice Weave — Over/under weaving
88. **lichtenberg** (138) — Gasket Lightning — Stochastic branching

**Estimated time:** 6-7 hours

---

## Total Estimated Time: 60-70 hours

## Implementation Order (Optimized)

**Week 1 (Quick wins):**
- Phase 1: Simple CSS/Canvas (8 effects)
- Phase 2: Noise-based (6 effects)
- Phase 4: Fractals (8 effects)

**Week 2 (Core systems):**
- Phase 3: Particle systems (6 effects)
- Phase 5: Geometric patterns (8 effects)
- Phase 6: Complex math (8 effects)

**Week 3 (Advanced):**
- Phase 7: Advanced rendering (6 effects)
- Phase 8: Wave & interference (6 effects)
- Phase 9: Text/image (6 effects)

**Week 4 (Polish):**
- Phase 10: Specialized (8 effects)
- Phase 11: Advanced patterns (8 effects)
- Phase 12: Remaining (10 effects)

---

## Code Organization Strategy

1. **Reuse existing primitives:**
   - `particleField` → curl-rivers, metaballs, dla, nbody
   - `makeCanvas` → all canvas-based effects
   - `cssBlock` → simple CSS effects
   - `svgGridWarp` → grid-based effects

2. **Create new primitives:**
   - `noise2D()` — Perlin/simplex noise function
   - `fractalRenderer()` — Generic fractal renderer
   - `vectorField()` — Flow field system
   - `recursiveShape()` — Recursive pattern generator

3. **Shared utilities:**
   - `complexMath.js` — Complex number operations
   - `geometry.js` — Geometric calculations
   - `noise.js` — Noise functions
   - `color.js` — Color space conversions

---

## Progress Tracking

- [ ] Phase 1: 0/8
- [ ] Phase 2: 0/6
- [ ] Phase 3: 0/6
- [ ] Phase 4: 0/8
- [ ] Phase 5: 0/8
- [ ] Phase 6: 0/8
- [ ] Phase 7: 0/6
- [ ] Phase 8: 0/6
- [ ] Phase 9: 0/6
- [ ] Phase 10: 0/8
- [ ] Phase 11: 0/8
- [ ] Phase 12: 0/10

**Total: 0/88**

---

*This plan will be updated as implementation progresses.*

