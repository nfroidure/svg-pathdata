import { describe, test, expect } from '@jest/globals';
import { SVGPathData } from '../index.js';

describe('Reverse paths', () => {
  describe('Valid', () => {
    test('single move to', () => {
      const input = 'M10,10';
      const expected = 'M10 10';
      expect(new SVGPathData(input).reverse().encode()).toEqual(expected);
    });
    test('simple line path', () => {
      const input = 'M10,10 L20,20 L30,10';
      const expected = 'M30 10L20 20L10 10';
      expect(new SVGPathData(input).reverse().encode()).toEqual(expected);
    });

    test('horizontal and vertical lines', () => {
      const input = 'M10,10 H30 V30 H10';
      const expected = 'M10 30H30V10H10';
      expect(new SVGPathData(input).reverse().encode()).toEqual(expected);
    });

    test('closed path (with Z command)', () => {
      const input = 'M10,10 L20,20 L30,10 Z';
      // The Z command is preserved in the reversed path
      const expected = 'M30 10L20 20L10 10z';
      expect(new SVGPathData(input).reverse().encode()).toEqual(expected);
    });

    test('path with cubic bezier curves', () => {
      const input = 'M10,10 C20,20 40,20 50,10';
      // Reversed path with flipped control points
      const expected = 'M50 10C40 20 20 20 10 10';
      expect(new SVGPathData(input).reverse().encode()).toEqual(expected);
    });

    test('single point path', () => {
      const input = 'M10,10';
      // A single point path results in just a move command
      const expected = 'M10 10';
      expect(new SVGPathData(input).reverse().encode()).toEqual(expected);
    });

    test('empty path', () => {
      const input = '';
      const expected = '';
      expect(new SVGPathData(input).reverse().encode()).toEqual(expected);
    });

    test('path closed both explicitly and implicitly', () => {
      const input = 'M10,10 L20,20 L30,10 L10,10 Z'; // Note: Last point (10,10) matches first point + Z
      // Should still reverse correctly and maintain Z
      const expected = 'M10 10L30 10L20 20L10 10z';
      expect(new SVGPathData(input).reverse().encode()).toEqual(expected);
    });

    test('path closed only implicitly (without Z command)', () => {
      const input = 'M10,10 L20,20 L30,10 L10,10'; // Note: Last point matches first point, but no Z
      // Should still reverse correctly and maintain implicit closure
      const expected = 'M10 10L30 10L20 20L10 10';
      expect(new SVGPathData(input).reverse().encode()).toEqual(expected);
    });
  });

  describe('Invalid', () => {
    test('throw on relative commands', () => {
      const input = 'm10,10 l10,10 l10,-10';
      expect(() => new SVGPathData(input).reverse().encode()).toThrow(
        'Relative command are not supported convert first with `abs()`',
      );
    });

    test('throw on quadratic bezier curve', () => {
      const input = 'M10,10 Q25,25 40,10';
      expect(() => new SVGPathData(input).reverse().encode()).toThrow(
        'Curve commands are not supported, convert them first',
      );
    });

    test('throw on smooth cubic bezier curve (S)', () => {
      const input = 'M10,10 S25,25 40,10';
      expect(() => new SVGPathData(input).reverse().encode()).toThrow(
        'Curve commands are not supported, convert them first',
      );
    });

    test('throw on smooth quadratic bezier curve (T)', () => {
      const input = 'M10,10 T40,10';
      expect(() => new SVGPathData(input).reverse().encode()).toThrow(
        'Curve commands are not supported, convert them first',
      );
    });

    test('throw on arc commands (A)', () => {
      const input = 'M10,10 A5,5 0 0 1 20,20';
      expect(() => new SVGPathData(input).reverse().encode()).toThrow(
        'Curve commands are not supported, convert them first',
      );
    });
  });
});
