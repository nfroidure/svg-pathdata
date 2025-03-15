/**
 * Type definitions for SVG stroke properties
 */
export type StrokeLinejoin =
  | "miter"
  | "round"
  | "bevel"
  | "miter-clip"
  | "arcs";

export type StrokeLinecap = "butt" | "round" | "square";

export interface OffsetOptions {
  width: number;
  miterLimit: number;
  linejoin: StrokeLinejoin;
  linecap: StrokeLinecap;
}

/**
 * SVG stroke default values as defined in the SVG specification
 * @see https://www.w3.org/TR/SVG2/painting.html#StrokeProperties
 */
export const defaultOffsetOptions: OffsetOptions = {
  /** Default stroke width (1px in SVG spec) */
  width: 1,
  /** Default miter limit (4.0 in SVG spec) */
  miterLimit: 4.0,
  /** Default line join style */
  linejoin: "miter",
  /** Default line cap style */
  linecap: "butt",
};
