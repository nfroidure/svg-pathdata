import type { Point, PathSegment } from '../core/geometry.js';
import {
  areVectorsParallel,
  createCurveSegment,
  createLineSegment,
} from '../core/geometry.js';
import { POINT_TOLERANCE, BEZIER_SEMICIRCLE_FACTOR } from '../constants.js';

/**
 * Creates a beveled corner connection using a midpoint
 * @param p1 End point of first segment
 * @param p2 Start point of second segment
 * @returns Line segments forming the bevel join
 */
export function createBevelJoin(p1: Point, p2: Point): PathSegment[] {
  // Calculate midpoint for bevel
  const midpoint = {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };

  // Return the two segments forming the bevel
  return [createLineSegment(p1, midpoint), createLineSegment(midpoint, p2)];
}

/**
 * Calculates a curved segment between two points using a circular arc approximation
 * This function handles both general case arcs and special cases like semicircles
 *
 * @param p1 Start point of the curve
 * @param p2 End point of the curve
 * @param normV1 Normalized direction vector at p1
 * @param normV2 Normalized direction vector at p2
 * @param dist Distance between p1 and p2
 * @param dot Precomputed dot product between normalized vectors
 * @returns A complete PathSegment with curve information
 */
export function calculateRoundCurveSegment(
  p1: Point,
  p2: Point,
  normV1: Point,
  normV2: Point,
  dist: number,
  dot: number,
): PathSegment {
  // Check for nearly parallel vectors (either same or opposite direction)
  const nearlyParallel = areVectorsParallel(dot);
  if (nearlyParallel) {
    // Determine the perpendicular direction for control point placement
    let perpDir: Point;
    const vecP1P2 = { x: p2.x - p1.x, y: p2.y - p1.y };
    const perpLen = Math.sqrt(vecP1P2.x * vecP1P2.x + vecP1P2.y * vecP1P2.y);

    if (perpLen < POINT_TOLERANCE) {
      // When points are very close, use the derivative's perpendicular
      perpDir = { x: -normV1.y, y: normV1.x };
    } else {
      // Calculate perpendicular to the line connecting the two points
      perpDir = { x: -vecP1P2.y / perpLen, y: vecP1P2.x / perpLen };
    }

    // For a semicircle, radius = half the distance between points
    // The 4/3 ratio is the exact value needed for a perfect circular approximation
    // with cubic bezier curves
    const radius = dist / 2;
    const handleLen = BEZIER_SEMICIRCLE_FACTOR * radius;

    // Place control points perpendicular to the connecting line
    const cp1 = {
      x: p1.x + perpDir.x * handleLen,
      y: p1.y + perpDir.y * handleLen,
    };

    const cp2 = {
      x: p2.x + perpDir.x * handleLen,
      y: p2.y + perpDir.y * handleLen,
    };

    return createCurveSegment(p1, cp1, cp2, p2);
  }

  // General case: arbitrary angle between vectors
  // Calculate the angle between the normalized vectors
  const theta = Math.acos(Math.max(-1, Math.min(1, dot)));

  // Calculate sine of half the angle - critical for determining radius
  const sinHalfTheta = Math.sin(theta / 2);

  // Avoid division by zero and numerical issues with very small angles
  const radiusScale = 1 / Math.max(2 * sinHalfTheta, 0.01);

  // Calculate radius of the circular arc through these points with given tangents
  const radius = dist * radiusScale;

  // Calculate control point handle length for a circular arc approximation
  // This formula is derived from the cubic bezier approximation of circular arcs
  const angleFactor = BEZIER_SEMICIRCLE_FACTOR * Math.tan(theta / 4);
  const handleLen = radius * angleFactor;

  // Place control points along the respective tangent directions
  const cp1 = {
    x: p1.x + normV1.x * handleLen,
    y: p1.y + normV1.y * handleLen,
  };

  const cp2 = {
    x: p2.x - normV2.x * handleLen,
    y: p2.y - normV2.y * handleLen,
  };

  return createCurveSegment(p1, cp1, cp2, p2);
}
