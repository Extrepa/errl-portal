// Example script: rains coins periodically
// API: Buddy, Tools, State, onTick, View

let t = 0;
onTick(() => {
  t += 1;
  // roughly every ~15 frames on average, drop a coin
  if (Math.random() < 0.07) {
    const x = 40 + Math.random() * (View.width() - 80);
    const r = 8 + Math.random() * 10;
    Tools.spawnCoin(x, -30, r);
  }
});
