/* One persistent, volumetric particle sculpture for the public shell and loader. */
export function mountInfinity({canvas, motionButton = null} = {}) {
const motionLabel = motionButton?.querySelector('span');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobile = window.matchMedia('(max-width: 700px)');
const context = canvas?.getContext('2d');
const TAU = Math.PI * 2;
const LOOP_SECONDS = 28;
let seed = 69819;
const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const softRandom = () => (random() + random() + random() - 1.5) / 1.5;
// Every grain retains its position on the same parametric strip throughout the loop.
// The negative half twist is the opposite handedness of the usual Mobius band.
const particles = Array.from({length: 3600}, (_, index) => {
  const side = random() > .5 ? 1 : -1;
  const grain = {
    u: random() * TAU,
    v: index % 7 === 0 ? side * (.82 + random() * .18) : softRandom(),
    thickness: softRandom() * .048,
    scatter: softRandom(),
    size: .25 + Math.pow(random(), 2) * 1.2,
    light: random(),
    twinkle: random() * TAU,
    frequency: 1 + index % 3,
    cloud: index % 10 === 0,
    spark: index % 257 === 0
  };
  // The ribbon gathers into dusty edge strands and three inner filaments.
  // Retain the softer original distribution in the infinity pose.
  const lane = index % 12;
  const strand = lane < 3 ? -.96 : lane < 6 ? .96 : lane < 8 ? -.44 : lane < 10 ? .44 : 0;
  grain.bandV = lane === 11 ? grain.v : strand + grain.scatter * .065;
  grain.edgeStrand = lane < 6;
  return grain;
});
let width = 1;
let height = 1;
let paused = reducedMotion.matches;
let suspended = false;
let disposed = false;
let pausedByUser = false;
let time = 0;
let lastTime = 0;
let frame = 0;
let lastDraw = 0;
let targetX = 0;
let targetY = 0;
let pointerX = 0;
let pointerY = 0;

function makeGlowSprite() {
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 64;
  const brush = sprite.getContext('2d');
  if (!brush) return null;
  const glow = brush.createRadialGradient(32,32,0,32,32,32);
  glow.addColorStop(0,'rgba(244,247,252,.6)');
  glow.addColorStop(.12,'rgba(207,213,223,.43)');
  glow.addColorStop(.4,'rgba(119,128,144,.16)');
  glow.addColorStop(1,'rgba(71,78,91,0)');
  brush.fillStyle = glow;
  brush.fillRect(0,0,64,64);
  return sprite;
}
const glowSprite = context ? makeGlowSprite() : null;

function resize() {
  if (disposed) return;
  const bounds = canvas?.getBoundingClientRect();
  if (!bounds) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  width = Math.max(1, bounds.width);
  height = Math.max(1, bounds.height);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  context?.setTransform(dpr, 0, 0, dpr, 0, 0);

  draw();
}

function sampleSculpture(p, seconds) {
  // All temporal terms are periodic: geometry, full rotation, drift and twinkle.
  // sin^2 gives zero morph velocity at each clear silhouette, without stopping spin.
  const phase = ((seconds / LOOP_SECONDS) % 1 + 1) % 1;
  const orbit = phase * TAU;
  const morph = (1 - Math.cos(orbit)) * .5;
  const u = p.u;
  const su = Math.sin(u), cu = Math.cos(u);
  const dx = 1.08 * cu, dy = .92 * Math.cos(2 * u);
  const tangentLength = Math.hypot(dx,dy);
  const ribbon = p.v * .1 + p.scatter * .014;
  const ix = 1.08 * su - dy / tangentLength * ribbon;
  const iy = .46 * Math.sin(2 * u) + dx / tangentLength * ribbon;
  const iz = .22 * cu + p.thickness;
  const half = -u * .5;
  const ch = Math.cos(half), sh = Math.sin(half);
  const bandPosition = p.v + ((p.bandV ?? p.v) - p.v) * morph;
  const band = bandPosition * .41;
  const ring = .84 + band * ch;
  const mx = ring * cu - p.thickness * sh * cu;
  const my = ring * su - p.thickness * sh * su;
  const mz = band * sh + p.thickness * ch;
  // Tilt the ring to reveal its inner edge and half twist at the Mobius landmark.
  const tilt = .98;
  const tiltedY = my * Math.cos(tilt) - mz * Math.sin(tilt);
  const tiltedZ = my * Math.sin(tilt) + mz * Math.cos(tilt);
  const x = ix + (mx - ix) * morph;
  const y = iy + (tiltedY - iy) * morph;
  const z = iz + (tiltedZ - iz) * morph;
  // A complete turn per morph cycle gives the returning infinity the same pose.
  const turn = orbit + pointerX * .08;
  const rx = x * Math.cos(turn) + z * Math.sin(turn);
  const rz = -x * Math.sin(turn) + z * Math.cos(turn);
  const roll = -.12 + Math.sin(orbit) * .16 + pointerY * .035;
  const c = Math.cos(roll), s = Math.sin(roll);
  return {
    x: rx * c - y * s,
    y: rx * s + y * c,
    z: rz,
    shimmer: .82 + .18 * Math.sin(orbit * p.frequency + p.twinkle),
    morph
  };
}

function projectSculpture(point) {
  const scale = Math.min(width * .335, height * .285);
  const perspective = 3.7 / (3.7 - point.z);
  return {
    x: width * .5 + pointerX * 5 + point.x * scale * perspective,
    y: height * .415 + pointerY * 5 + point.y * scale * perspective,
    z: point.z,
    perspective,
    scale
  };
}

function draw() {
  if (!context) return;
  context.clearRect(0,0,width,height);
  const view = [];
  for (let index = 0; index < particles.length; index++) {
    if (mobile.matches && index % 2) continue;
    const grain = particles[index];
    const position = sampleSculpture(grain,time);
    const point = projectSculpture(position);
    view.push({...point,grain,shimmer:position.shimmer,morph:position.morph});
  }
  view.sort((a,b) => a.z - b.z);
  context.globalCompositeOperation = 'lighter';
  // Diffuse dust remains tied to the strip, making a nebula rather than a solid tube.
  if (glowSprite) {
    for (const point of view) {
      if (!point.grain.cloud) continue;
      const depth = Math.max(0,Math.min(1,(point.z + 1) * .5));
      const radius = (8 + point.grain.light * 10) * point.perspective;
      context.globalAlpha = (.13 + point.morph * (.07 + depth * .13)) * point.shimmer;
      context.drawImage(glowSprite,point.x-radius,point.y-radius,radius*2,radius*2);
    }
  }
  context.globalAlpha = 1;
  for (const point of view) {
    const p = point.grain;
    const depth = Math.max(0,Math.min(1,(point.z + 1) * .5));
    const diffuseLight = .29 + p.light * .36 + depth * .19;
    const bandLight = (.18 + p.light * .24 + depth * .58) * (p.edgeStrand ? 1.32 : 1.08);
    const alpha = Math.min(.96,(diffuseLight + (bandLight-diffuseLight) * point.morph) * point.shimmer);
    const size = Math.max(.3,p.size * (.64 + depth * .64) * point.perspective);
    context.fillStyle = p.light > .96
      ? `rgba(246,248,252,${alpha})`
      : `rgba(${Math.round(142+depth*68)},${Math.round(150+depth*70)},${Math.round(163+depth*73)},${alpha})`;
    context.fillRect(point.x-size*.5,point.y-size*.5,size,size);
    if (p.spark && glowSprite) {
      const radius = (3.2 + depth * 2.8) * point.perspective;
      context.globalAlpha = .65 * point.shimmer;
      context.drawImage(glowSprite,point.x-radius,point.y-radius,radius*2,radius*2);
      context.fillStyle = `rgba(249,250,253,${.7 * point.shimmer})`;
      context.fillRect(point.x-.4,point.y-2.1,.8,4.2);
      context.fillRect(point.x-2.1,point.y-.4,4.2,.8);
      context.globalAlpha = 1;
    }
  }
  context.globalCompositeOperation = 'source-over';
}

function updateMotionControl() {
  motionButton?.setAttribute('aria-pressed',String(paused));
  if(motionLabel) motionLabel.textContent=paused?'Play motion':'Pause motion';
  const path=motionButton?.querySelector('path');
  path?.setAttribute('d',paused?'m6 3 8 6-8 6V3Z':'M6 4v10M12 4v10');
}
function active() { return Boolean(context) && !disposed && !suspended && !paused && !document.hidden; }
function updateState() {
  if (canvas) canvas.dataset.motion = disposed ? 'disposed' : suspended ? 'paused' : paused ? 'paused' : document.hidden ? 'hidden' : 'running';
}
function tick(now) {
  frame=0;
  if(!active()) return;
  const elapsed=lastTime?Math.min((now-lastTime)/1000,.06):0;
  lastTime=now;
  time=(time+elapsed)%LOOP_SECONDS;
  pointerX+=(targetX-pointerX)*.045;
  pointerY+=(targetY-pointerY)*.045;
  if(now-lastDraw>33){draw();lastDraw=now;}
  frame=requestAnimationFrame(tick);
}
function start() { updateState();if(!frame&&active()){lastTime=0;frame=requestAnimationFrame(tick);} }
function stop() {cancelAnimationFrame(frame);frame=0;lastTime=0;updateState();}
function toggleMotion() {paused=!paused;pausedByUser=paused;updateMotionControl();if(paused)stop();else start();}
function updatePreference() {paused=reducedMotion.matches||pausedByUser;updateMotionControl();if(paused){stop();draw();}else start();}
function updateVisibility() {if(document.hidden)stop();else start();}
function movePointer(event) {
  if(!active()||reducedMotion.matches)return;
  const bounds=canvas.getBoundingClientRect();
  if(!bounds.width||!bounds.height)return;
  targetX=(event.clientX-bounds.left)/bounds.width-.5;
  targetY=(event.clientY-bounds.top)/bounds.height-.5;
}
function leavePointer() {targetX=0;targetY=0;}
motionButton?.addEventListener('click',toggleMotion);
reducedMotion.addEventListener('change',updatePreference);
document.addEventListener('visibilitychange',updateVisibility);
canvas?.addEventListener('pointermove',movePointer);
canvas?.addEventListener('pointerleave',leavePointer);
window.addEventListener('resize',resize,{passive:true});
const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
if(canvas&&context){observer?.observe(canvas);resize();updateMotionControl();start();} else if(motionButton) motionButton.hidden=true;
return {
  setPaused(value) {if(disposed)return;suspended=Boolean(value);if(suspended)stop();else start();},
  resize,
  dispose() {
    if(disposed)return;disposed=true;stop();observer?.disconnect();
    motionButton?.removeEventListener('click',toggleMotion);
    reducedMotion.removeEventListener('change',updatePreference);
    document.removeEventListener('visibilitychange',updateVisibility);
    canvas?.removeEventListener('pointermove',movePointer);
    canvas?.removeEventListener('pointerleave',leavePointer);
    window.removeEventListener('resize',resize);
  }
};
}
