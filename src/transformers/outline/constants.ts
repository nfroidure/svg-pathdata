/**
 * SVG standard constants and thresholds for path and stroke operations
 * Based on SVG spec and common implementation practices in browsers and libraries
 */

/***********************
 * Geometry tolerance constants
 ***********************/
/** Tolerance for determining if points are the same */
export const POINT_TOLERANCE = 0.001;
/**
 * Tolerance for determining if lines are parallel
 * This can be done via dot product: abs(abs(dot) - 1) < tol for normalized vectors
 * Or via determinant/cross product: abs(cross) < tol
 * Both approaches are mathematically equivalent, but dot product is more stable for normalized vectors
 */
export const PARALLEL_TOLERANCE = 0.0001;
/** Tolerance for curve flatness detection during subdivision */
export const FLATNESS_TOLERANCE = 0.001;
/** Tolerance for determining if a point is on a curve */
export const CURVE_POINT_TOLERANCE = 0.01;
/** Tolerance for Bezier curve intersection detection */
export const INTERSECTION_TOLERANCE = 0.001;

/***********************
 * Mathematical constants used in stroke calculations
 ***********************/
/**
 * Magic number for cubic Bezier circle approximation
 * A circle or circular arc can be approximated with a cubic Bezier curve
 * by multiplying the circular radius by this constant to get the distance
 * of the control points from the endpoints along the tangent direction.
 *
 * This is derived from the formula: 4/3 * tan(π/8) ≈ 4/3 * 0.4142 ≈ 0.5523
 */
export const BEZIER_ARC_FACTOR = 0.5523;

/**
 * Alternative calculation for the magic number: 4/3 * tan(θ/4)
 * For a 90° corner (θ = 90°): 4/3 * tan(22.5°) ≈ 0.5523
 * For a 180° semicircle (θ = 180°): 4/3 * tan(45°) = 4/3 * 1 = 4/3 ≈ 1.3333
 */
export const BEZIER_SEMICIRCLE_FACTOR = 4 / 3;

/**
 * SVG Arc error constant - the maximum allowed distance between
 * a circular arc and its Bezier approximation, used when subdividing arcs
 */
export const ARC_ERROR_THRESHOLD = 0.5;

/***********************
 * SVG path command related constants
 ***********************/

/**
 * Maximum accepted segment deviation during curve flattening
 * Lower values produce more line segments but better approximations
 */
export const FLATTENING_THRESHOLD = 0.1;

/**
 * Maximum angle (in radians) between path segments when flattening
 * Used to ensure curved features maintain adequate resolution
 */
export const MAX_ANGLE_DELTA = Math.PI / 10; // 18 degrees

/***********************
 * Performance optimization constants
 ***********************/

/**
 * Minimum length of a segment before it's considered for removal
 * Helps avoid visual artifacts from extremely short segments
 */
export const MIN_SEGMENT_LENGTH = 0.05;

/**
 * Maximum recursion depth for curve subdivision algorithms
 * Prevents stack overflows while maintaining reasonable accuracy
 */
export const MAX_RECURSION_DEPTH = 20;

/**
 * Maximum number of segments when flattening complex curves
 * Prevents performance issues with highly detailed shapes
 */
export const MAX_FLATTENED_SEGMENTS = 1000;

/**
 * Control point adjustment factor for near-degenerate cubic curves
 * Used when control points are too close to endpoints
 */
export const CONTROL_POINT_ADJUSTMENT = 0.1;
