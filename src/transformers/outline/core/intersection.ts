import type { PathSegment, Point } from './geometry.js';
import { Bezier } from 'bezier-js';
import { PARALLEL_TOLERANCE, INTERSECTION_TOLERANCE } from '../constants.js';

export const bezierUtils = Bezier.getUtils();

export function lineToLineIntersection(
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point,
): [number, number] | null {
  const dx1 = p2.x - p1.x;
  const dy1 = p2.y - p1.y;
  const dx2 = p4.x - p3.x;
  const dy2 = p4.y - p3.y;

  // Check for parallel lines using determinant (cross product)
  // This is equivalent to the dot product check for normalized vectors
  // but more numerically stable for the direct line equation approach used here
  const det = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(det) < PARALLEL_TOLERANCE) {
    return null;
  }

  const t1 = ((p3.x - p1.x) * dy2 - (p3.y - p1.y) * dx2) / det;
  const t2 = ((p3.x - p1.x) * dy1 - (p3.y - p1.y) * dx1) / det;

  if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
    return [t1, t2];
  }
  return null;
}

/**
 * Gets the intersection parameter values between two curves
 * @param curve1 First curve segment
 * @param curve2 Second curve segment
 * @param threshold Precision threshold for calculations
 * @returns Intersection parameters [t1, t2] or null if no intersection found
 */
function getIntersection(
  curve1: PathSegment,
  curve2: PathSegment,
  threshold: number,
): [number, number] | null {
  // Handle line-line intersection specifically
  if (curve1.points.length === 2 && curve2.points.length === 2) {
    return lineToLineIntersection(
      curve1.points[0],
      curve1.points[1],
      curve2.points[0],
      curve2.points[1],
    );
  }

  // Store all valid intersections to select best one
  const validIntersections: [number, number][] = [];

  // Handle curve-line intersections
  if (curve1.points.length === 2) {
    const res = curve2.lineIntersects({
      p1: curve1.points[0],
      p2: curve1.points[1],
    });
    if (res && res.length > 0) {
      // Process all intersections
      for (const t1 of res) {
        const point = curve2.get(t1);
        const t2 = curve1.project(point).t;
        if (t2 !== undefined && t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
          validIntersections.push([t1, t2]);
        }
      }
    }
  } else if (curve2.points.length === 2) {
    const res = curve1.lineIntersects({
      p1: curve2.points[0],
      p2: curve2.points[1],
    });
    if (res && res.length > 0) {
      // Process all intersections
      for (const t2 of res) {
        const point = curve1.get(t2);
        const t1 = curve2.project(point).t;
        if (t1 !== undefined && t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
          validIntersections.push([t2, t1]);
        }
      }
    }
  } else {
    // Handle curve-curve intersections with pairiteration
    const intersections = bezierUtils.pairiteration(curve1, curve2, threshold);

    for (const intersection of intersections) {
      const [t1Str, t2Str] = intersection.split('/');
      const t1 = Number.parseFloat(t1Str);
      const t2 = Number.parseFloat(t2Str);

      if (
        !Number.isNaN(t1) &&
        !Number.isNaN(t2) &&
        t1 >= 0 &&
        t1 <= 1 &&
        t2 >= 0 &&
        t2 <= 1
      ) {
        validIntersections.push([t1, t2]);
      }
    }
  }

  // If no valid intersections found, return null
  if (validIntersections.length === 0) {
    return null;
  }

  // Select the best intersection based on trimming context
  // For trimming in path offsetting, we generally want intersections
  // that are closer to the end of curve1 and the start of curve2
  return validIntersections.reduce((best, current) => {
    // Calculate scores: a lower score is better
    // We want t1 close to 1.0 and t2 close to 0.0 for efficient trimming
    const [t1Best, t2Best] = best;
    const [t1Current, t2Current] = current;

    const scoreBest = Math.abs(1 - t1Best) + Math.abs(t2Best);
    const scoreCurrent = Math.abs(1 - t1Current) + Math.abs(t2Current);

    return scoreCurrent < scoreBest ? current : best;
  }, validIntersections[0]);
}

/**
 * Custom implementation to find intersections between curve groups while tracking curve indices
 * @param prevGroup First curve group
 * @param nextGroup Second curve group
 * @param threshold Precision threshold
 * @returns Best intersection found (or null if none)
 */
export function findGroupIntersections(
  prevGroup: PathSegment[],
  nextGroup: PathSegment[],
  threshold = INTERSECTION_TOLERANCE,
): {
  curveIdx1: number;
  curveIdx2: number;
  t1: number;
  t2: number;
} | null {
  // Pre-calculate all bounding boxes from the transformed curves
  const prevBboxes = prevGroup.map((curve) => curve.bbox());
  const nextBboxes = nextGroup.map((curve) => curve.bbox());

  // Track best intersection
  let bestResult: {
    curveIdx1: number;
    curveIdx2: number;
    t1: number;
    t2: number;
  } | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  // Traverse prevGroup in forward order (find earliest segment)
  for (let i = 0; i < prevGroup.length; i++) {
    // Traverse nextGroup in reverse order (find latest segment)
    for (let j = nextGroup.length - 1; j >= 0; j--) {
      if (!bezierUtils.bboxoverlap(prevBboxes[i], nextBboxes[j])) {
        continue;
      }

      // Use our fixed getIntersection function
      const intersection = getIntersection(
        prevGroup[i],
        nextGroup[j],
        threshold,
      );

      if (intersection) {
        const [t1, t2] = intersection;

        const currentResult = {
          curveIdx1: i,
          curveIdx2: j,
          t1,
          t2,
        };

        // 1. Position in prevGroup (prefer early intersections - small i)
        // 2. Position in nextGroup (prefer late intersections - large j)
        // 3. Parameter values within each curve

        // Calculate global position score
        const prevPositionScore = i + t1; // Lower is better for prevGroup
        const nextPositionScore = nextGroup.length - j - 1 + (1 - t2); // Lower is better for nextGroup

        const score = prevPositionScore + nextPositionScore;

        if (score < bestScore) {
          bestScore = score;
          bestResult = currentResult;

          // Early termination for very good matches
          if (i === 0 && j === nextGroup.length - 1 && t1 < 0.1 && t2 > 0.9) {
            return bestResult;
          }
        }
      }
    }

    // Early exit if we found a reasonably good match
    if (bestResult && bestResult.curveIdx1 === i && bestResult.t1 < 0.2) {
      break;
    }
  }

  return bestResult;
}
