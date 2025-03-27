import type { Point, PathSegment } from '../core/geometry.js';
import {
  arePointsClose,
  createVector,
  normalizeVector,
  crossProduct,
  dotProduct,
  createLineSegment,
  bezierUtils,
  areVectorsParallel,
} from '../core/geometry.js';
import type { OffsetOptions } from '../options.js';
import { POINT_TOLERANCE, PARALLEL_TOLERANCE } from '../constants.js';
import { calculateRoundCurveSegment, createBevelJoin } from './shared.js';

/**
 * Result of a corner join operation
 */
export interface CornerJoinResult {
  /** Segments to use for the current (end) segment */
  prev: PathSegment[];
  /** Segments to use for the next (start) segment */
  next: PathSegment[];
}

/**
 * Creates corner junction segments between two segment groups
 * @param prevGroup Previous segment group
 * @param nextGroup Next segment group
 * @param options Outline generation options
 * @returns Modified segments for current and next groups
 */
export function createCornerJoin(
  prevGroup: PathSegment[],
  nextGroup: PathSegment[],
  options: OffsetOptions,
): CornerJoinResult {
  // Get segment points - optimize with direct indexing
  const prevSegment = prevGroup[prevGroup.length - 1];
  const nextSegment = nextGroup[0];
  if (!prevSegment || !nextSegment) {
    return { prev: prevGroup, next: nextGroup };
  }

  // Extract endpoints for calculation
  const p1 = prevSegment.points[prevSegment.points.length - 1];
  const p2 = nextSegment.points[0];

  // Early exit for identical or very close points
  if (arePointsClose(p1, p2, POINT_TOLERANCE)) {
    return { prev: prevGroup, next: nextGroup };
  }

  // Calculate vector between points once and reuse it
  const vecPoints = createVector(p1, p2);
  const dist = Math.sqrt(vecPoints.x * vecPoints.x + vecPoints.y * vecPoints.y);

  // Calculate direction vectors using Bezier's derivative method
  let v1 = prevSegment.derivative(1);
  let v2 = nextSegment.derivative(0);

  // Handle derivative fallbacks
  const v1Mag = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const v2Mag = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

  if (v1Mag < POINT_TOLERANCE || v2Mag < POINT_TOLERANCE) {
    if (v1Mag < POINT_TOLERANCE) {
      v1 = createVector(
        prevSegment.points[0],
        prevSegment.points[prevSegment.points.length - 1],
      );
    }
    if (v2Mag < POINT_TOLERANCE) {
      v2 = createVector(
        nextSegment.points[0],
        nextSegment.points[nextSegment.points.length - 1],
      );
    }
  }

  // Normalize the vectors once and reuse them
  const normV1 = normalizeVector(v1);
  const normV2 = normalizeVector(v2);

  // Calculate cross product to determine corner geometry
  // IMPORTANT: The sign of cross depends on the order of vectors!
  // We always use (v1 × v2) order for consistency
  const cross = crossProduct(normV1, normV2);

  // Geometric interpretation of the corner:
  // - When cross > 0: The corner is turning counter-clockwise (CCW) from v1 to v2
  // - When cross < 0: The corner is turning clockwise (CW) from v1 to v2
  //
  // For path stroking, we consider:
  // - CCW turn (cross > 0): Inside/concave corner
  // - CW turn (cross < 0): Outside/convex corner
  if (cross > 0) {
    const prev = [...prevGroup];
    prev[prev.length - 1] = prevSegment;
    prev.push(createLineSegment(p1, p2));
    return {
      prev,
      next: nextGroup,
    };
  }

  // Only calculate dot for convex corners that need specialized joins
  const dot = dotProduct(normV1, normV2);

  // For outside corners, determine join type
  let joinSegments: PathSegment[];

  // Use join type selection from options
  const joinType = options.linejoin || 'miter';
  switch (joinType) {
    case 'bevel':
      joinSegments = createBevelJoin(p1, p2);
      break;
    case 'miter-clip':
      joinSegments = createMiterClipJoin(
        p1,
        p2,
        v1,
        v2,
        vecPoints,
        dist,
        options.miterLimit,
        dot,
      );
      break;
    case 'round':
      joinSegments = [
        calculateRoundCurveSegment(p1, p2, normV1, normV2, dist, dot),
      ];
      break;
    default: // miter
      joinSegments = createMiterJoin(p1, p2, v1, v2, options.miterLimit, dot);
      break;
  }

  const prev = [...prevGroup];
  prev[prev.length - 1] = prevSegment;
  prev.push(...joinSegments);

  return { prev, next: nextGroup };
}

/**
 * Creates a miter join between two segments
 */
function createMiterJoin(
  p1: Point,
  p2: Point,
  v1: Point,
  v2: Point,
  miterLimit: number,
  dot: number,
): PathSegment[] {
  // Calculate miter limit for ANY angle (not just acute)
  const sinHalfAngle = Math.sqrt((1 - Math.abs(dot)) / 2);

  // Avoid division by zero and check miter limit
  if (sinHalfAngle < POINT_TOLERANCE || 1 / sinHalfAngle > miterLimit) {
    // Use bevel join for both near-parallel lines and exceeding miter limit
    return createBevelJoin(p1, p2);
  }

  // Calculate the intersection point using Bezier.js's line-line intersection utility
  const inter = bezierUtils.lli4(p1, { x: p1.x + v1.x, y: p1.y + v1.y }, p2, {
    x: p2.x + v2.x,
    y: p2.y + v2.y,
  });

  if (!inter) {
    return createBevelJoin(p1, p2);
  }

  if (areVectorsParallel(dot)) {
    return createBevelJoin(p1, p2);
  }

  return [createLineSegment(p1, inter), createLineSegment(inter, p2)];
}

/**
 * Creates a miter-clip join between two segments
 * Similar to miter join, but clips the miter at miterLimit instead of reverting to bevel
 */
function createMiterClipJoin(
  p1: Point,
  p2: Point,
  v1: Point,
  v2: Point,
  vecPoints: Point,
  dist: number,
  miterLimit: number,
  dot: number,
): PathSegment[] {
  // Calculate the cross product to check if lines are parallel
  const cross = crossProduct(v1, v2);

  // Check for mathematical parallelism - cannot compute intersection
  if (Math.abs(cross) < PARALLEL_TOLERANCE) {
    return createBevelJoin(p1, p2);
  }

  // Calculate the intersection point using parameter t
  const t = crossProduct(vecPoints, v2) / cross;
  const inter = {
    x: p1.x + t * v1.x,
    y: p1.y + t * v1.y,
  };

  // Calculate miter limit for ANY angle (not just acute)
  const sinHalfAngle = Math.sqrt((1 - Math.abs(dot)) / 2);

  // Check for near-zero sinHalfAngle
  if (sinHalfAngle < POINT_TOLERANCE) {
    return createBevelJoin(p1, p2);
  }

  // Calculate the miter ratio
  const miterRatio = 1 / sinHalfAngle;

  // For miter-clip: If miter ratio exceeds limit, we clip at miterLimit
  if (miterRatio > miterLimit) {
    // Calculate vectors from p1 and p2 to the intersection
    const vecP1ToInter = createVector(p1, inter);
    const vecP2ToInter = createVector(p2, inter);

    // Standardize naming: normalize these vectors with consistent naming pattern
    const normP1ToInter = normalizeVector(vecP1ToInter);
    const normP2ToInter = normalizeVector(vecP2ToInter);

    // Calculate the maximum allowed distance based on miterLimit
    const maxDist = (dist * miterLimit) / 2;

    // Calculate the clipped points
    const clip1 = {
      x: p1.x + normP1ToInter.x * maxDist,
      y: p1.y + normP1ToInter.y * maxDist,
    };

    const clip2 = {
      x: p2.x + normP2ToInter.x * maxDist,
      y: p2.y + normP2ToInter.y * maxDist,
    };

    // Return a three-segment connection with clipped miter
    return [
      createLineSegment(p1, clip1),
      createLineSegment(clip1, clip2),
      createLineSegment(clip2, p2),
    ];
  }

  // If we don't need to clip, just use the normal miter join
  return [createLineSegment(p1, inter), createLineSegment(inter, p2)];
}
