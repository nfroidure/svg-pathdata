import { SVGPathData } from '../../../SVGPathData.js';
import { SVGPathDataTransformer } from '../../../SVGPathDataTransformer.js';
import type {
  CommandC,
  CommandL,
  CommandM,
  CommandQ,
  SVGCommand,
} from '../../../types.js';
import type { PathSegment, Point } from '../core/geometry.js';
import {
  arePointsClose,
  createCurveSegment,
  createLineSegment,
} from '../core/geometry.js';

/**
 * Converts SVG path commands to PathSegment objects
 * @param rawCommands SVG path commands
 * @param isExplicitlyClosed Whether the path was explicitly closed with a Z command
 * @returns Array of PathSegment objects representing the path
 */
export function convertFromSVGCommands(
  rawCommands: SVGCommand[],
  isExplicitlyClosed: boolean,
): PathSegment[] {
  const commands = rawCommands.map(SVGPathDataTransformer.TO_ABS());

  const segments: PathSegment[] = [];
  let lastPoint: Point | null = null;
  let firstPoint: Point | null = null; // Store the first point for closing the path

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];

    // For the first command, just capture the starting point
    if (!lastPoint) {
      lastPoint = { x: cmd.x, y: cmd.y };
      firstPoint = { ...lastPoint }; // Store first point for closing the path later
      continue;
    }

    const start: Point = { ...lastPoint };
    const end: Point = {
      x: 'x' in cmd ? cmd.x : lastPoint.x,
      y: 'y' in cmd ? cmd.y : lastPoint.y,
    };

    let segment: PathSegment;
    switch (cmd.type) {
      case SVGPathData.CURVE_TO: {
        const cp1 = { x: cmd.x1, y: cmd.y1 };
        const cp2 = { x: cmd.x2, y: cmd.y2 };
        // Create a curve segment with potentially adjusted control points
        segment = createCurveSegment(start, cp1, cp2, end);
        break;
      }
      case SVGPathData.QUAD_TO: {
        const cp = { x: cmd.x1, y: cmd.y1 };
        // Convert quadratic bezier to cubic bezier for consistency
        segment = createCurveSegment(start, cp, cp, end);
        break;
      }
      case SVGPathData.VERT_LINE_TO:
      case SVGPathData.HORIZ_LINE_TO:
      case SVGPathData.LINE_TO:
        // Create a line segment for all other command types
        segment = createLineSegment(start, end);
        break;
      default:
        throw new Error(`Unsupported command type: ${cmd.type}`);
    }

    segments.push(segment);

    // Update current point for the next iteration
    lastPoint = end;
  }

  // If path was explicitly closed, add a closing segment from last point to first point
  // But only if the points are different (avoid degenerate closing segment)
  if (isExplicitlyClosed && firstPoint && lastPoint) {
    if (!arePointsClose(lastPoint, firstPoint)) {
      segments.push(createLineSegment(lastPoint, firstPoint));
    }
  }

  return segments;
}

/**
 * Converts connected segments to SVG commands
 * @param segments Array of path segments
 * @returns SVG commands representing the path
 */
export function convertToSVGCommands(segments: PathSegment[]): SVGCommand[] {
  const transformedResult: (CommandC | CommandM | CommandL | CommandQ)[] = [];

  // Early return if no segments
  if (segments.length === 0) {
    return transformedResult;
  }

  // Always start with a MOVE_TO to the first point
  const firstPoint = segments[0].point(0);
  transformedResult.push({
    type: SVGPathData.MOVE_TO,
    relative: false,
    x: firstPoint.x,
    y: firstPoint.y,
  });

  // Process all segments
  for (const segment of segments) {
    const start = segment.points.at(0);
    const end = segment.points.at(-1);

    if (!start || !end) {
      throw new Error('Segment must have start and end points');
    }

    // Detect segment type and convert to appropriate SVG command

    // Linear segments can be identified in three ways:
    // 1. The segment has the _linear flag set (Bezier.js optimization)
    // 2. The segment has only 2 points (start and end, no control points)
    // 3. Special check for collinearity of control points (not shown here)
    if (segment._linear || segment.points.length === 2) {
      transformedResult.push({
        type: SVGPathData.LINE_TO,
        relative: false,
        x: end.x,
        y: end.y,
      });
    }
    // Handle quadratic bezier curves (one control point)
    else if (segment.points.length === 3) {
      transformedResult.push({
        type: SVGPathData.QUAD_TO,
        relative: false,
        x: end.x,
        y: end.y,
        x1: segment.points[1].x,
        y1: segment.points[1].y,
      });
    }
    // Handle cubic bezier curves (two control points)
    else if (segment.points.length === 4) {
      transformedResult.push({
        type: SVGPathData.CURVE_TO,
        relative: false,
        x: end.x,
        y: end.y,
        x1: segment.points[1].x,
        y1: segment.points[1].y,
        x2: segment.points[2].x,
        y2: segment.points[2].y,
      });
    }
  }

  return transformedResult;
}
