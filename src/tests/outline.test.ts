import { describe, test, expect } from '@jest/globals';

import { SVGPathData } from '../SVGPathData.js';

import { OUTLINE } from '../transformers/outline/outline.js';
import type { OffsetOptions } from '../transformers/outline/options.js';

// Group options by type
const TEST_CONFIGS = {
  // Basic width tests for all shapes
  widthTests: [{ width: 1 }, { width: 2 }, { width: 5 }, { width: 10 }],

  // Line cap variations for open paths
  lineCapTests: [
    { width: 3, linecap: 'butt' },
    { width: 3, linecap: 'square' },
    { width: 3, linecap: 'round' },
  ],

  // Line join variations for closed paths
  lineJoinTests: [
    { width: 3, linejoin: 'miter' },
    { width: 3, linejoin: 'bevel' },
    // Add new tests for round joins
    { width: 3, linejoin: 'round' },
    { width: 3, linejoin: 'miter-clip' },
  ],

  // Miter limit tests for shapes with corners
  miterLimitTests: [
    { width: 3, linejoin: 'miter', miterLimit: 2 },
    { width: 3, linejoin: 'miter', miterLimit: 8 },
    { width: 3, linejoin: 'miter-clip', miterLimit: 2 },
    { width: 3, linejoin: 'miter-clip', miterLimit: 8 },
    { width: 3, linejoin: 'round', miterLimit: 2 },
    { width: 3, linejoin: 'round', miterLimit: 8 },
  ],

  // Combined option tests (more complex combinations)
  combinedTests: [
    { width: 4, linecap: 'butt', linejoin: 'miter', miterLimit: 4 },
    { width: 4, linecap: 'square', linejoin: 'bevel' },
    { width: 4, linecap: 'square', linejoin: 'round' },
    { width: 4, linecap: 'round', linejoin: 'miter-clip' },
  ],
} satisfies Record<string, Partial<OffsetOptions>[]>;

const TEST_SHAPES = {
  closed: {
    rectangle: 'M20,10 L150,10 L150,40 L20,40 Z',
    rectangleReversed: 'M 20,10V 40H 150V 10Z',
    implicitRectangle: 'M20,20 L60,20 L60,60 L20,60 L20,20',
    triangle: 'M75 120L120 70L30 70z',
    circle:
      'M8 5C8 6.656854249493 6.656854249493 8 5 8C3.343145750507 8 2 6.656854249493 2 5C2 3.343145750507 3.343145750507 2 5 2C6.656854249493 2 8 3.343145750507 8 5z',
    pentagon: 'M200 250L250 280L230 320L170 320L150 280z',
    shapeX: 'M10 10L50 50L10 50L50 10Z',
  },

  open: {
    line: 'M20 200L120 200',
    diagonalLine: 'M30 240L80 280',
    polyline: 'M50,50 L100,50 L100,100',
    zigzag: 'M10 280L40 250L70 280L100 250L130 280',
    curve: 'M10,10 C30,30 60,30 80,10',
    acuteCorner: 'M60 11L109 40L89 79',
    sharpCurvedEnd: 'M10,10 C30,10 40,40 10,40',
    sCurveWithInflection: 'M10,50 C40,0 60,100 90,50',
    spiralEnding: 'M100,100 C120,80 60,140 80,80 S40,100 60,60',
    curvedV: 'M10,10 C30,50 50,80 60,90 C70,80 90,50 110,10',
    smallCurvedV:
      'M1.25,1.25 C3.75,6.25 6.25,10 7.5,11.25 C8.75,10 11.25,6.25 13.75,1.25',
    sharpCurvedCorner:
      'M13,9.2 C14.2,9.2 9.5,3.5 6.4,3 C9.2,4.3 6.7,8.2 7.3,8.8',
    bottomRightCorner:
      'M7,0 C15.28,10.2 20.15,11.5 15.7,11.56 C11.399,11.633 1.818,9.539 1.818,9.539',
    bottomLeftCornerReversed:
      'M1.818 9.539C1.818 9.539 11.399 11.633 15.7 11.56C20.15 11.5 15.28 10.2 7 0',
    curveLine: 'M1.818 9.539C1.818 9.539 11.399 11.633 15.7 11.559999',
  },

  withCorners: {
    triangle: 'M75 120L120 70L30 70z',
    pentagon: 'M200 250L250 280L230 320L170 320L150 280z',
    sharpCorners:
      'M50 10L55 40L85 40L60 60L70 90L50 70L30 90L40 60L15 40L45 40Z',
    polyline: 'M50,50 L100,50 L100,100',
    zigzag: 'M10 280L40 250L70 280L100 250L130 280',
    sharpTriangle: 'M 39,6 39,40 53,40 Z',
    sharpWithCurve:
      'M 13,9.2 C 14.2,9.2 9.5,3.5 6.4,3 9.2,4.3 6.7,8.2 7.3,8.8 7.9,9.4 11.8,9.1 13.0,9.2 Z',
    curvedV: 'M10,10 C30,50 50,80 60,90 C70,80 90,50 110,10',
    smallCurvedV:
      'M1.25,1.25 C3.75,6.25 6.25,10 7.5,11.25 C8.75,10 11.25,6.25 13.75,1.25', // Add to corner tests as well
  },

  special: {
    duplicatePoint: 'M10 10L10 10L20 20Z',
    verySmallLine: 'M10 10L11 10',
    shapeX: 'M10 10L50 50L10 50L50 10Z',
  },
} as const;

const ALL_TEST_SHAPES = {
  ...TEST_SHAPES.closed,
  ...TEST_SHAPES.open,
  ...TEST_SHAPES.withCorners,
  ...TEST_SHAPES.special,
};

/**
 * Generate an outline path with options and save SVG visualization
 * @param path SVG path string
 * @param options Outline options
 * @param t Test context
 * @returns The generated outline path string
 */
function generateOutlinePath(
  path: string,
  options: Partial<OffsetOptions>,
): string {
  const pathData = new SVGPathData(path)
    .toAbs()
    .qtToC()
    .aToC()
    .normalizeST()
    .sanitize()
    .createOutline(options);
  return pathData.round(1000).encode();
}

describe('Outline Snapshots - Systematic Tests', () => {
  // Test all shapes with basic width variations
  describe('Width variations', () => {
    // Use Object.entries to iterate over all shapes
    for (const [shapeName, shapePath] of Object.entries(ALL_TEST_SHAPES)) {
      for (const options of TEST_CONFIGS.widthTests) {
        test(`${shapeName} with ${JSON.stringify(options)}`, () => {
          const result = generateOutlinePath(shapePath, options);
          expect(result).toMatchSnapshot();
        });
      }
    }
  });

  // Test open paths with line cap variations
  describe('Line cap styles', () => {
    for (const [shapeName, shapePath] of Object.entries(TEST_SHAPES.open)) {
      for (const options of TEST_CONFIGS.lineCapTests) {
        test(`${shapeName} with ${JSON.stringify(options)}`, () => {
          const result = generateOutlinePath(shapePath, options);
          expect(result).toMatchSnapshot();
        });
      }
    }
  });

  // Test shapes with corners using line join and miter limit variations
  describe('Line join and miter limit', () => {
    for (const [shapeName, shapePath] of Object.entries(
      TEST_SHAPES.withCorners,
    )) {
      // Test line join variations
      for (const options of TEST_CONFIGS.lineJoinTests) {
        test(`${shapeName} with ${JSON.stringify(options)}`, () => {
          const result = generateOutlinePath(shapePath, options);
          expect(result).toMatchSnapshot();
        });
      }

      // Test miter limit variations
      for (const options of TEST_CONFIGS.miterLimitTests) {
        test(`${shapeName} with ${JSON.stringify(options)}`, () => {
          const result = generateOutlinePath(shapePath, options);
          expect(result).toMatchSnapshot();
        });
      }
    }
  });

  // Test combined options on selected shapes
  describe('Combined options', () => {
    for (const [shapeName, shapePath] of Object.entries(
      TEST_SHAPES.withCorners,
    )) {
      // Find the shape path in any category
      for (const options of TEST_CONFIGS.combinedTests) {
        test(`${shapeName} with ${JSON.stringify(options)}`, () => {
          const result = generateOutlinePath(shapePath, options);
          expect(result).toMatchSnapshot();
        });
      }
    }
  });

  // Test edge cases
  describe('Edge cases', () => {
    for (const [shapeName, shapePath] of Object.entries(TEST_SHAPES.special)) {
      // Use width = 3 for all edge cases
      test(`${shapeName} with width=3`, () => {
        const result = generateOutlinePath(shapePath, { width: 3 });
        expect(result).toMatchSnapshot();
      });
    }

    // Special case for very small line with large width
    test('Very small line with large width', () => {
      const result = generateOutlinePath(TEST_SHAPES.special.verySmallLine, {
        width: 10,
      });
      expect(result).toMatchSnapshot();
    });
  });
});
