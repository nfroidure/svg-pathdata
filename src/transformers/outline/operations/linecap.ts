import type { Point, PathSegment } from '../core/geometry.js';
import {
  createVector,
  normalizeVector,
  createLineSegment,
  dotProduct,
} from '../core/geometry.js';
import type { OffsetOptions } from '../options.js';
import { POINT_TOLERANCE } from '../constants.js';
import { calculateRoundCurveSegment } from './shared.js';

/**
 * Creates end cap segments between two segment points based on linecap style
 * End caps connect the endpoints of the inner and outer path offset curves
 *
 * @param fromSegment Starting segment with direction information
 * @param toSegment Ending segment with direction information
 * @param linecap The linecap style to use ("butt", "round", or "square")
 * @returns Array of PathSegment forming the cap
 */
export function createEndCap(
  fromSegment: PathSegment,
  toSegment: PathSegment,
  linecap: OffsetOptions['linecap'],
): PathSegment[] {
  // Extract endpoints directly from the segments
  const p1 = fromSegment.points[fromSegment.points.length - 1];
  const p2 = toSegment.points[0];

  // Calculate vector and distance between points
  const vec = createVector(p1, p2);
  const dist = Math.sqrt(vec.x * vec.x + vec.y * vec.y);

  // For extremely close points, no cap is needed
  if (dist < POINT_TOLERANCE) {
    return [];
  }

  // Create appropriate cap based on the specified style
  switch (linecap) {
    case 'square':
      return createSquareCap(p1, p2, vec, dist);
    case 'round':
      return createRoundCap(p1, p2, fromSegment, toSegment, dist);
    default:
      // "butt" is the default - a straight line between endpoints
      return [createLineSegment(p1, p2)];
  }
}

/**
 * Creates a square cap with extended corners
 * Square caps extend beyond the actual segment endpoints along the path direction
 *
 * Implementation details:
 * 1. Calculate a perpendicular vector to the path direction
 * 2. Create corner points extended perpendicular to the path
 * 3. Connect these corner points with line segments to form a square cap
 */
function createSquareCap(
  p1: Point,
  p2: Point,
  vec: Point,
  dist: number,
): PathSegment[] {
  // Calculate extension distance (half of the path width)
  const halfWidth = dist / 2;

  // Calculate a normalized perpendicular vector to the path direction
  // This creates the "extended" look of a square cap
  const perpX = (-vec.y / dist) * halfWidth;
  const perpY = (vec.x / dist) * halfWidth;

  // Create the corner points for the square cap
  const corner1 = { x: p1.x + perpX, y: p1.y + perpY };
  const corner2 = { x: p2.x + perpX, y: p2.y + perpY };

  // Create three line segments forming the square cap
  return [
    createLineSegment(p1, corner1),
    createLineSegment(corner1, corner2),
    createLineSegment(corner2, p2),
  ];
}

/**
 * Creates a round cap with a curved connection
 * Round caps use a circular arc to smoothly connect the endpoints
 */
function createRoundCap(
  p1: Point,
  p2: Point,
  fromSegment: PathSegment,
  toSegment: PathSegment,
  dist: number,
): PathSegment[] {
  // Get tangent direction vectors from the segments' derivatives
  let v1 = fromSegment.derivative(1); // Derivative at end point
  let v2 = toSegment.derivative(0); // Derivative at start point

  // Calculate magnitudes of the derivative vectors
  const v1Mag = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const v2Mag = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

  // Handle cases where derivatives are not useful (near zero magnitude)
  if (v1Mag < POINT_TOLERANCE || v2Mag < POINT_TOLERANCE) {
    if (v1Mag < POINT_TOLERANCE) {
      // Fall back to using segment direction for v1
      v1 = createVector(
        fromSegment.points[0],
        fromSegment.points[fromSegment.points.length - 1],
      );
    }

    if (v2Mag < POINT_TOLERANCE) {
      // Fall back to using segment direction for v2
      v2 = createVector(
        toSegment.points[0],
        toSegment.points[toSegment.points.length - 1],
      );
    }
  }

  // Normalize the tangent vectors to unit length
  const normV1 = normalizeVector(v1);
  const normV2 = normalizeVector(v2);

  // Calculate the dot product to determine the angle between vectors
  const dot = dotProduct(normV1, normV2);

  // Create a curve segment approximating a circular arc between the points
  return [calculateRoundCurveSegment(p1, p2, normV1, normV2, dist, dot)];
}
