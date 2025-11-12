# Particle System Benchmark

> Context: Testing ParticleContainer vs Instanced Container approach for burst effects  
> Related: Plan Item 4 — ParticleContainer optimization follow-up from layer audit

## Test Setup

### Browser
- **Target**: Safari (macOS/iOS) — primary concern due to 5GB+ backing layer issue
- **Compare**: Chrome/Firefox for baseline comparison

### Metrics to Capture
1. **Memory** (Safari Layers panel)
   - Graphics memory before burst
   - Graphics memory during burst (peak)
   - Graphics memory after burst cleanup
   - Layer count changes

2. **Performance**
   - FPS during burst animation
   - Frame drops / jank
   - Time to cleanup (burst → destroy)

3. **Visual Quality**
   - Confirm no visual regressions
   - Check particle color/size/motion

## Test Procedure

### 1. Open Portal in Dev Mode
```bash
npm run dev
# Navigate to http://localhost:5173/
```

### 2. Open Safari Web Inspector
- Develop → Show Web Inspector
- Go to Layers tab
- Enable "Show Graphics Memory" + "Show Paints"

### 3. Baseline Measurement (No Burst)
```js
// In console
const baseline = {
  layers: /* count from Layers panel */,
  memory: /* Graphics Memory total */
};
console.log('Baseline:', baseline);
```

### 4. Test Legacy ParticleContainer
```js
// Force legacy mode
errlGLBurstLegacy(960, 540); // center burst

// Wait 1 second for particles to spawn, then measure
setTimeout(() => {
  console.log('Legacy peak memory:', /* read from Layers panel */);
}, 1000);

// Wait for cleanup (3-4 seconds total), measure again
setTimeout(() => {
  console.log('Legacy post-cleanup:', /* read from Layers panel */);
}, 4000);
```

### 5. Test Instanced Container (NEW)
```js
// Refresh page to clear state
location.reload();

// After page loads, trigger instanced version
errlGLBurstInstanced(960, 540);

// Same timing as legacy
setTimeout(() => {
  console.log('Instanced peak memory:', /* read from Layers panel */);
}, 1000);

setTimeout(() => {
  console.log('Instanced post-cleanup:', /* read from Layers panel */);
}, 4000);
```

### 6. Stress Test (Multiple Bursts)
```js
// Test rapid-fire bursts
for (let i = 0; i < 5; i++) {
  setTimeout(() => {
    errlGLBurstInstanced(Math.random() * 1920, Math.random() * 1080);
  }, i * 500);
}

// Monitor memory growth and cleanup behavior
```

## Results Template

### Legacy ParticleContainer
- Baseline memory: ___ MB
- Peak memory (during burst): ___ MB (+___ MB delta)
- Post-cleanup memory: ___ MB
- Layer count change: ___ → ___ → ___
- FPS during burst: ___ fps (drops: ___)
- Texture count: 600 unique textures generated
- Ticker callbacks: 600 individual functions

### Instanced Container (NEW)
- Baseline memory: ___ MB
- Peak memory (during burst): ___ MB (+___ MB delta)
- Post-cleanup memory: ___ MB
- Layer count change: ___ → ___ → ___
- FPS during burst: ___ fps (drops: ___)
- Texture count: 1 shared texture
- Ticker callbacks: 1 batch function

### Analysis
- **Memory savings**: ___ MB (___ % reduction)
- **Performance**: ___ fps improvement / degradation
- **Texture overhead**: 600 → 1 textures (___ % reduction)
- **Ticker overhead**: 600 → 1 callbacks (___ % reduction)

## Implementation Details

### Legacy Approach (ParticleContainer)
- **File**: `src/portal/core/webgl.js` lines 568-619
- **Method**: Individual `PIXI.Sprite` per particle, each with unique texture
- **Ticker**: 600 separate ticker callbacks (one per particle)
- **Cleanup**: Individual destroy calls per sprite + texture
- **Blend mode**: Applied per sprite

### Instanced Approach (Container)
- **File**: `src/portal/core/webgl.js` lines 490-566
- **Method**: Single shared texture, tinted sprites
- **Ticker**: Single batch ticker for all particles
- **Cleanup**: Single container destroy
- **Blend mode**: Applied to container (one compositing pass)

## Key Optimizations in Instanced Version

1. **Single Texture**: One procedural circle reused via tint (vs 600 unique textures)
2. **Batch Updates**: Single ticker function iterates array (vs 600 closures)
3. **Container Blend**: Blend mode on parent (vs per-sprite)
4. **Batch Cleanup**: One destroy call for entire batch
5. **Reduced GC**: Fewer object allocations, single array of data

## Decision Criteria

**Adopt instanced if:**
- Memory reduction ≥ 20% during burst
- No FPS regression (or FPS improvement)
- Visual quality maintained

**Keep legacy if:**
- Memory savings < 20%
- FPS drops > 5fps
- Visual artifacts introduced

## Next Steps

1. Run benchmark in Safari (fill in results above)
2. Compare against Chrome/Firefox for sanity check
3. If beneficial, update `USE_INSTANCED_BURST = true` (already default)
4. Remove legacy code path if instanced is clearly superior
5. Document final decision in `docs/perf/2025-11-09-results.md`
