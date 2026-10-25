// One source for the nominal spiral-arm color and its matching text label.
const color = (hex) => Object.freeze({ hex, rgb: Object.freeze([1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)) });
export const galaxyPalette = Object.freeze({ concept: color('#10a396'), aws: color('#10a396'), native: color('#10a396') });
export function applyGalaxyPalette() {
  for (const [name, value] of Object.entries(galaxyPalette)) document.documentElement.style.setProperty(`--galaxy-${name}`, value.hex);
}
