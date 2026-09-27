(() => {
  // Visual reference: https://gist.github.com/amroamroamro/617305c05001caffc8d0
  const groups = [...document.querySelectorAll('[data-harmonic]')];
  if (!groups.length) return;
  const harmonics = groups.map(group => ({
    frequency: Number(group.dataset.harmonic),
    amplitude: Number(group.dataset.amplitude),
    radius: group.querySelector('[data-radius]'),
    guide: group.querySelector('[data-guide]'),
    curve: group.querySelector('[data-curve]'),
    dot: group.querySelector('[data-dot]')
  }));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  let elapsed = 2000;
  let previous;
  let request;

  function draw() {
    const phase = (elapsed % 8000) / 8000 * 4 * Math.PI;
    const endX = 130 + 295 * phase / (4 * Math.PI);
    harmonics.forEach(({ frequency, amplitude, radius, guide, curve, dot }) => {
      const r = 50 * amplitude;
      const px = 66 + r * Math.cos(frequency * phase);
      const py = 90 - r * Math.sin(frequency * phase);
      radius.setAttribute('d', `M66 90L${px} ${py}`);
      guide.setAttribute('d', `M${px} ${py}H${endX}`);
      dot.setAttribute('cx', px);
      dot.setAttribute('cy', py);
      const points = [];
      const steps = Math.max(1, Math.ceil(phase * 40));
      for (let j = 0; j <= steps; j++) {
        const angle = phase * j / steps;
        points.push(`${j ? 'L' : 'M'}${130 + 295 * angle / (4 * Math.PI)},${90 - r * Math.sin(frequency * angle)}`);
      }
      curve.setAttribute('d', points.join(' '));
    });
  }

  function tick(now) {
    if (previous !== undefined) elapsed += Math.min(now - previous, 100);
    previous = now;
    draw();
    request = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(request);
    previous = undefined;
    if (!paused && !document.hidden) request = requestAnimationFrame(tick);
  }
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  draw();
  sync();
})();
