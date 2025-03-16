import type { SVGCommand } from '../../types.js';
import { SVGPathData } from '../../SVGPathData.js';

import { generateOffsetSegments } from './operations/offsets.js';
import { createEndCap } from './operations/linecap.js';
import { createCornerJoin } from './operations/linejoin.js';
import type { PathSegment } from './core/geometry.js';
import { defaultOffsetOptions, type OffsetOptions } from './options.js';
import { findIntersectionAndTrim } from './trimming.js';
import {
  convertFromSVGCommands,
  convertToSVGCommands,
} from './svg/converters.js';

/**
 * Creates a complete outline for any path (closed or open)
 * @param commands SVG path commands to outline
 * @param options Options for the outline generation
 * @returns New SVG commands forming the outline
 */
export function OUTLINE(
  commands: SVGCommand[],
  userOptions: Partial<OffsetOptions> = {},
): SVGCommand[] {
  if (commands.length < 2) {
    throw new Error('Paths must have at least 2 commands');
  }

  const options = { ...defaultOffsetOptions, ...userOptions };

  // Check if path is explicitly closed with a CLOSE_PATH command
  const isExplicitlyClosed = commands.at(-1)?.type === SVGPathData.CLOSE_PATH;
  if (isExplicitlyClosed) {
    // Remove the closing command for processing
    commands.pop();
  }

  // Convert commands directly to PathSegment arrays
  const pathSegments = convertFromSVGCommands(commands, isExplicitlyClosed);

  // Let the outline generation know about the winding direction
  const { inner, outer } = generateOffsetSegments(
    pathSegments,
    options.width / 2,
  );

  // Connect the segments with proper corner handling
  const outerSegments = connectOffsetSegments(
    outer,
    options,
    isExplicitlyClosed,
  );
  const innerSegments = connectOffsetSegments(
    inner,
    options,
    isExplicitlyClosed,
  );

  let result: SVGCommand[] = [];

  // Convert combined segments to SVG commands
  if (isExplicitlyClosed) {
    // For closed paths, don't reverse the inner segments - they're already correctly oriented
    result = [
      ...convertToSVGCommands(outerSegments),
      ...convertToSVGCommands(innerSegments),
    ];
  } else {
    // Combine segments before converting to SVG commands
    const combinedSegments = combineSegmentGroups(
      outerSegments,
      innerSegments,
      options,
    );
    result = [...convertToSVGCommands(combinedSegments)];
  }

  // Always close the path for outlines
  result.push({ type: SVGPathData.CLOSE_PATH });
  return result;
}

/**
 * Combines outer and inner segment groups to form a complete outline
 * @param outerSegments The outer path segment groups
 * @param innerSegments The inner path segment groups
 * @param options Outline options for linecap handling
 * @returns Combined segment groups forming the complete outline
 */
function combineSegmentGroups(
  outerSegments: PathSegment[],
  innerSegments: PathSegment[],
  options: OffsetOptions,
): PathSegment[] {
  if (outerSegments.length === 0 || innerSegments.length === 0) {
    throw new Error('Segment groups must not be empty');
  }

  // Get first and last segments
  const outerLastSegment = outerSegments[outerSegments.length - 1];
  const outerFirstSegment = outerSegments[0];
  const innerLastSegment = innerSegments[innerSegments.length - 1];
  const innerFirstSegment = innerSegments[0];

  const result: PathSegment[] = [];

  // Add all outer segments
  result.push(...outerSegments);

  // Create RIGHT end cap (at the end of path)
  const rightEndCapSegments = createEndCap(
    outerLastSegment,
    innerFirstSegment,
    options.linecap,
  );

  result.push(...rightEndCapSegments);

  // Add inner segments without reversing them
  result.push(...innerSegments);

  // Create LEFT end cap (at the start of path)
  const leftEndCapSegments = createEndCap(
    innerLastSegment,
    outerFirstSegment,
    options.linecap,
  );

  result.push(...leftEndCapSegments);

  return result;
}

/**
 * Connects offset segments by handling corner junctions
 * @param offsetSegmentGroups Array of offset segment groups
 * @param options Outline generation options
 * @param isClosed Whether the path is closed explicitly
 * @returns Connected segments forming a continuous path
 */
function connectOffsetSegments(
  offsetSegmentGroups: PathSegment[][],
  options: OffsetOptions,
  isClosed = false,
): PathSegment[] {
  // Process each segment by joining it with the next one
  for (let i = 0; i < offsetSegmentGroups.length; i++) {
    // Skip connection if this is the last segment of an open path
    if (!isClosed && i === offsetSegmentGroups.length - 1) {
      continue;
    }

    // For the last segment of a closed path, connect back to first
    // Otherwise, connect to the next segment
    const nextIdx = i === offsetSegmentGroups.length - 1 ? 0 : i + 1;

    // STEP 1: Try to find and trim at intersections first
    const trimResult = findIntersectionAndTrim(
      offsetSegmentGroups[i],
      offsetSegmentGroups[nextIdx],
      options,
    );

    offsetSegmentGroups[i] = trimResult.prevGroup;
    offsetSegmentGroups[nextIdx] = trimResult.nextGroup;

    // STEP 2: Always apply corner joining
    // Get corner join result between current and next groups
    const joinResult = createCornerJoin(
      offsetSegmentGroups[i],
      offsetSegmentGroups[nextIdx],
      options,
    );

    // Update both the current and next segments with their modified versions
    offsetSegmentGroups[i] = joinResult.prev;
    offsetSegmentGroups[nextIdx] = joinResult.next;
  }

  // Flatten all segment groups into a single result array
  const result = offsetSegmentGroups.flat();
  return result;
}
