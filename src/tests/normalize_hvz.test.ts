import { describe, test, expect } from '@jest/globals';
import { SVGPathData } from '../index.js';

function testNormalizeHVZ(input, expected) {
  expect(new SVGPathData(input).normalizeHVZ().encode()).toEqual(
    new SVGPathData(expected).encode(),
  );
}

describe('HVZA normalization', () => {
  // currently z/Z is always absolute
  test('should transform relative h v z', () => {
    testNormalizeHVZ(
      'm 10 10 h 100 v 100 z',
      'm 10 10 l 100 0 l 0 100 L 10 10',
    );
  });

  test('should transform absolute h v z', () => {
    testNormalizeHVZ(
      'M 10 10 H 100 V 100 Z',
      'M 10 10 L 100 10 L 100 100 L 10 10',
    );
  });

  test('should transform degenerate arcs', () => {
    testNormalizeHVZ(
      'M 10 10 A 0 10 0 0 0 100 100 a 20 0 0 0 0 20 0',
      'M 10 10 L 100 100 l 20 0',
    );
  });

  test('should transform bezier curves that are lines', () => {
    // Cubic bezier with all control points on the same line
    // M10,10 C40,20 70,30 100,40 (start at 10,10, end at 100,40, control points at 40,20 and 70,30)
    // This is a straight line because all points are collinear
    testNormalizeHVZ('M 10 10 C 40 20 70 30 100 40', 'M 10 10 L 100 40');

    // Same test with relative coordinates
    testNormalizeHVZ('M 10 10 c 30 10 60 20 90 30', 'M 10 10 l 90 30');
  });

  test('should transform quad curves that are lines', () => {
    // Quadratic bezier with control point on the same line
    // M10,10 Q55,25 100,40 (start at 10,10, end at 100,40, control point at 55,25)
    // This is a straight line because all points are collinear
    testNormalizeHVZ('M 10 10 Q 55 25 100 40', 'M 10 10 L 100 40');
    // Same test with relative coordinates
    testNormalizeHVZ('M 10 10 q 45 15 90 30', 'M 10 10 l 90 30');
  });
});
