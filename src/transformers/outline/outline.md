# Path Outline Generation

Algorithm for generating outlines around SVG paths with consistent thickness.

## Path Types

- **Explicitly Closed Paths**: End with [`Z`] command (also includes paths closed with `z`)
- **Implicitly Closed Paths**: Paths where start/end points coincide but lack a [`Z`] command
- **Open Paths**: Paths where start/end points differ

> **SVG Specification Note**: According to the SVG spec, only paths with an explicit [`Z`] command are truly considered "closed" for stroking purposes. Implicitly closed paths (where endpoints coincide) are technically still treated as open paths, with `stroke-linecap` applied to both endpoints.

## Step-by-Step Process

### 1. Path Preparation & Analysis

- Convert all commands to absolute coordinates
- Remove duplicate points to avoid zero-length segments
- Identify if path is explicitly closed (ends with [`Z`] command)
- Choose the appropriate outlining strategy:
  - **For explicitly closed paths**: Remove [`Z`] command and calculate offset in both inner and outer directions
  - **For open paths**: Create a closed path by offsetting in both directions and connecting the endpoints

### 2. Generate Individual Offset Segments

- **For Line Segments**:

  - Calculate perpendicular offset vectors
  - Apply simple translation to create offset line segments
  - Store the offset points for later path construction

- **For Curve Segments**:

  - Create Bezier curve representation from the original control points
  - Use [bezier-js]'s `offset()` method to generate offset curves
    - This handles complex mathematical calculations
    - Multiple curve segments may be created for a single input curve
  - Store the resulting offset curve points for later processing

- **Path Direction Handling**:
  - The algorithm works correctly regardless of the original path's winding direction (clockwise or counter-clockwise)
  - Inner and outer offset segments are generated with appropriate orientation relative to the original path
  - Segments are correctly ordered and oriented for consistent corner detection

### 3. Handle Corner Connections

This step connects adjacent offset segments to ensure a continuous, gap-free outline:

- First, attempt to find natural intersections between segments and trim them accordingly
- Then apply corner joins based on the corner type:
  - **Concave corners** (cross product > 0): Connect directly with a line segment after trimming
  - **Convex corners** (cross product < 0): Apply the selected line join style (miter, bevel, round)
- Add connection points to create a continuous path

### 4. Handle Path Closure

- **For explicitly closed paths**:

  - Apply corner joining at the first/last segment junction
  - Keep inner and outer paths as separate continuous loops
  - Join inner and outer offset paths in the final output

- **For open paths**:
  - Do not join the ends of the offset segments
  - Add end caps based on the specified line cap style
  - Connect the outer and inner paths to form a single closed loop

### 5. Generate SVG Commands

- Convert the offset geometry into SVG path commands
- For closed paths: combine outer and inner paths with appropriate orientation
- For open paths: combine outer, inner, and end cap segments in the correct order
- Add closing [`Z`] command to produce the final outline path

## Important Implementation Notes

- **Path Closure Handling**: The algorithm distinguishes between explicitly closed (with Z command) and implicitly closed paths (endpoints coincide without Z)
- **Intersection Handling**: Uses robust intersection detection between extended segments for trimming
- **Numerical Stability**: Implements special handling for degenerate cases and near-parallel curves
- **Corner Detection**: Uses cross product calculations to determine corner type and appropriate joining strategy

[`Z`]: https://www.w3.org/TR/SVG2/paths.html#PathDataClosePathCommand
[bezier-js]: https://pomax.github.io/bezierjs/
