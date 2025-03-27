import { Bezier } from 'bezier-js';
import {
  PARALLEL_TOLERANCE,
  POINT_TOLERANCE,
  CONTROL_POINT_ADJUSTMENT,
} from '../constants.js';

export interface Point {
  x: number;
  y: number;
}

/**
 * Represents a unified path segment as a Bezier curve
 * All segments are represented as Bezier curves internally,
 * with lines being a special case where control points coincide with endpoints
 */
export type PathSegment = Bezier;

export const bezierUtils = Bezier.getUtils();

/**
 * Create a PathSegment from a line (special case of Bezier where control points coincide with endpoints)
 */
export function createLineSegment(start: Point, end: Point): PathSegment {
  // Create a Bezier curve representing a line - directly use the constructor
  return new Bezier([start, end]);
}

/**
 * Create a PathSegment from a cubic Bezier curve
 */
export function createCurveSegment(
  start: Point,
  cp1: Point,
  cp2: Point,
  end: Point,
): PathSegment {
  // Check for degenerate control points that match endpoints
  const cp1MatchesStart = arePointsClose(cp1, start);
  const cp2MatchesEnd = arePointsClose(cp2, end);

  if (cp1MatchesStart && cp2MatchesEnd) {
    // If both control points match endpoints, convert to a line
    return createLineSegment(start, end);
  }
  // Handle edge cases with better control point placement
  if (cp1MatchesStart) {
    // If first control point matches start, offset it slightly
    const offset = createVector(start, cp2);
    const scaledOffset = {
      x: start.x + offset.x * CONTROL_POINT_ADJUSTMENT,
      y: start.y + offset.y * CONTROL_POINT_ADJUSTMENT,
    };
    return new Bezier(start, scaledOffset, cp2, end);
  }
  if (cp2MatchesEnd) {
    // If second control point matches end, offset it slightly
    const offset = createVector(cp1, end);
    const scaledOffset = {
      x: end.x - offset.x * CONTROL_POINT_ADJUSTMENT,
      y: end.y - offset.y * CONTROL_POINT_ADJUSTMENT,
    };
    return new Bezier(start, cp1, scaledOffset, end);
  }
  return new Bezier(start, cp1, cp2, end);
}

/**
 * Creates a vector from two points
 * @param p1 Start point
 * @param p2 End point
 * @returns Vector from p1 to p2
 */
export function createVector(p1: Point, p2: Point): Point {
  return { x: p2.x - p1.x, y: p2.y - p1.y };
}

/**
 * Normalizes a vector to unit length
 * @param v Vector as a Point object
 * @returns A unit vector in the same direction
 */
export function normalizeVector(v: Point): Point {
  const mag = Math.sqrt(v.x * v.x + v.y * v.y);
  if (mag < POINT_TOLERANCE) return { x: 0, y: 0 };
  return { x: v.x / mag, y: v.y / mag };
}

/**
 * Calculates the dot product of two vectors
 * @param v1 First vector
 * @param v2 Second vector
 * @returns The dot product
 */
export function dotProduct(v1: Point, v2: Point): number {
  return v1.x * v2.x + v1.y * v2.y;
}

/**
 * Calculates the cross product of two vectors
 * @param v1 First vector
 * @param v2 Second vector
 * @returns The cross product (z-component)
 */
export function crossProduct(v1: Point, v2: Point): number {
  return v1.x * v2.y - v1.y * v2.x;
}

/**
 * Checks if two points are the same within a tolerance
 * @param p1 First point
 * @param p2 Second point
 * @param tolerance Distance tolerance (default: POINT_TOLERANCE)
 * @returns Whether points are considered the same
 */
export function arePointsClose(
  p1?: Point | null,
  p2?: Point | null,
  tolerance: number = POINT_TOLERANCE,
): boolean {
  if (!p1 || !p2) return false;

  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2) <= tolerance;
}

/**
 * Checks if two vectors are nearly parallel
 * This can be done via dot product: abs(abs(dot) - 1) < tol for normalized vectors
 * Or via determinant/cross product: abs(cross) < tol
 * Both approaches are mathematically equivalent, but dot product is more stable for normalized vectors
 * @param dot dot product of two normalized vectors
 * @returns Whether vectors are nearly parallel
 */
export function areVectorsParallel(dot: number): boolean {
  return Math.abs(Math.abs(dot) - 1) < PARALLEL_TOLERANCE;
}
