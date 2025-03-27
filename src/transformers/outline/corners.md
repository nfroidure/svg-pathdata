# Path Endpoint and Corner Handling

This document describes how endpoints and corners are handled during path outlining, explaining the geometric behaviors and implementation details.

## SVG Specification References

This implementation follows the SVG standard for path stroking:

- [`stroke`]: General stroke behavior specification
- [`stroke-width`]: Defines the thickness of the stroke
- [`stroke-linejoin`]: Defines the shape to be used at **corners** where path segments meet
- [`stroke-miterlimit`]: Defines the miter limit behavior
- [`stroke-linecap`]: Defines the shape to be used at the **ends** of open subpaths

## Line Join Types (Corners)

When two path segments meet at a point, the [`stroke-linejoin`] property determines how the outer corner is rendered:

![Line Join Illustration](https://www.w3.org/TR/SVG2/images/painting/linejoin-four.svg)

This implementation distinguishes between two types of corners:

- **Concave corners** (inside corners, positive cross product between segment tangents)
- **Convex corners** (outside corners, negative cross product between segment tangents)

### Corner Detection Method

We use a robust direction-independent approach to detect corner types:

1. Extract tangent vectors at the junction point of two segments
2. Calculate the cross product of these vectors
3. Analyze the sign of the cross product:
   - Positive cross product = concave/inside corner
   - Negative cross product = convex/outside corner

This geometric approach works correctly regardless of path winding direction, ensuring consistent corner treatment for both clockwise and counter-clockwise paths.

For inside corners, we use segment trimming through curve/line intersection to find the precise intersection point and trim segments accordingly. For outside corners, we apply the specified join style.

### Miter Join (Default)

- Creates sharp corners by extending the outer edges of the strokes until they meet
- Falls back to bevel join when the miter ratio exceeds the miter limit
- Uses precise tangent vectors from Bézier derivatives to determine the corner angle
- Calculates the intersection point between the extended edges

### Bevel Join

- Creates a flattened corner by connecting the outer edges directly with a straight line
- Produces a consistent visual appearance regardless of corner angle
- Used as a fallback when other join types cannot be applied

### Round Join

- Creates a rounded corner using a circular arc between the two segments
- For SVG compliance:
  - Only applies to outside corners (where segments form a convex angle)
  - Inside corners use trimming or bevel join instead
- Uses cubic Bézier curves to approximate the circular arc with:
  - Formula `(4/3) * Math.tan(θ/4)` to determine control point distances
  - Control points positioned along the segment tangent directions
  - Optimization for special angles like 180° caps

### Miter-Clip Join

- Similar to miter join, but clips the corner at the miter limit distance instead of reverting to bevel
- Creates a truncated corner that preserves the angle while limiting excessive extension
- Uses three line segments when clipping is needed (creating a flat "clipped" edge)

### Missing Standard Join Types

- **Arcs (SVG 2.0)**: Creates joins using circular arcs with radius equal to the stroke width
  - Differs from round join by creating a more consistent circular arc rather than a Bézier approximation
  - Part of the SVG 2.0 specification but not widely supported in browsers yet

## Miter Limit

- Controls the maximum extension of corners relative to [`stroke-width`]
- Formula: miter ratio = 1 / sin(θ/2) where θ is the angle between segments
- Default value is 4, meaning corners sharper than ~29° are affected
- Behavior depends on join type:
  - For `miter`: Falls back to bevel join when ratio exceeds the limit
  - For `miter-clip`: Truncates the corner at the limit distance

## Line Cap Types (Open Path Endpoints)

For open paths, the [`stroke-linecap`] property determines how the endpoints are rendered:

![Line Cap Illustration](https://www.w3.org/TR/SVG2/images/painting/linecap.svg)

### Butt Cap (Default)

- Ends the path exactly at the endpoint coordinate with no extension
- Creates a flat end perpendicular to the path direction

### Square Cap

- Extends the path endpoint by half the [`stroke-width`] in the path's perpendicular direction
- Creates a square appearance at the end of the path

### Round Cap

- Creates a semicircular cap with diameter equal to the [`stroke-width`]
- Uses cubic Bézier curves to approximate the semicircle:
  - Utilizes the mathematical formula for circular arc approximation
  - For semicircles (180°), simplified to `(4/3) * Math.tan(Math.PI/4)`
  - Positions control points along the tangent directions of segments

## Implementation Approach

This implementation handles all SVG corner and endpoint styles with robust strategies for:

- Computing precise intersection points using Bézier curve derivatives
- Applying intelligent segment trimming for inside corners
- Using bounding box optimization for efficient intersection detection
- Selecting optimal intersections when multiple possibilities exist
- Properly splitting curves at intersection points to maintain geometric continuity

For all corner types, we extract precise tangent vectors using mathematical derivatives from Bézier.js, with fallback strategies for near-zero derivatives. This ensures accurate corner detection and proper handling of both simple and complex paths.

## Current Capabilities

The implementation efficiently handles:

- Line-to-line, line-to-curve, and curve-to-curve intersections
- Short segments that might otherwise be completely removed
- Complex paths with overlapping sections
- Accurate corner detection using cross product analysis
- Consistent joining behavior across different segment types
- Path direction independence - works for both clockwise and counter-clockwise paths

## Future Enhancements

- **Dash Patterns**: Support for stroke-dasharray with proper corner handling
- **Performance Optimizations**: Geometric pre-filtering and math optimizations

[`stroke`]: https://www.w3.org/TR/SVG2/painting.html#StrokeProperty
[`stroke-linejoin`]: https://www.w3.org/TR/SVG2/painting.html#StrokeLinejoinProperty
[`stroke-miterlimit`]: https://www.w3.org/TR/SVG2/painting.html#StrokeMiterlimitProperty
[`stroke-linecap`]: https://www.w3.org/TR/SVG2/painting.html#StrokeLinecapProperty
[`stroke-width`]: https://www.w3.org/TR/SVG2/painting.html#StrokeWidthProperty
