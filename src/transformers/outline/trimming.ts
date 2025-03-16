import type { PathSegment } from './core/geometry.js';
import {
  arePointsClose,
  createVector,
  normalizeVector,
  createLineSegment,
} from './core/geometry.js';
import type { OffsetOptions } from './options.js';
import { POINT_TOLERANCE } from './constants.js';
import { findGroupIntersections } from './core/intersection.js';

/**
 * Result of a segment trimming operation
 */
export interface TrimResult {
  /** Modified previous group of segments */
  prevGroup: PathSegment[];
  /** Modified next group of segments */
  nextGroup: PathSegment[];
}

/**
 * Finds intersections between extended segments and trims them accordingly
 * This step happens before corner joining to handle natural intersections
 */
export function findIntersectionAndTrim(
  prevGroup: PathSegment[],
  nextGroup: PathSegment[],
  options: OffsetOptions,
): TrimResult {
  // Guard against empty groups
  if (prevGroup.length === 0 || nextGroup.length === 0) {
    return { prevGroup, nextGroup };
  }

  // Get the last segment from prevGroup and first segment from nextGroup
  // These are the segments that potentially need trimming at their junction
  const prevSegment = prevGroup[prevGroup.length - 1];
  const nextSegment = nextGroup[0];

  // Get the endpoints where these segments meet
  const p1 = prevSegment.points[prevSegment.points.length - 1];
  const p2 = nextSegment.points[0];

  // If endpoints are already very close, no intersection/trimming needed
  if (arePointsClose(p1, p2, POINT_TOLERANCE)) {
    return { prevGroup, nextGroup };
  }

  // Calculate tangent vectors at the junction points
  // The derivative() method returns the tangent direction at a specific parameter
  // Here we use parameter 1 for prevSegment (end) and 0 for nextSegment (start)
  let v1 = prevSegment.derivative(1);
  let v2 = nextSegment.derivative(0);

  // Handle cases where derivatives are too small to be useful
  const v1Mag = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const v2Mag = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

  // If a derivative is too small, fall back to using the segment direction vector
  if (v1Mag < POINT_TOLERANCE) {
    v1 = createVector(
      prevSegment.points[0],
      prevSegment.points[prevSegment.points.length - 1],
    );
  }

  if (v2Mag < POINT_TOLERANCE) {
    v2 = createVector(
      nextSegment.points[0],
      nextSegment.points[nextSegment.points.length > 1 ? 1 : 0],
    );
  }

  // Normalize the tangent vectors to unit length
  const normV1 = normalizeVector(v1);
  const normV2 = normalizeVector(v2);

  // Create virtual extended segments to find their intersection
  // We extend the segments along their tangent directions by a multiple of the stroke width
  // This ensures we find intersections even when segments don't naturally intersect
  const extensionDistance = options.width * 4;

  // Calculate virtual endpoints by extending along the tangent directions
  const virtualP1 = {
    x: p1.x + normV1.x * extensionDistance,
    y: p1.y + normV1.y * extensionDistance,
  };

  const virtualP2 = {
    x: p2.x - normV2.x * extensionDistance,
    y: p2.y - normV2.y * extensionDistance,
  };

  // Create line segments representing these extended portions
  const extendedSegment1 = createLineSegment(p1, virtualP1);
  const extendedSegment2 = createLineSegment(virtualP2, p2);

  // Create temporary groups that include the extended segments
  const tempPrevGroup = [...prevGroup, extendedSegment1];
  const tempNextGroup = [extendedSegment2, ...nextGroup];

  // Find the intersection between these extended segment groups
  // The algorithm returns indices of the intersecting curves and parameter values
  const intersectionResult = findGroupIntersections(
    tempPrevGroup,
    tempNextGroup,
  );

  // If no intersection found, or intersection only happens on extension segments
  // and not on the original curves, return the original groups unchanged
  if (
    !intersectionResult ||
    (intersectionResult.curveIdx1 >= prevGroup.length &&
      intersectionResult.curveIdx2 <= 0)
  ) {
    return { prevGroup, nextGroup };
  }

  // Extract intersection details
  const { curveIdx1, curveIdx2, t1, t2 } = intersectionResult;

  // Calculate the actual intersection point by averaging points from both curves
  // This improves numerical stability compared to using just one curve's point
  const p1At = tempPrevGroup[curveIdx1].get(t1);
  const p2At = tempNextGroup[curveIdx2].get(t2);
  const intersection = {
    x: (p1At.x + p2At.x) / 2,
    y: (p1At.y + p2At.y) / 2,
  };

  // Initialize trimmed segments with the original groups
  let trimmedPrev = prevGroup;
  let trimmedNext = nextGroup;

  // Handle intersection on the prev group (if it's not just on the extension)
  if (curveIdx1 < prevGroup.length) {
    // Determine if this segment is a line or curve for appropriate trimming
    const isPrevLine = prevGroup[curveIdx1].points.length === 2;

    // Create a trimmed segment - either a line or a portion of the curve
    const trimmedSegment = isPrevLine
      ? createLineSegment(prevGroup[curveIdx1].points[0], intersection)
      : prevGroup[curveIdx1].split(0, t1); // Split curve from start to intersection

    // Keep segments before the intersection, and add the trimmed segment
    trimmedPrev = [...prevGroup.slice(0, curveIdx1), trimmedSegment];
  }

  // Handle intersection on the next group (if it's not just on the extension)
  if (curveIdx2 > 0) {
    // Adjust index to account for the extension segment we added at the start
    const nextCurveIdx = curveIdx2 - 1;

    // Determine if this segment is a line or curve for appropriate trimming
    const isNextLine = nextGroup[nextCurveIdx].points.length === 2;

    // Create a trimmed segment - either a line or a portion of the curve
    const trimmedSegment = isNextLine
      ? createLineSegment(intersection, nextGroup[nextCurveIdx].points[1])
      : nextGroup[nextCurveIdx].split(t2, 1); // Split curve from intersection to end

    // Add the trimmed segment, and keep segments after the intersection
    trimmedNext = [trimmedSegment, ...nextGroup.slice(nextCurveIdx + 1)];
  }

  return {
    prevGroup: trimmedPrev,
    nextGroup: trimmedNext,
  };
}
