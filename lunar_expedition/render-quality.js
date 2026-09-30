// Measure sustained active frame times, not one-off loading stalls.
export function createRenderQuality(initialRatio, onChange) {
  let ratio = initialRatio;
  let warmup = 0, seconds = 0, frames = 0;
  const minimum = initialRatio * 0.6;
  function update(delta) {
    if (!(delta > 0 && delta < 0.25)) { seconds = frames = 0; return; }
    warmup += delta;
    if (warmup < 3) return;
    seconds += delta;
    frames += 1;
    if (seconds < 2) return;
    if (frames / seconds < 45 && ratio > minimum) {
      ratio = Math.max(minimum, ratio - initialRatio * 0.12);
      onChange(ratio);
    }
    seconds = frames = 0;
  }
  return { update };
}
