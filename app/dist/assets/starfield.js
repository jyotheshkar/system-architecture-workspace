const TAU = Math.PI * 2;
const FRAME_INTERVAL = 1000 / 24;

function seededRandom(initial) {
  let seed = initial >>> 0;
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export function mountStarfield({ fixedViewport = false, canvasElement = null, density = 1 } = {}) {
  const canvas = canvasElement || document.getElementById('page-starfield');
  const context = canvas?.getContext('2d', { alpha: true });
  if (!context) { if(canvas)canvas.dataset.sky='fallback';return { setPaused() {}, dispose() {} }; }
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const starDensity = Number.isFinite(density) ? Math.max(0, Math.min(1, density)) : 1;
  const shell = document.querySelector('.page-shell');
  const cache = document.createElement('canvas');
  const cacheContext = cache.getContext('2d', { alpha: true });
  if (!cacheContext) { canvas.dataset.sky='fallback';return { setPaused() {}, dispose() {} }; }

  let width = 0, height = 0, ratio = 1;
  let glints = [], meteors = [];
  let elapsed = 0, nextMeteor = 5, meteorCount = 0;
  let paused = false, disposed = false, frameId = 0, lastTime = 0;
  const meteorRandom = seededRandom(460719);

  function glow(target, x, y, radius, color, alpha) {
    const light = target.createRadialGradient(x, y, 0, x, y, radius);
    light.addColorStop(0, `rgba(${color},${alpha})`);
    light.addColorStop(0.16, `rgba(${color},${alpha * 0.58})`);
    light.addColorStop(0.46, `rgba(${color},${alpha * 0.15})`);
    light.addColorStop(1, `rgba(${color},0)`);
    target.fillStyle = light;
    target.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  function buildCache() {
    cacheContext.clearRect(0, 0, width, height);
    const random = seededRandom(193071);
    const baselineCount = Math.min(2000, Math.max(650, Math.ceil(width * height / 470)));
    const count = Math.round(baselineCount * starDensity);
    const glintLimit = Math.round(24 * starDensity);
    glints = [];
    for (let i = 0; i < count; i++) {
      const x = random() * width;
      const y = random() * height;
      const radius = 0.18 + Math.pow(random(), 2.8) * 0.52;
      const alpha = 0.10 + Math.pow(random(), 0.80) * 0.33;
      if (radius > 0.65) glow(cacheContext, x, y, radius * 2.4, '247,250,255', alpha * 0.08);
      cacheContext.fillStyle = `rgba(247,250,255,${alpha})`;
      cacheContext.beginPath();
      cacheContext.arc(x, y, radius, 0, TAU);
      cacheContext.fill();
      if (radius > 0.52 && glints.length < glintLimit) {
        glints.push({ x, y, radius, alpha, phase: random() * TAU,
          period: 9.0 + random() * 13.0, strength: 0.06 + random() * 0.08 });
      }
    }
    canvas.dataset.stars = String(count);
    canvas.dataset.starDensity = String(starDensity);
    canvas.dataset.glints = String(glints.length);
    canvas.dataset.sky = 'dense-distant-stars';
  }

  function spawnMeteor() {
    if (meteors.length >= 1) return;
    const left = meteorRandom() < 0.5;
    const viewportHeight = Math.min(window.innerHeight || height, height);
    const visibleTop = fixedViewport ? 0 : Math.max(0, Math.min(height - viewportHeight, window.scrollY || 0));
    const travel = Math.min(240, width * (0.14 + meteorRandom() * 0.09));
    const startX = left ? width * (0.18 + meteorRandom() * 0.32) : width * (0.62 + meteorRandom() * 0.35);
    const startY = visibleTop + viewportHeight * (0.03 + meteorRandom() * 0.64);
    meteors.push({ born: elapsed, duration: 1.15 + meteorRandom() * 0.5,
      x: startX, y: startY, dx: -travel, dy: travel * (0.48 + meteorRandom() * 0.24),
      length: Math.min(85, travel * 0.68) });
    meteorCount++;
    canvas.dataset.meteors = String(meteorCount);
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    context.drawImage(cache, 0, 0, cache.width, cache.height, 0, 0, width, height);
    if (preference.matches) return;
    context.save();
    context.globalCompositeOperation = 'screen';
    // Only the brightest stars shimmer dynamically; most of the sky stays still.
    for (const star of glints) {
      const wave = (Math.sin(elapsed * TAU / star.period + star.phase) + 1) * 0.5;
      const brightness = Math.pow(wave, 5) * star.strength;
      if (brightness < 0.004) continue;
      glow(context, star.x, star.y, star.radius * 2.0, '247,250,255', brightness * 0.35);
      context.fillStyle = `rgba(255,255,255,${brightness})`;
      context.beginPath();
      context.arc(star.x, star.y, star.radius * 1.03, 0, TAU);
      context.fill();
    }
    for (const meteor of meteors) {
      const age = (elapsed - meteor.born) / meteor.duration;
      const opacity = Math.sin(Math.PI * Math.min(1, Math.max(0, age))) * 0.56;
      const x = meteor.x + meteor.dx * age, y = meteor.y + meteor.dy * age;
      const distance = Math.hypot(meteor.dx, meteor.dy);
      const tailX = x - meteor.dx / distance * meteor.length;
      const tailY = y - meteor.dy / distance * meteor.length;
      const trail = context.createLinearGradient(tailX, tailY, x, y);
      trail.addColorStop(0, 'rgba(238,245,255,0)');
      trail.addColorStop(0.76, `rgba(238,245,255,${opacity * 0.36})`);
      trail.addColorStop(1, `rgba(255,255,255,${opacity})`);
      context.strokeStyle = trail;
      context.lineWidth = 0.75;
      context.lineCap = 'round';
      context.beginPath(); context.moveTo(tailX, tailY); context.lineTo(x, y); context.stroke();
      glow(context, x, y, 2, '247,250,255', opacity * 0.35);
    }
    context.restore();
  }

  function resize() {
    if (disposed) return;
    const nextWidth = Math.max(1, document.documentElement.clientWidth);
    const nextHeight = fixedViewport ? Math.max(1, window.innerHeight) : Math.max(window.innerHeight || 1,
      Math.ceil(shell?.getBoundingClientRect().height || 0),
      document.documentElement.scrollHeight || 0);
    const nextRatio = Math.min(devicePixelRatio || 1, 1.5);
    if (nextWidth === width && nextHeight === height && nextRatio === ratio) return;
    width = nextWidth; height = nextHeight; ratio = nextRatio;
    for (const surface of [canvas, cache]) {
      surface.width = Math.round(width * ratio);
      surface.height = Math.round(height * ratio);
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    cacheContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    meteors = [];
    buildCache(); draw();
  }

  function active() { return !disposed && !paused && !preference.matches && !document.hidden; }
  function schedule() {
    cancelAnimationFrame(frameId); frameId = 0; lastTime = 0;
    canvas.dataset.motion = disposed ? 'disposed' : preference.matches ? 'reduced' : paused ? 'paused' : document.hidden ? 'hidden' : 'running';
    if (!disposed && preference.matches) { meteors = []; draw(); }
    if (active()) frameId = requestAnimationFrame(frame);
  }
  function frame(now) {
    frameId = 0;
    if (!active()) return;
    if (!lastTime) lastTime = now;
    if (now - lastTime >= FRAME_INTERVAL) {
      elapsed += Math.min((now - lastTime) / 1000, 0.12);
      lastTime = now;
      if (elapsed >= nextMeteor) {
        spawnMeteor(); nextMeteor = elapsed + 8 + meteorRandom() * 6;
      }
      meteors = meteors.filter(meteor => elapsed - meteor.born < meteor.duration);
      canvas.dataset.skyTime = elapsed.toFixed(2);
      draw();
    }
    frameId = requestAnimationFrame(frame);
  }
  window.addEventListener('resize', resize);
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
  if (shell) observer?.observe(shell);
  observer?.observe(document.documentElement);
  document.addEventListener('visibilitychange', schedule);
  preference.addEventListener('change', schedule);
  resize(); schedule();
  return {
    setPaused(value) { if (disposed) return; paused = Boolean(value); schedule(); },
    dispose() {
      if (disposed) return;
      disposed = true; schedule(); observer?.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', schedule);
      preference.removeEventListener('change', schedule);
      glints = []; meteors = []; cache.width = 1; cache.height = 1;
    }
  };
}
