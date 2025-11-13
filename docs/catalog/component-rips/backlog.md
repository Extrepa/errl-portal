# Component Rips Backlog

Status legend:
- `raw`: untouched export
- `queued`: assigned for conversion
- `scaffold`: placeholder bundle created (awaiting real extraction)
- `gate`: needs safety/mutation controls
- `normalized`: converted into project bundle
- `demo-ready`: catalog preview loads without external deps
- `integrated`: used in portal/studio flows

| Component | Category | Path | Status | Notes |
| --- | --- | --- | --- | --- |
| Terrapin Whirl | background | `BG/TerrapinWhirl_BG.html` | normalized | Canvas swirl rebuilt; includes speed & trail controls. |
| Rainbow Tunnel | background | `BG/RainbowTunnel_BG.html` | normalized | Canvas swirl rebuilt with speed/direction/mask controls (`packages/component-rips/rainbow-tunnel`). |
| Rainbow String Particles | background | `BG/RainbowStringParticles_BG.html` | normalized | Canvas-based particle system with rainbow-colored particles connected by strings; adjustable particle count, connection distance, and speed. Could replace hero orbit background. |
| Gradient Box Button | button | `Buttons/Gradient_Box_Button.html` | normalized | Animated rainbow gradient button with text/angle/radius controls and hover effects. |
| Rainbow Spinning Button | button | `Buttons/RainbowSpinningBlackMiddle_Button_Box.html` | normalized | Circular button with spinning conic gradient and goo-filtered SVG mask; includes parallax tracking and spin speed controls. |
| Bubbling Rainbow Rings | cursor | `Cursors/BubblingRainbowRings_Cursor.html` | normalized | Cursor trail implemented with density + fade controls. |
| Rainbow Fluid Smoke | cursor | `Cursors/RainbowFluidSmoke_Cursor.html` | normalized | Cursor smoke trail with trail/glow controls and reduced-motion pause. |
| Fast Rainbow Rings | cursor | `Cursors/FastRainbowRings_Cursor.html` | normalized | Temporal echo pool cursor trail with expanding rainbow rings. Space key or button toggles forward/reverse time direction. |
| Holographic Cube | cursor | `Cursors/HolographicCube_Cursor.html` | normalized | 3D holographic cube cursor trail with rotating cubes following pointer. Features rainbow gradient faces, adjustable size, rotation speed, and trail length. |
| Terrapin Whirl Module | module | `Modules/TerrapinWhirl_Module.html` | normalized | Module variant of Terrapin Whirl with compact container; canvas-based particle swirl with pointer interaction and speed/trail controls. |
| Rainbow Neural Pathways | module | `Modules/RainbowNeuralPathways_Module.html` | normalized | Interactive particle network with gravity + frequency controls. |
| WebCam Effects | module | `Modules/WebCam_Effects_Module.html` | normalized | Permission-gated webcam module with RGB/Glitch/Mono modes; still requires security review before integration. |
| Rainbow Poof Balls | module | `Modules/RainbowPoofBalls_Module_LAG.html` | research | test performance, may need throttle |
| Live Gradient Mixer | module | `Modules/LiveGradientMixer_Module.html` | normalized | Gradient breeding lab with mutation + reseed + clipboard export. |
| Ribbon Topology | module | `Modules/RibbonTopology_Module_Prop.html` | normalized | Depth-sorted ribbon renderer with density/fade/color controls. |
| Particle Face Parallax Push | module | `Modules/ParticleFaceParallaxPush_Module.html` | raw | potential AR-style effect; ensure camera gating |
| Gradient Waves | text | `Text/GradientWaves_Text.html` | normalized | CSS wave headline with adjustable speed/amplitude + copy toggle. |
| Liquid Text | text | `Text/LiquidText_Text.html` | normalized | Liquid headline animation with adjustable amplitude/velocity/drift and color picker. |
| Taffy Typing | text | `Text/TaffyTyping_Text.html` | normalized | SVG text path with draggable handles for taffy-stretching; includes text/font size controls. |
| Errl Tunnel | prop | `Props/Errl_Tunnel_PropSwapSVG.html` | normalized | Tunnel effect overlay with multiple concentric rings zooming inward; adjustable speed and ring count. Useful for hero transitions. |
| Drippy Mirror | prop | `Props/DrippyMirror_PropSwapSVG.html` | research | confirm no reflective recursion performance hit |
| Silhouette Inversion | prop | `Props/SilouetteInversion_PropSwapSVG.html` | normalized | Visual illusion effect with color/hue inversion; toggle via Space key or button for afterimage effect. |
| Spectral Harp Membrane | misc | `SpectralHarpMembrane_Opening.html` | normalized | Interactive membrane visualization responding to pointer movement and optional microphone input. Spring-based physics creates ripple effects. Useful as intro vignette or ambient background. |
| Holographic Cursor Trail | portable | `Holographic Cursor Trail/component.html` | raw | convert TSX bundle |
| Bubble Mouse Trail | portable | `Bubble_Mouse_Trail/component.html` | raw | needs module extraction |
| Mimic Kit Cursor Trail | portable | `Mimic_Kit_v1/components/cursor_trail.html` | raw | baseline for shared cursor utilities |

