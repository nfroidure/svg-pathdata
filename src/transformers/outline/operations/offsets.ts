import {
  createCurveSegment,
  createLineSegment,
  type PathSegment,
} from '../core/geometry.js';

/**
 * Result of generating both inner and outer offset segments
 */
export interface OffsetResult {
  /** Inner offset path segments (negative distance) */
  inner: PathSegment[][];
  /** Outer offset path segments (positive distance) */
  outer: PathSegment[][];
}

/**
 * Generates both inner and outer offset segments for each path segment
 * @param segments Path segments to offset
 * @param distance Half of the stroke width (positive value)
 * @returns Object containing both inner and outer offset segment groups
 */
export function generateOffsetSegments(
  segments: PathSegment[],
  distance: number,
): OffsetResult {
  // Create offset segments for outer and inner paths
  const outer = segments.map((segment) =>
    createSegmentOffset(segment, distance),
  );

  const inner = segments
    .map((segment) => reverseSegments(createSegmentOffset(segment, -distance)))
    .reverse();

  return { outer, inner };
}

function createSegmentOffset(
  segment: PathSegment,
  distance: number,
): PathSegment[] {
  // Use Bezier's offset method for all segment types
  const offsetCurves = segment.offset(distance);
  if (!Array.isArray(offsetCurves)) {
    throw new Error('⚠️ No offset curves returned');
  }
  return offsetCurves;
}

/**
 * Properly reverses an array of path segments
 * @param segments Array of path segments to reverse
 * @returns New array with segments in reverse order and properly flipped
 */
function reverseSegments(segments: PathSegment[]): PathSegment[] {
  if (!segments.length) return [];

  // Create a new array with segments in reverse order
  const reversed: PathSegment[] = [];

  // Process each segment in reverse order
  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i];
    const points = segment.points;

    // Create a new segment with points in reverse order
    if (points.length === 2) {
      // Line segments: just swap start and end
      reversed.push(createLineSegment(points[1], points[0]));
    } else if (points.length === 4) {
      // Cubic Bezier: reverse points and swap control points
      reversed.push(
        createCurveSegment(
          points[3], // Original end -> new start
          points[2], // Original cp2 -> new cp1
          points[1], // Original cp1 -> new cp2
          points[0], // Original start -> new end
        ),
      );
    } else {
      // Fallback for other segment types (shouldn't happen in our code)
      reversed.push(segment);
    }
  }

  return reversed;
}
