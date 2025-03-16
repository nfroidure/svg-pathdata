import { writeFileSync, mkdirSync } from 'node:fs';

import { SVGPathData } from '../SVGPathData.js';
import { SVGPathDataTransformer } from '../SVGPathDataTransformer.js';
import type { OffsetOptions } from '../transformers/outline/options.js';

export interface SvgDebugOptions {
  showControlPoints: boolean;
  showHandleLines: boolean;
  showSegmentPoints: boolean;
  showDirectionArrows: boolean;
  showBounds: boolean;
}

// To be used in tests:
// writeSvg(createOutlineSvg(path, pathData, options, {
//   showControlPoints: true,
//   showHandleLines: true,
//   showSegmentPoints: true,
//   showDirectionArrows: false,
//   showBounds: true,
// }));

// Generate and save debugging SVG visualization
export function createOutlineSvg(
  originalPath: string,
  pathData: SVGPathData,
  options: OffsetOptions,
  opts: SvgDebugOptions,
) {
  // Generate and save debugging SVG visualization
  const pathOptions = Object.entries(options)
    .map(([key, value]) => `stroke-${key.toLowerCase()}="${value}"`)
    .join(' ');

  const bounds = pathData.getBounds();
  const padding = 5; // Extract padding to a constant for clarity
  const minX = bounds.minX - padding;
  const minY = bounds.minY - padding;
  // Calculate width and height properly
  const width = (bounds.maxX - bounds.minX + padding * 2) * 1.2;
  const height = (bounds.maxY - bounds.minY + padding * 2) * 1.2;

  // Calculate the viewport size and diagonal
  const viewboxDiagonal = Math.sqrt(width * width + height * height);

  // Improved approach for scaling visual elements
  // Using logarithmic scaling for better behavior across different viewport sizes
  const logBase = Math.log10(viewboxDiagonal);

  // Create scale constants with improved logarithmic scaling
  const scale = {
    // Significantly reduce point size while keeping the logarithmic scaling
    point: Math.max(0.2, Math.min(0.3 + logBase * 0.15, 1.5)),

    // Keep line thickness as a consistent proportion of the much smaller point size
    get line() {
      return this.point * 0.7;
    },

    // Keep arrow size at a reasonable proportion
    get arrow() {
      return this.point * 2;
    },

    // Bounding box should have a consistent thin but visible stroke
    get boundingBox() {
      return this.line * 0.7;
    },

    // Dash pattern for bounding box proportional to viewport
    get dashPattern() {
      return this.point * 2;
    },
  };

  // Define reusable SVG elements for better performance and smaller file size
  const defs = `  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
      markerWidth="${scale.arrow}" markerHeight="${scale.arrow}" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#9d9d9d" opacity="0.4" />
    </marker>
    <circle id="segment-point" r="${scale.point}" fill="black" fill-opacity="0.6" />
    <circle id="control-point" r="${scale.point}" fill="red" fill-opacity="0.6" />
  </defs>`;

  const boundingBox = opts.showBounds
    ? `<rect x="${bounds.minX}" y="${bounds.minY}"
      width="${bounds.maxX - bounds.minX}" height="${bounds.maxY - bounds.minY}"
      stroke="red" stroke-width="${scale.boundingBox}" fill="none"
      stroke-dasharray="${scale.dashPattern},${scale.dashPattern * 0.5}" />`
    : '';

  const transformer = svgTransformer({ ...opts, scale });

  // Generate SVG elements for debugging
  const debugElements = pathData.commands
    .flatMap(transformer)
    .filter(Boolean)
    .join('\n');

  // Base SVG with paths
  const svgOutput = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}">
${defs}
  <path d="${originalPath}" fill="none" stroke="yellow" opacity="0.7" ${pathOptions} />
  <path d="${pathData.encode()}" fill="blue" fill-opacity="0.5" stroke="none" />
  ${boundingBox}
  ${debugElements}
</svg>`;

  return svgOutput;
}

function makePoint(x: number, y: number, type: string) {
  return `<use href="#${type}" transform="translate(${x}, ${y})" />`;
}

/**
 * Generate SVG elements for points visualization using <use> for efficiency
 */
function svgTransformer(
  opts: SvgDebugOptions & { scale: Record<string, number> },
) {
  let lastPoint: { x: number; y: number } | null = null;

  function makeLine(x: number, y: number, x1: number, y1: number) {
    return `  <line x1="${x}" y1="${y}" x2="${x1}" y2="${y1}"
      stroke="#808080" stroke-opacity="0.6" stroke-width="${opts.scale.line}" />`;
  }
  let i = -1;

  return SVGPathDataTransformer.INFO((cmd, prevXAbs, prevYAbs) => {
    ++i;
    const result: string[] = [];

    if (cmd.type === SVGPathData.CLOSE_PATH) {
      return [];
    }

    const currentPoint = {
      x: cmd.relative && cmd.x ? cmd.x + prevXAbs : (cmd.x ?? prevXAbs),
      y: cmd.relative && cmd.y ? cmd.y + prevYAbs : (cmd.y ?? prevYAbs),
    };

    // For segment points (start/end points of segments)
    if (opts.showSegmentPoints) {
      result.push(makePoint(currentPoint.x, currentPoint.y, 'segment-point'));
    }

    if (opts.showControlPoints && 'cX' in cmd && 'cY' in cmd) {
      result.push(makePoint(cmd.x1, cmd.y1, 'control-point'));
    }

    if (opts.showControlPoints && 'x1' in cmd && 'y1' in cmd) {
      result.push(makePoint(cmd.x1, cmd.y1, 'control-point'));

      // Draw handle lines connecting control points to anchors
      if (opts.showHandleLines && lastPoint) {
        result.push(makeLine(lastPoint.x, lastPoint.y, cmd.x1, cmd.y1));
      }
    }

    // For cubic curve control points
    if (opts.showControlPoints && 'x2' in cmd && 'y2' in cmd) {
      result.push(makePoint(cmd.x2, cmd.y2, 'control-point'));

      // Draw handle lines connecting control points to anchors
      if (opts.showHandleLines && lastPoint) {
        result.push(makeLine(currentPoint.x, currentPoint.y, cmd.x2, cmd.y2));
      }
    }

    // Show direction arrows
    if (opts.showDirectionArrows && lastPoint) {
      // Calculate distance between points to adjust arrow density
      const dx = currentPoint.x - lastPoint.x;
      const dy = currentPoint.y - lastPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Only show arrows for segments above a minimum length
      if (distance > opts.scale.point * 3) {
        const midX = (lastPoint.x + currentPoint.x) / 2;
        const midY = (lastPoint.y + currentPoint.y) / 2;
        result.push(
          `<path d="M${lastPoint.x},${lastPoint.y} L${midX},${midY}"
            fill="none" stroke="#9d9d9d" stroke-opacity="0.4"
            stroke-width="${opts.scale.line}" marker-end="url(#arrow)" />`,
        );
      }
    }

    // Remember last point for next iteration
    lastPoint = currentPoint;
    return result;
  });
}

let itr = 0;

export function writeSvg(svg: string) {
  try {
    mkdirSync('./debug', { recursive: true });
  } catch {
    // noop
  }
  writeFileSync(`./debug/debug-${itr++}.svg`, svg);
}
