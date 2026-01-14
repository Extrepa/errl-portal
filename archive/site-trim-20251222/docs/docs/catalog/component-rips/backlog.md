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
| Rainbow Trailing Orbs | cursor | `Cursors/RainbowTrailingOrbs_Cursor.html` | normalized | Cursor trail with rainbow-colored beads using spring physics. Each bead follows the previous one creating a smooth trailing effect with adjustable count, drag, and size. |
| Simple Blue Bubble Trail | cursor | `Cursors/SimpleBlueBubbleTrail_Cursor.html` | normalized | Simple blue-to-cyan bubble trail cursor effect with spring physics. Rebuilt from Framer export as standalone canvas implementation. |
| Fluffy Pixel Trail | cursor | `Cursors/FluffyPixelTrail_Cursor.html` | normalized | Pixelated cursor trail with fluffy particle bursts. Particles spawn at cursor with random velocities and fade over time. Adjustable spawn rate, decay, and pixel size. |
| Pixel Square Rainbow | cursor | `Cursors/PixelSquareRainbow_Cursor.html` | normalized | Pixelated square cursor trail with rainbow color cycling. Squares spawn at cursor and fade while cycling through rainbow hues. |
| Weird Motion Trace | cursor | `Cursors/WeirdMotionTrace_Cursor.html` | normalized | Distorted motion trace cursor with sine/cosine distortion effects. Trail follows cursor with time-based distortion creating wavy motion. |
| Rainbow Spinning | background | `BG/RainbowSpinning_BG.html` | normalized | MIDI-reactive chromafog background with spinning conic gradient. Features adjustable hue rotation and bloom opacity. Optional MIDI support gated behind explicit button. |
| Anisotropic Velvet | background | `BG/AnisotropicVelvet_BG.html` | normalized | Interactive velvet texture with anisotropic lighting. Drag pointer to comb the velvet and change lighting direction. |
| Basic Shadow Bubbles | background | `BG/BasicShadowBubbles_BG.html` | normalized | Caustic sparkles under frosted glass. Interactive bubble particles that respond to pointer movement. |
| Band W Squiggle | background | `BG/BandWSquiggle_BG.html` | normalized | Time-crystal particle trails with difference blending mode. Particles move in circular patterns creating glowing trails. |
| Wire Grid | background | `BG/WireGrid_BG.html` | normalized | Interactive wire grid that warps around pointer movement. Grid lines bend and distort based on cursor proximity. |
| Parallax Shooting Stars | background | `BG/ParallaxShootingStars_BG.html` | normalized | Parallax starfield with depth-based warping. Stars move in circular patterns with parallax effect and chroma trails. |
| Suttle Rainbow Wisps | background | `BG/SuttleRainbowWisps_BG.html` | normalized | Glowing script-veins that rewrite themselves. Animated lines move in organic patterns creating hypnotic effect. |
| Trippy Broken Triangles | background | `BG/TrippyBrokenTriangles_BG.html` | normalized | Interactive Voronoi diagram with pulsing bubble cells. Press P to add points. Cells pulse and animate creating dynamic pattern. |
| Terrapin Whirl Module | module | `Modules/TerrapinWhirl_Module.html` | normalized | Module variant of Terrapin Whirl with compact container; canvas-based particle swirl with pointer interaction and speed/trail controls. |
| Rainbow Neural Pathways | module | `Modules/RainbowNeuralPathways_Module.html` | normalized | Interactive particle network with gravity + frequency controls. |
| WebCam Effects | module | `Modules/WebCam_Effects_Module.html` | normalized | Permission-gated webcam module with RGB/Glitch/Mono modes; still requires security review before integration. |
| Rainbow Poof Balls | module | `Modules/RainbowPoofBalls_Module_LAG.html` | research | test performance, may need throttle |
| Live Gradient Mixer | module | `Modules/LiveGradientMixer_Module.html` | normalized | Gradient breeding lab with mutation + reseed + clipboard export. |
| Ribbon Topology | module | `Modules/RibbonTopology_Module_Prop.html` | normalized | Depth-sorted ribbon renderer with density/fade/color controls. |
| Paint Splat Mix | module | `Modules/PaintSplatMix_Module.html` | normalized | Interactive paint splat effect with rainbow colors. Click and drag to create paint splats that blend and fade. |
| Kaleido Spin Top String | module | `Modules/KaleidoSpinTopString_Module.html` | normalized | Interactive kaleidoscope drawing tool with radial symmetry. Draw with pointer, press Q/W to adjust symmetry count. |
| Spinning Rainbow Black Hole | module | `Modules/SpinningRainbowBlackHole_Module.html` | normalized | Interactive prism lens effect with rainbow background. Drag to move prism, scroll to adjust refraction strength. |
| Particle Face Parallax Push | module | `Modules/ParticleFaceParallaxPush_Module.html` | raw | potential AR-style effect; ensure camera gating |
| Gradient Waves | text | `Text/GradientWaves_Text.html` | normalized | CSS wave headline with adjustable speed/amplitude + copy toggle. |
| Liquid Text | text | `Text/LiquidText_Text.html` | normalized | Liquid headline animation with adjustable amplitude/velocity/drift and color picker. |
| Taffy Typing | text | `Text/TaffyTyping_Text.html` | normalized | SVG text path with draggable handles for taffy-stretching; includes text/font size controls. |
| Errl Tunnel | prop | `Props/Errl_Tunnel_PropSwapSVG.html` | normalized | Tunnel effect overlay with multiple concentric rings zooming inward; adjustable speed and ring count. Useful for hero transitions. |
| Drippy Mirror | prop | `Props/DrippyMirror_PropSwapSVG.html` | research | confirm no reflective recursion performance hit |
| Silhouette Inversion | prop | `Props/SilouetteInversion_PropSwapSVG.html` | normalized | Visual illusion effect with color/hue inversion; toggle via Space key or button for afterimage effect. |
| Spectral Harp Membrane | misc | `SpectralHarpMembrane_Opening.html` | normalized | Interactive membrane visualization responding to pointer movement and optional microphone input. Spring-based physics creates ripple effects. Useful as intro vignette or ambient background. |
| Afterimage Pulse | prop | `Props/AfterimagePulse_Prop.html` | normalized | Pulsing afterimage effect using color inversion. Image alternates between normal and inverted colors with opacity pulsing. |
| Moire Melt | prop | `Props/MoireMeltProp_Meh.html` | normalized | Moire pattern effect using two overlapping images with difference blend mode. Adjustable offset, rotation, and pulse intensity. |
| Purple Smile Confetti | button | `Buttons/PurpleSmileHoverConfetti_Button.html` | normalized | Purple smile button with rainbow confetti particles on hover. Continuous confetti stream while hovering. |
| Rainbow Dot Suttle Gradient | background | `BG/RainbowDotSuttleGradient_BG.html` | normalized | Animated background with hexagonal dot pattern overlay and subtle rainbow gradient layers. Multiple radial gradients create depth with gentle movement. |
| Side Scrolling BW Square Wall | background | `BG/SideScrollingBWSquareWall_BG.html` | normalized | Black and white checkerboard pattern that scrolls horizontally. Creates an infinite scrolling wall effect with alternating square pattern. |
| Rainbow Square Grid | background | `BG/RainbowSquareGrid_BG.html` | normalized | Animated rainbow-colored square grid pattern. Colors cycle through the spectrum based on position and time, creating a vibrant grid effect. |
| Bubble Buster | background | `BG/BubbleBuster_BG.html` | normalized | Animated bubble background with floating rainbow bubbles. Bubbles rise from bottom to top with gentle horizontal drift and color cycling. |
| 3in1 Mix It Up | module | `Modules/3in1MixItUp_Module.html` | normalized | Three-in-one interactive module featuring Ripple (height-field water simulation), Kaleido (kaleidoscope pattern generator), and Moiré (rotating pattern effect). Switch between modes with buttons or keyboard shortcuts (1/2/3). |
| Holographic Cursor Trail | portable | `Holographic Cursor Trail/component.html` | normalized | Already normalized in packages/component-rips/holographic-cursor-trail |
| Bubble Mouse Trail | portable | `Bubble_Mouse_Trail/component.html` | normalized | Already normalized in packages/component-rips/bubble-mouse-trail |
| Mimic Kit Cursor Trail | portable | `Mimic_Kit_v1/components/cursor_trail.html` | raw | baseline for shared cursor utilities |

