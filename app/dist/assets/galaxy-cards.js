import { galaxyPalette } from '/assets/galaxy-palette.js?v=23';
import * as THREE from '/assets/vendor/three.module.js';

// Decorative scenes only. Each canvas fills the visual above its text and button.
const GALAXIES = {
  concept: {
    seed: 1729, arms: 4, radius: 22, twist: 0.255, thickness: 0.48,
    tilt: 0.67, angle: -0.48, speed: 0.105, rich: true,
    ringRadii: [0.54, 0.83], accretion: 5.2,
    tint: [0.57, 0.045, 0.10], mid: galaxyPalette.concept.rgb,
    core: [1.0, 0.82, 0.76], haze: [0.72, 0.035, 0.12],
  },
  aws: {
    seed: 45103, arms: 3, radius: 22.4, twist: 0.285, thickness: 0.58,
    tilt: -0.77, angle: 0.22, speed: 0.109, rich: true, split: true,
    ringRadii: [0.47, 0.78], accretion: 6.3, jetLength: 23, jetFlow: 0.23,
    tint: [0.57, 0.17, 0.015], mid: galaxyPalette.aws.rgb,
    core: [1.0, 0.91, 0.72], haze: [0.86, 0.25, 0.025],
  },
  portfolio: {seed: 97421,arms:2,radius:22.8,twist:.34,thickness:.82,tilt:1.01,angle:-.34,speed:.052,rich:true,dustTrails:true,perspective:true,ringRadii:[.58,.87],accretion:4.8,tint:[.015,.19,.18],mid:[.06,.64,.59],core:[.35,.94,.87],haze:[.025,.38,.34]},
  native: {
    seed: 24011, arms: 5, radius: 21.8, twist: 0.245, thickness: 0.35,
    tilt: 0.50, angle: -0.71, speed: 0.125,
    tint: [0.025, 0.31, 0.37], mid: galaxyPalette.native.rgb,
    core: [0.78, 0.96, 1.0], haze: [0.02, 0.53, 0.67],
  },
};

const POINT_VERTEX = `
  attribute float aSize;
  attribute float aAlpha;
  attribute float aPhase;
  attribute float aOrbit;
  attribute float aWave;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uScale;
  uniform float uTwinkle;
  uniform float uOrbitRate;
  uniform float uArmWave;
  uniform float uDepthDrift;
  uniform float uPerspective;
  uniform float uCameraDistance;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = aColor;
    float twinkle = 1.0 + uTwinkle * sin(uTime * 0.51 + aPhase);
    vAlpha = aAlpha * twinkle;
    vec3 p = position;
    float radius = length(p.xy);
    // Bounded differential phase preserves the recognizable arms over long visits.
    float orbitalPhase = uTime * uOrbitRate +
      sin(uTime * 0.085) * 0.23 * aOrbit;
    float c = cos(orbitalPhase);
    float s = sin(orbitalPhase);
    p.xy = mat2(c, s, -s, c) * p.xy;
    float wave = sin(radius * 0.58 - uTime * 0.62 + aPhase * 0.045);
    p.xy *= 1.0 + wave * uArmWave * aWave;
    p.z += sin(uTime * 0.23 + aPhase) * uDepthDrift * aWave;
    vec4 projected = modelViewMatrix * vec4(p, 1.0);
    // Perspective is a visual depth cue, not just a tilt of a flat sprite.
    // Nearby stars are larger and brighter; the far arms recede into the sky.
    float depth = mix(1.0, clamp(uCameraDistance / max(1.0, -projected.z), 0.65, 1.55), uPerspective);
    vAlpha *= mix(1.0, clamp(depth * depth, 0.56, 1.22), uPerspective);
    gl_Position = projectionMatrix * projected;
    gl_PointSize = max(0.8, aSize * uScale * depth);
  }
`;

const POINT_FRAGMENT = `
  precision highp float;
  uniform float uDust;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(p, p);
    if (r2 > 1.0) discard;
    float soft = exp(-r2 * mix(7.8, 3.9, uDust));
    float center = exp(-r2 * 40.0) * (1.0 - uDust);
    float diffraction = (
      exp(-abs(p.x) * 35.0 - abs(p.y) * 8.0) +
      exp(-abs(p.y) * 35.0 - abs(p.x) * 8.0)
    ) * 0.08 * (1.0 - uDust);
    float alpha = (soft + center * 0.28 + diffraction) * vAlpha;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

const CORE_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CORE_FRAGMENT = `
  precision highp float;
  varying vec2 vUv;
  uniform vec3 uTint;
  uniform vec3 uCore;
  uniform vec2 uAxis;
  uniform float uTime;
  void main() {
    vec2 p = (vUv - 0.5) * 2.0 / uAxis;
    float r2 = dot(p, p);
    float center = exp(-r2 * 48.0);
    float bloom = exp(-r2 * 13.0) * 0.30;
    float halo = exp(-r2 * 3.7) * 0.045;
    float pulse = 0.98 + sin(uTime * 0.19) * 0.02;
    vec3 color = mix(uTint, uCore, exp(-r2 * 26.0));
    float alpha = min(1.0, (center * 0.70 + bloom + halo) * pulse);
    if (alpha < 0.002) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

function randomGenerator(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(random) {
  return Math.sqrt(-2 * Math.log(Math.max(0.00001, random()))) *
    Math.cos(random() * Math.PI * 2);
}

function makeParticles(config, count, dust = false) {
  const random = randomGenerator(config.seed + (dust ? 1501 : 0));
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const alphas = new Float32Array(count);
  const phases = new Float32Array(count);
  const orbits = new Float32Array(count);
  const waves = new Float32Array(count);
  const tau = Math.PI * 2;

  for (let i = 0; i < count; i++) {
    const kind = random();
    let x, y, z, radius;
    let waveStrength = 1;
    let orbitStrength = 1;

    if (config.bar && kind < (dust ? 0.18 : 0.17)) {
      // The orange galaxy has a conspicuous central bar connecting its two arms.
      x = (random() * 2 - 1) * config.bar;
      y = gaussian(random) * (dust ? 0.56 : 0.36);
      z = gaussian(random) * 0.20;
      radius = Math.hypot(x, y);
      waveStrength = 0.08;
      orbitStrength = 0;
    } else if (!dust && kind > 0.90) {
      // Dense, warm stellar bulge, with depth rather than a flat bright disc.
      radius = Math.pow(random(), 1.65) * 6.0;
      const angle = random() * tau;
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius;
      z = gaussian(random) * (1.25 - radius * 0.13);
      waveStrength = 0.12;
      orbitStrength = 0.06;
    } else if (!dust && kind > 0.865) {
      // A restrained stellar disc preserves clear gaps between the spiral arms.
      radius = Math.sqrt(random()) * config.radius * 1.02;
      const angle = random() * tau;
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius;
      z = gaussian(random) * config.thickness * 2;
    } else {
      const arm = Math.floor(random() * config.arms);
      const start = config.bar ? config.bar * 0.77 : 0.4;
      radius = start + Math.pow(random(), 0.77) * (config.radius - start);
      const progress = (radius - start) / config.radius;
      const angle = arm * tau / config.arms +
        (radius - start) * config.twist +
        gaussian(random) * (dust ? 0.045 : 0.032 + progress * 0.016);
      const spread = (dust ? 0.32 : 0.12) + radius * (dust ? 0.018 : 0.009);
      x = Math.cos(angle) * radius + gaussian(random) * spread;
      y = Math.sin(angle) * radius + gaussian(random) * spread;
      z = gaussian(random) * config.thickness * (0.36 + progress);
    }

    const nearCore = Math.exp(-radius * 0.23);
    const warm = random();
    // Pale stellar clusters follow the colored arms, while nebulae retain color.
    const highlight = dust ? nearCore * 0.16 :
      Math.min(0.94, nearCore * 0.70 + (warm > 0.86 ? 0.48 : warm * 0.18));
    const light = dust ? 0.58 + random() * 0.26 : 0.61 + random() * 0.39;
    const base = dust ? config.haze : config.mid;
    const darkness = dust ? 0.16 : (warm < 0.22 ? 0.31 : 0);

    for (let c = 0; c < 3; c++) {
      const tone = base[c] * (1 - highlight) + config.core[c] * highlight;
      colors[i * 3 + c] = (tone * (1 - darkness) + config.tint[c] * darkness) * light;
    }
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    sizes[i] = dust ? 14 + random() * 31 :
      (warm > 0.988 ? 3.2 + random() * 1.6 : 0.55 + random() * 1.30);
    alphas[i] = dust ? 0.009 + random() * 0.035 :
      (0.38 + random() * 0.50) * (0.73 + nearCore * 0.27);
    phases[i] = random() * tau;
    orbits[i] = orbitStrength * (0.42 + 1.08 / (1 + radius * 0.12));
    waves[i] = waveStrength * Math.min(1, radius / 6.0);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aOrbit', new THREE.BufferAttribute(orbits, 1));
  geometry.setAttribute('aWave', new THREE.BufferAttribute(waves, 1));
  return geometry;
}

function makeRichParticles(config, count, dust = false) {
  const random = randomGenerator(config.seed + (dust ? 14983 : 5003));
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const alphas = new Float32Array(count);
  const phases = new Float32Array(count);
  const orbits = new Float32Array(count);
  const waves = new Float32Array(count);
  const tau = Math.PI * 2;
  const clusterCount = 36;
  const clusters = new Float32Array(clusterCount * 4);
  const start = config.bar ? config.bar * 0.67 : 0.45;

  function armAngle(radius, arm) {
    return arm * tau / config.arms + (radius - start) * config.twist +
      Math.log(1 + radius * 0.18) * 0.32 + Math.sin(radius * 0.19 + arm) * 0.12;
  }
  for (let i = 0; i < clusterCount; i++) {
    const radius = 3.8 + random() * (config.radius - 4.5);
    const arm = i % config.arms;
    const angle = armAngle(radius, arm) + (random() - 0.5) * 0.075;
    clusters[i * 4] = Math.cos(angle) * radius;
    clusters[i * 4 + 1] = Math.sin(angle) * radius;
    clusters[i * 4 + 2] = 0.23 + random() * 0.56;
    clusters[i * 4 + 3] = radius;
  }

  for (let i = 0; i < count; i++) {
    const kind = random();
    let x, y, z, radius;
    let mode = 'arm';
    let orbitStrength = 1;
    let waveStrength = 1;
    const bulgeCut = dust ? (config.bar ? 0.10 : 0.025) : (config.bar ? 0.29 : 0.15);
    const ringCut = dust ? 0.20 : (config.bar ? 0.38 : 0.25);
    const clusterCut = dust ? 0.38 : (config.bar ? 0.55 : 0.45);
    const discCut = config.bar ? 0.60 : 0.49;

    if (config.bar && kind < (dust ? 0.08 : 0.14)) {
      x = (random() * 2 - 1) * config.bar;
      y = gaussian(random) * (dust ? 0.48 : 0.31);
      z = gaussian(random) * 0.21;
      radius = Math.hypot(x, y);
      orbitStrength = 0;
      waveStrength = 0.08;
      mode = 'bulge';
    } else if (kind < bulgeCut) {
      radius = Math.pow(random(), 1.5) * 5.7;
      const angle = random() * tau;
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius;
      z = gaussian(random) * Math.max(0.20, (config.perspective ? 2.25 : 1.35) - radius * 0.18);
      orbitStrength = 0.035;
      waveStrength = 0.10;
      mode = 'bulge';
    } else if (config.dustTrails && kind < ringCut) {
      // Loose filaments follow the arms instead of forming closed annular bands.
      radius = 2 + Math.pow(random(), 0.76) * (config.radius - 2);
      const arm = Math.floor(random() * config.arms);
      const progress = radius / config.radius;
      const angle = armAngle(radius, arm) + gaussian(random) * (0.045 + progress * 0.07);
      const spread = 0.16 + progress * 0.52;
      x = Math.cos(angle) * radius + gaussian(random) * spread;
      y = Math.sin(angle) * radius + gaussian(random) * spread;
      z = gaussian(random) * config.thickness * (0.5 + progress);
      mode = 'filament';
    } else if (kind < ringCut) {
      const layer = random() > 0.52 ? 0 : 1;
      const angle = random() * tau;
      radius = config.radius * config.ringRadii[layer] + gaussian(random) * (dust ? 0.38 : 0.24);
      radius += Math.sin(angle * config.arms + layer) * 0.31;
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius;
      z = Math.sin(angle * 2.0 + layer) * 0.27 + gaussian(random) * 0.18;
      orbitStrength = 0.20;
      waveStrength = 0.16;
      mode = 'ring';
    } else if (kind < clusterCut) {
      const index = Math.floor(random() * clusterCount) * 4;
      const spread = clusters[index + 2] * (dust ? 1.24 : 0.72);
      x = clusters[index] + gaussian(random) * spread;
      y = clusters[index + 1] + gaussian(random) * spread;
      z = gaussian(random) * config.thickness * 0.59;
      radius = Math.hypot(x, y);
      waveStrength = 0.60;
      mode = 'cluster';
    } else if (!dust && kind < discCut) {
      radius = Math.sqrt(random()) * config.radius;
      const angle = random() * tau;
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius;
      z = gaussian(random) * config.thickness;
      mode = 'disc';
    } else {
      const arm = Math.floor(random() * config.arms);
      radius = start + Math.pow(random(), 0.77) * (config.radius - start);
      const progress = radius / config.radius;
      // Bright parallel filaments surround quieter dust lanes inside each arm.
      const strand = (random() > 0.5 ? 1 : -1) *
        ((config.split ? 0.061 : 0.041) + Math.sin(radius * 0.31) * 0.012);
      const spur = random() > 0.83 ? Math.sin(progress * Math.PI) * 0.16 : 0;
      const angle = armAngle(radius, arm) + strand + spur +
        gaussian(random) * (dust ? 0.041 : 0.023 + progress * 0.015);
      const spread = (dust ? 0.29 : 0.10) + radius * (dust ? 0.013 : 0.008);
      x = Math.cos(angle) * radius + gaussian(random) * spread;
      y = Math.sin(angle) * radius + gaussian(random) * spread;
      z = gaussian(random) * config.thickness * (0.35 + progress * 0.65);
    }

    // A shallow warp lifts the two open arms to different depths, while the
    // existing particles retain their coherent orbital motion and clear lanes.
    if (config.perspective && mode !== 'bulge') {
      z += Math.sin(Math.atan2(y, x) + radius * 0.13) * Math.pow(radius / config.radius, 1.6) * 1.65;
    }
    const nearCore = Math.exp(-radius * 0.23);
    const bright = random();
    const accent = mode === 'cluster' ? 0.44 : (mode === 'bulge' ? 0.38 : 0.06);
    const highlight = dust ? nearCore * 0.10 : Math.min(0.91,
      nearCore * 0.65 + accent + (bright > 0.91 ? 0.39 : bright * 0.12));
    const base = dust ? config.haze : config.mid;
    const light = dust ? 0.60 + random() * 0.25 : 0.63 + random() * 0.37;
    for (let c = 0; c < 3; c++) {
      colors[i * 3 + c] = (base[c] * (1 - highlight) + config.core[c] * highlight) * light;
    }
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    sizes[i] = dust ? 11 + random() * 26 :
      (bright > 0.989 ? 2.9 + random() * 1.3 : 0.54 + random() * 1.35);
    const ringFade = mode === 'ring' ? 0.66 : (mode === 'disc' ? 0.49 : 1);
    alphas[i] = dust ? (0.009 + random() * 0.030) * ringFade :
      (0.35 + random() * 0.50) * ringFade;
    phases[i] = random() * tau;
    orbits[i] = orbitStrength * (0.40 + 1.03 / (1 + radius * 0.12));
    waves[i] = waveStrength * Math.min(1, radius / 6.0);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aOrbit', new THREE.BufferAttribute(orbits, 1));
  geometry.setAttribute('aWave', new THREE.BufferAttribute(waves, 1));
  return geometry;
}

function makeAccretionParticles(config, count) {
  const random = randomGenerator(config.seed + 39739);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const alphas = new Float32Array(count);
  const phases = new Float32Array(count);
  const orbits = new Float32Array(count);
  const waves = new Float32Array(count);
  const layers = [0.28, 0.47, 0.72, 1.0];
  for (let i = 0; i < count; i++) {
    const layer = Math.floor(random() * layers.length);
    let angle = random() * Math.PI * 2;
    let radius = config.accretion * layers[layer] + gaussian(random) * (0.045 + layer * 0.021);
    if (config.dustTrails) {
      radius = 0.25 + Math.pow(random(), 0.8) * config.accretion;
      angle = (i % config.arms) * Math.PI * 2 / config.arms + radius * 0.74 + gaussian(random) * 0.10;
    }
    const arc = 0.65 + Math.sin(angle * 3.0 + layer * 1.3) * 0.27;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.sin(angle) * radius;
    positions[i * 3 + 2] = Math.sin(angle * 2 + layer) * 0.22;
    const pale = 0.45 + random() * 0.32;
    for (let c = 0; c < 3; c++) {
      colors[i * 3 + c] = config.mid[c] * (1 - pale) + config.core[c] * pale;
    }
    sizes[i] = random() > 0.985 ? 3.3 : 0.75 + random() * 1.48;
    alphas[i] = (0.23 + random() * 0.44) * arc;
    phases[i] = angle + random() * 0.4;
    waves[i] = 0.12;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aOrbit', new THREE.BufferAttribute(orbits, 1));
  geometry.setAttribute('aWave', new THREE.BufferAttribute(waves, 1));
  return geometry;
}

function makeDustTrails(config, count) {
  const random = randomGenerator(config.seed + 19);
  const positions = new Float32Array(count * 3), colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count), alphas = new Float32Array(count);
  const phases = new Float32Array(count), orbits = new Float32Array(count), waves = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const arm = i % config.arms;
    const progress = Math.pow(random(), 0.78);
    const radius = 2.6 + progress * config.radius * 1.06;
    const angle = arm * Math.PI * 2 / config.arms + (radius - 0.45) * config.twist +
      Math.log(1 + radius * 0.18) * 0.32 + Math.sin(radius * 0.19 + arm) * 0.12;
    const fan = Math.pow(progress, 2.4);
    const strand = Math.sin(progress * 10 + arm * 1.8) * (0.07 + fan * 0.12);
    const spread = 0.10 + fan * 1.15;
    positions[i * 3] = Math.cos(angle + strand) * radius + gaussian(random) * spread;
    positions[i * 3 + 1] = Math.sin(angle + strand) * radius + gaussian(random) * spread;
    positions[i * 3 + 2] = Math.sin(progress * 5 + arm * Math.PI) * fan * (config.perspective ? 2.4 : 0.9) + gaussian(random) * (0.15 + fan * 0.35);
    const cluster = Math.pow(0.5 + 0.5 * Math.sin(progress * 32 + arm * 2), 3);
    const pale = 0.12 + random() * 0.25 + cluster * 0.16;
    for (let c = 0; c < 3; c++) colors[i * 3 + c] = config.mid[c] * (1 - pale) + config.core[c] * pale;
    sizes[i] = 0.7 + random() * 1.35 + cluster * 0.4;
    // Bright knots dissolve into diffuse, irregular ends. Neither trail closes.
    alphas[i] = (0.18 + random() * 0.40 + cluster * 0.12) * Math.pow(Math.sin(progress * Math.PI), 0.72);
    phases[i] = random() * Math.PI * 2;
    orbits[i] = 0.40 + 1.03 / (1 + radius * 0.12);
    waves[i] = Math.min(1, radius / 6);
  }
  const geometry = new THREE.BufferGeometry();
  for (const [name, values, width] of [['position',positions,3],['aColor',colors,3],['aSize',sizes,1],['aAlpha',alphas,1],['aPhase',phases,1],['aOrbit',orbits,1],['aWave',waves,1]]) {
    geometry.setAttribute(name, new THREE.BufferAttribute(values, width));
  }
  return geometry;
}

const JET_VERTEX = `
  attribute float aProgress;
  attribute float aSide;
  attribute float aSize;
  attribute float aAlpha;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uScale;
  uniform float uLength;
  uniform float uFlow;
  uniform vec3 uViewDirection;
  uniform float uRadius;
  uniform float uTwist;
  uniform float uOrbit;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float travel = fract(aProgress + uTime * uFlow);
    float reach = 1.4 + travel * uLength;
    float flare = 0.55 + travel * 1.25;
    float curl = travel * 10.0 - uTime * 0.30 + aPhase;
    vec3 p = vec3(position.xy * flare +
      vec2(sin(curl), cos(curl)) * 0.09, aSide * reach);
    vColor = aColor;
    vAlpha = aAlpha * (1.0 - smoothstep(0.63, 1.0, travel)) *
      smoothstep(0.0, 0.05, travel);
    // Attenuate the far lobe where its sightline crosses the rotating disk.
    // This optical-depth model illustrates occlusion, not fluid dynamics.
    float t = -p.z / max(0.05, uViewDirection.z);
    if (t > 0.0) {
      vec2 q = p.xy + t * uViewDirection.xy;
      float r = length(q);
      float theta = atan(q.y, q.x) - uTime * uOrbit;
      float armDensity = 0.0;
      for (int arm = 0; arm < 3; arm++) {
        float a = float(arm) * 6.2831853 / 3.0 + (r - 0.45) * uTwist +
          log(1.0 + r * 0.18) * 0.32 + sin(r * 0.19 + float(arm)) * 0.12;
        float d = atan(sin(theta - a), cos(theta - a));
        armDensity += exp(-d * d / 0.016);
      }
      float disk = 1.0 - smoothstep(uRadius * 0.84, uRadius * 1.04, r);
      float bulge = 4.0 * exp(-r * r / 18.0);
      float opticalDepth = bulge + disk * (1.05 + 5.0 * armDensity);
      vAlpha *= exp(-opticalDepth) * 1.35;
    }
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = max(0.8, aSize * uScale * (0.70 + travel * 0.45));
  }
`;

function makeJets(config, count) {
  const random = randomGenerator(config.seed + 90523);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const alphas = new Float32Array(count);
  const phases = new Float32Array(count);
  const progress = new Float32Array(count);
  const sides = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const plume = random() > (config.split ? 0.71 : 0.82);
    const spread = plume ? (config.split ? 0.54 : 0.43) : (config.split ? 0.20 : 0.17);
    positions[i * 3] = gaussian(random) * spread;
    positions[i * 3 + 1] = gaussian(random) * spread;
    for (let c = 0; c < 3; c++) {
      colors[i * 3 + c] = config.core[c] * 0.70 + config.mid[c] * 0.30;
    }
    sizes[i] = config.split ?
      (plume ? 9 + random() * 13 : 1.0 + random() * 1.7) :
      (plume ? 7 + random() * 13 : 0.70 + random() * 1.55);
    alphas[i] = config.split ?
      (plume ? 0.050 + random() * 0.065 : 0.34 + random() * 0.44) :
      (plume ? 0.015 + random() * 0.015 : 0.10 + random() * 0.20);
    phases[i] = random() * Math.PI * 2;
    progress[i] = random();
    sides[i] = i % 2 === 0 ? 1 : -1;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aProgress', new THREE.BufferAttribute(progress, 1));
  geometry.setAttribute('aSide', new THREE.BufferAttribute(sides, 1));
  const material = new THREE.ShaderMaterial({
    vertexShader: JET_VERTEX, fragmentShader: POINT_FRAGMENT,
    uniforms: {
      uTime: { value: 0 }, uScale: { value: 1 },
      uLength: { value: config.jetLength }, uFlow: { value: config.jetFlow },
      uViewDirection: { value: new THREE.Vector3(0,0,1) },
      uRadius: { value: config.radius }, uTwist: { value: config.twist }, uOrbit: { value: config.speed },
      uDust: { value: 0.35 },
    },
    transparent: true, blending: THREE.AdditiveBlending,
    depthTest: false, depthWrite: false, toneMapped: false,
  });
  const jets = new THREE.Points(geometry, material);
  jets.frustumCulled = false;
  return jets;
}

function makePointMaterial(dust, config) {
  return new THREE.ShaderMaterial({
    vertexShader: POINT_VERTEX,
    fragmentShader: POINT_FRAGMENT,
    uniforms: {
      uTime: { value: 0 }, uScale: { value: 1 },
      uTwinkle: { value: dust ? 0.010 : 0.065 },
      uDust: { value: dust ? 1 : 0 },
      uOrbitRate: { value: config.speed },
      uArmWave: { value: dust ? 0.020 : 0.012 },
      uDepthDrift: { value: dust ? 0.19 : 0.12 },
      uPerspective: { value: config.perspective ? 1 : 0 },
      uCameraDistance: { value: 86 },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
}

function makeScene(canvas, config, onChange, allowMotion) {
  const visual = canvas.closest('.galaxy-visual') || canvas.parentElement;
  let renderer;
  let resizeObserver;
  let intersectionObserver;
  let disposed = false;
  let contextLost = false;
  let width = 0;
  let height = 0;
  let viewHalfWidth = 40;
  let viewHalfHeight = 18;
  let visible = true;
  let elapsed = Number(canvas.dataset.galaxyTime) || 0;
  let motionEnabled = allowMotion();
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;
  let cardLeft = 0;
  let cardTop = 0;
  let hover = 0, hoverTarget = 0, basePointScale = 1, journey = null, journeyFrame = 0;
  const card = canvas.closest('.galaxy-card');

  try {
    renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: false,
      powerPreference: 'low-power', preserveDrawingBuffer: false,
    });
    renderer.setClearColor(0x000000, 0);
  } catch (error) {
    canvas.dataset.galaxyFallback = 'true';
    canvas.style.visibility = 'hidden';
    return null;
  }

  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.pointerEvents = 'none';
  const scene = new THREE.Scene();
  const camera = config.perspective
    ? new THREE.PerspectiveCamera(42, 1, 0.1, 240)
    : new THREE.OrthographicCamera(-40, 40, 18, -18, 0.1, 160);
  camera.position.z = config.perspective ? 86 : 65;
  canvas.dataset.galaxyProjection = config.perspective ? 'perspective' : 'orthographic';
  const galaxy = new THREE.Group();
  galaxy.rotation.x = config.tilt;
  galaxy.rotation.z = config.angle;
  scene.add(galaxy);

  const dustMaterial = makePointMaterial(true, config);
  const starMaterial = makePointMaterial(false, config);
  const particleGenerator = config.rich ? makeRichParticles : makeParticles;
  const dust = new THREE.Points(particleGenerator(config, canvas.dataset.mini ? 160 : config.rich ? 1350 : 950, true), dustMaterial);
  const stars = new THREE.Points(particleGenerator(config, canvas.dataset.mini ? 1300 : config.rich ? 7800 : 8650), starMaterial);
  const extraPoints = [];
  const viewQuaternion = new THREE.Quaternion();
  canvas.dataset.jetModel = config.jetLength ? "disk-normal-ray-attenuation" : "none";
  galaxy.add(dust, stars);

  const coreMaterial = new THREE.ShaderMaterial({
    vertexShader: CORE_VERTEX,
    fragmentShader: CORE_FRAGMENT,
    uniforms: {
      uTint: { value: new THREE.Vector3(...config.haze) },
      uCore: { value: new THREE.Vector3(...config.core) },
      uAxis: { value: new THREE.Vector2(
        config.rich ? 1.06 : (config.bar ? 1.75 : 1),
        config.rich ? 0.92 : (config.bar ? 0.67 : 1),
      ) },
      uTime: { value: 0 },
    },
    transparent: true, blending: THREE.AdditiveBlending,
    depthTest: false, depthWrite: false, toneMapped: false,
    side: THREE.DoubleSide,
  });
  const core = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), coreMaterial);
  core.position.z = 0.06;
  galaxy.add(core);

  if (config.rich) {
    const accretionMaterial = makePointMaterial(false, config);
    accretionMaterial.uniforms.uOrbitRate.value = config.speed * 1.62;
    accretionMaterial.uniforms.uArmWave.value = 0.004;
    accretionMaterial.uniforms.uDepthDrift.value = 0.05;
    accretionMaterial.uniforms.uTwinkle.value = 0.035;
    const accretion = new THREE.Points(makeAccretionParticles(config, canvas.dataset.mini ? 160 : 1050), accretionMaterial);
    galaxy.add(accretion);
    extraPoints.push(accretion);
    if (config.jetLength) {
      const jets = makeJets(config, config.split ? 1100 : 450);
      galaxy.add(jets);
      extraPoints.push(jets);
    }
  }

  if (config.dustTrails) {
    const material = makePointMaterial(false, config);
    const trails = new THREE.Points(makeDustTrails(config, canvas.dataset.mini ? 180 : 1600), material);
    galaxy.add(trails);
    extraPoints.push(trails);
    canvas.dataset.galaxyDetail = 'open-spiral-dust-trails';
  }
  // Reuse the material list rather than allocating an array on every frame.
  const pointMaterials = [starMaterial, dustMaterial, ...extraPoints.map(points => points.material)];
  function render(delta = 0) {
    if (disposed || contextLost || width < 1 || height < 1) return;
    if (motionEnabled && delta > 0) {
      hover += (hoverTarget - hover) * (1 - Math.exp(-delta * 5));
      elapsed += delta;
      const damping = 1 - Math.exp(-delta * 6.5);
      pointerX += (targetX - pointerX) * damping;
      pointerY += (targetY - pointerY) * damping;
    }
    galaxy.scale.setScalar(config.perspective ? 1 : 1 + hover * .055);
    galaxy.rotation.z = config.angle + hover * .035;
    galaxy.rotation.x = config.tilt + Math.sin(elapsed * 0.10) * (config.perspective ? 0.055 : 0.015) + pointerY * (config.perspective ? 0.12 : 0.040);
    galaxy.rotation.y = config.perspective ? Math.sin(elapsed * 0.075) * 0.055 + pointerX * 0.14 : pointerX * 0.037;
    if (config.perspective) {
      // The bulge glow faces the viewer while the stars retain their 3D volume.
      core.quaternion.copy(galaxy.quaternion).invert();
    } else core.rotation.z = elapsed * config.speed;
    starMaterial.uniforms.uTime.value = elapsed;
    dustMaterial.uniforms.uTime.value = elapsed;
    coreMaterial.uniforms.uTime.value = elapsed;
    if(journey){
      const p=journey.progress,e=1-Math.pow(1-p,3);
      camera.zoom=journey.startZoom*(1+Math.pow(p,2.4)*55);
      camera.updateProjectionMatrix();
      galaxy.position.set(journey.x*(1-e),journey.y*(1-e),0);
      galaxy.rotation.x=config.tilt*(1-p*.45);
      galaxy.rotation.z=config.angle+p*.22;
      journey.backdrop.style.opacity=String(Math.min(1,p*4));
      visual.style.opacity=String(1-Math.max(0,(p-.78)/.22));
    }
    for (const points of extraPoints) {
      points.material.uniforms.uTime.value = elapsed;
      if (points.material.uniforms.uViewDirection) {
        galaxy.updateMatrixWorld();
        viewQuaternion.copy(galaxy.quaternion).invert();
        points.material.uniforms.uViewDirection.value.set(0,0,1).applyQuaternion(viewQuaternion).normalize();
      }
    }
    const zoomLight=journey?Math.min(8,Math.sqrt(camera.zoom/journey.startZoom)):1;
    for(const material of pointMaterials)material.uniforms.uScale.value=basePointScale*zoomLight;
    canvas.dataset.hoverEnergy=hover.toFixed(2);
    canvas.dataset.journey=journey?journey.progress.toFixed(2):'idle';
    try {
      renderer.render(scene, camera);
      canvas.dataset.galaxyTime = elapsed.toFixed(2);
    } catch (error) {
      contextLost = true;
      canvas.dataset.galaxyFallback = 'true';
      canvas.style.visibility = 'hidden';
      onChange();
    }
  }

  function resize() {
    if (disposed) return;
    const bounds = visual.getBoundingClientRect();
    // FLIP transforms move a loading galaxy; they must not distort its camera.
    width = Math.round(visual.clientWidth || bounds.width);
    height = Math.round(visual.clientHeight || bounds.height);
    cardLeft = bounds.left;
    cardTop = bounds.top;
    if (width < 1 || height < 1) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    const aspect = width / height;
    // About 88% of the visual width, while retaining its projected height.
    // The visual wrapper excludes the heading and button below the galaxy.
    const fitRadius = config.dustTrails ? config.radius * 1.20 : config.radius;
    canvas.dataset.fitRadius = String(fitRadius);
    // Fit the open dust tails with room for their diffuse tips and pointer tilt.
    const tiltAllowance = config.perspective ? 0.22 : 0.065;
    const depthAllowance = config.perspective ? 0.10 : 0.028;
    const galaxyHalfHeight = Math.max(
      fitRadius * (Math.cos(Math.abs(config.tilt) - tiltAllowance) + depthAllowance) / 0.95,
      fitRadius * 1.065 / aspect,
    );
    const halfHeight = config.jetLength ? Math.max(galaxyHalfHeight,
      (config.jetLength * Math.sin(Math.abs(config.tilt) + 0.06) + 2.2) / 0.96) : galaxyHalfHeight;
    const halfWidth = halfHeight * aspect;
    viewHalfHeight = halfHeight;
    viewHalfWidth = halfWidth;
    if (config.perspective) {
      // Perspective expands the apparent radius of an inclined disc. Fit that
      // projected silhouette rather than its nearest point, which would make
      // the entire galaxy needlessly small. Keep a little room for parallax.
      const depthRatio = fitRadius * Math.sin(config.tilt + 0.12) / camera.position.z;
      const perspectivePadding = 1 / Math.sqrt(1 - depthRatio * depthRatio) + 0.035;
      camera.aspect = aspect;
      camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(halfHeight * perspectivePadding / camera.position.z));
      viewHalfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      viewHalfWidth = viewHalfHeight * aspect;
    } else {
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.left = -halfWidth;
      camera.right = halfWidth;
    }
    camera.updateProjectionMatrix();
    galaxy.position.set(0, 0, 0);
    basePointScale = Math.max(0.76, height / 225) * ratio;
    for (const material of [starMaterial, dustMaterial]) {
      material.uniforms.uScale.value = Math.max(0.76, height / 225) * ratio;
    }
    for (let i = 0; i < extraPoints.length; i++) {
      extraPoints[i].material.uniforms.uScale.value = Math.max(0.76, height / 225) * ratio;
    }
    render();
    onChange();
  }

  function handleContextLost(event) {
    event.preventDefault();
    contextLost = true;
    onChange();
  }
  function handleContextRestored() {
    contextLost = false;
    canvas.style.visibility = '';
    delete canvas.dataset.galaxyFallback;
    resize();
  }
  function pointerEnter() {
    if (!motionEnabled) return;
    const bounds = visual.getBoundingClientRect();
    cardLeft = bounds.left;
    cardTop = bounds.top;
  }
  function pointerMove(event) {
    if (!motionEnabled || event.pointerType === 'touch' || width < 1 || height < 1) return;
    targetX = Math.max(-1, Math.min(1, (event.clientX - cardLeft) / width * 2 - 1));
    targetY = Math.max(-1, Math.min(1, (event.clientY - cardTop) / height * 2 - 1));
  }
  function pointerLeave() {
    if (!motionEnabled) return;
    targetX = targetY = 0;
  }
  canvas.addEventListener('webglcontextlost', handleContextLost);
  canvas.addEventListener('webglcontextrestored', handleContextRestored);
  visual.addEventListener('pointerenter', pointerEnter);
  visual.addEventListener('pointermove', pointerMove);
  visual.addEventListener('pointerleave', pointerLeave);

  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(visual);
  } else {
    window.addEventListener('resize', resize);
  }
  if ('IntersectionObserver' in window) {
    intersectionObserver = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) render();
      onChange();
    }, { rootMargin: '30px', threshold: 0 });
    intersectionObserver.observe(visual);
  }
  resize();

  function resetJourney(){
    cancelAnimationFrame(journeyFrame);
    if(!journey)return;
    const state=journey;journey=null;
    state.parent.insertBefore(visual,state.next?.parentNode===state.parent?state.next:null);
    visual.setAttribute('style',state.style);state.backdrop.remove();
    document.body.classList.remove('is-navigating');camera.zoom=1;galaxy.position.set(0,0,0);resize();
  }
  return {
    type:canvas.dataset.galaxy,
    settle(){hoverTarget=hover=0;targetX=targetY=pointerX=pointerY=0;render();},
    setHover(value){hoverTarget=value?1:0;if(!motionEnabled){hoverTarget=hover=0;}onChange();},
    resetJourney,
    travel(){
      if(disposed||contextLost||!motionEnabled)return Promise.resolve();
      const rect=visual.getBoundingClientRect(),oldHalf=viewHalfWidth,parent=visual.parentElement,next=visual.nextSibling,style=visual.getAttribute('style')||'';
      const backdrop=document.createElement('div');backdrop.className='galaxy-journey-backdrop';document.body.append(backdrop,visual);
      visual.style.cssText='position:fixed;inset:0;width:100vw;height:100dvh;z-index:101;pointer-events:none;margin:0;';
      resize();const half=viewHalfWidth,halfY=viewHalfHeight,startZoom=half/oldHalf*rect.width/innerWidth;
      journey={progress:0,parent,next,style,backdrop,startZoom,x:(rect.left+rect.width/2-innerWidth/2)/innerWidth*half*2/startZoom,y:-(rect.top+rect.height/2-innerHeight/2)/innerHeight*halfY*2/startZoom};
      document.body.classList.add('is-navigating');render();
      return new Promise(resolve=>{const start=performance.now();const animate=now=>{if(!journey){resolve();return;}if(!motionEnabled||contextLost){resetJourney();resolve();return;}journey.progress=Math.min(1,(now-start)/1100);render();if(journey.progress<1)journeyFrame=requestAnimationFrame(animate);else resolve();};journeyFrame=requestAnimationFrame(animate);});
    },
    render,
    setMotionEnabled(value) {
      const next = Boolean(value);
      if (next === motionEnabled) return;
      motionEnabled = next;
      // Pausing freezes the current transform, including damped pointer state.
      targetX = next ? 0 : pointerX;
      targetY = next ? 0 : pointerY;
    },
    canRender: () => !disposed && !contextLost && visible && width > 0 && height > 0,
    dispose() {
      if (disposed) return;
      disposed = true;
      canvasControllers.delete(canvas);
      resetJourney();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      visual.removeEventListener('pointerenter', pointerEnter);
      visual.removeEventListener('pointermove', pointerMove);
      visual.removeEventListener('pointerleave', pointerLeave);
      stars.geometry.dispose();
      dust.geometry.dispose();
      core.geometry.dispose();
      starMaterial.dispose();
      dustMaterial.dispose();
      coreMaterial.dispose();
      for (let i = 0; i < extraPoints.length; i++) {
        extraPoints[i].geometry.dispose();
        extraPoints[i].material.dispose();
      }
      extraPoints.length = 0;
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

/**
 * Mount after the three showcases are in the document. Each .galaxy-visual
 * provides its own size and positioning above the foreground text and button.
 * The transparent scene shares the page's black sky, without a local starfield.
 * The scenes never intercept clicks. Only the Visit link should navigate.
 * The host retains its existing BFCache pause restoration through setPaused.
 */
const canvasControllers = new WeakMap();
export function settleGalaxy(canvas) { canvasControllers.get(canvas)?.settle(); }
export function snapshotGalaxy(canvas) {
  try { canvasControllers.get(canvas)?.render(); return canvas?.toDataURL("image/png") || null; } catch { return null; }
}
export function mountGalaxies(root = document) {
  const controllers = [];
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  let disposed = false;
  let frameId = 0;
  let lastTime = 0;


  function shouldAnimate() {
    if (disposed || paused || motionPreference.matches || document.hidden) return false;
    for (let i = 0; i < controllers.length; i++) {
      if (controllers[i].canRender()) return true;
    }
    return false;
  }

  function schedule() {
    const motionAllowed = !disposed && !paused && !motionPreference.matches && !document.hidden;
    for (let i = 0; i < controllers.length; i++) {
      controllers[i].setMotionEnabled(motionAllowed);
    }
    if (!shouldAnimate()) {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      lastTime = 0;

      return;
    }
    if (!frameId) frameId = requestAnimationFrame(frame);
  }

  function frame(now) {
    frameId = 0;
    if (!shouldAnimate()) return;
    // Follow display refresh directly. No 30 fps gate or periodic time reset.
    const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0;
    lastTime = now;
    for (const controller of controllers) {
      if (controller.canRender()) controller.render(delta);
    }
    frameId = requestAnimationFrame(frame);
  }

  // Initialization is bounded to the three supported, unique card types.
  const mountedTypes = new Set();
  for (const canvas of root.querySelectorAll('canvas[data-galaxy]')) {
    if(root === document && canvas.closest(".ac-loader")) continue;
    if(canvasControllers.has(canvas)) continue;
    const type = canvas.dataset.galaxy;
    if (!GALAXIES[type] || mountedTypes.has(type)) continue;
    mountedTypes.add(type);
    let controller;
    try {
      const config={...GALAXIES[type],tint:[.015,.19,.18],mid:[.06,.64,.59],core:[.22,.84,.76],haze:[.025,.38,.34]};
      controller = makeScene(canvas, config, schedule,
        () => !paused && !motionPreference.matches && !document.hidden);
    } catch (error) {
      canvas.dataset.galaxyFallback = 'true';
      canvas.style.visibility = 'hidden';
    }
    if (controller) { controllers.push(controller); canvasControllers.set(canvas,controller); }
  }

  document.addEventListener('visibilitychange', schedule);
  if (motionPreference.addEventListener) {
    motionPreference.addEventListener('change', schedule);
  } else {
    motionPreference.addListener(schedule);
  }
  schedule();

  return {
    setHover(type,value){controllers.find(c=>c.type===type)?.setHover(value);},
    travel(type){return controllers.find(c=>c.type===type)?.travel()||Promise.resolve();},
    resetJourney(){for(const c of controllers)c.resetJourney();},
    setPaused(value) {
      paused = Boolean(value);
      schedule();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      document.removeEventListener('visibilitychange', schedule);
      if (motionPreference.removeEventListener) {
        motionPreference.removeEventListener('change', schedule);
      } else {
        motionPreference.removeListener(schedule);
      }
      for (const controller of controllers) controller.dispose();
      controllers.length = 0;
    },
  };
}
