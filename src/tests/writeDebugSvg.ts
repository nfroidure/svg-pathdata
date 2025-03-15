import { writeFileSync, mkdirSync } from 'node:fs';

import { SVGPathData } from '../index.js';

let i = 0;

export function writeDebugToSvg(input: SVGPathData, source: string) {
  const bounds = input.getBounds();
  const padding = 5; // Extract padding to a constant for clarity
  const minX = bounds.minX - padding;
  const minY = bounds.minY - padding;
  // Calculate width and height properly
  const width = (bounds.maxX - bounds.minX + padding * 2) * 1.2;
  const height = (bounds.maxY - bounds.minY + padding * 2) * 1.2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}">
  <path d="${input.encode()}" fill="blue" opacity="0.5"  />
  <path d="${source}" fill="yellow" opacity="0.5" />
  </svg>`;

  try {
    mkdirSync('./debug', { recursive: true });
  } catch {}
  writeFileSync(`./debug/debug-${i++}.svg`, svg);
}
