import { describe, test, expect } from '@jest/globals';
import { SVGPathData } from '../index.js';

describe('Reverse paths', () => {
  describe('Valid', () => {
    test('empty path', () => {
      const input = '';
      const expected = '';
      expect(new SVGPathData(input).reverse().encode()).toEqual(expected);
    });

    test('single point path', () => {
      const input = 'M10,10';
      // A single point path results in just a move command
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

    test('path with cubic bezier curve as second command', () => {
      const input = 'M10,10 C20,20 30,30 40,10';
      const expected = 'M40 10C30 30 20 20 10 10';
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

    test('complex mixed path with multiple command types', () => {
      const input = 'M10,10 H30 V30 L40,40 C50,50 60,40 70,30 H80 V20 Z';
      const expected = 'M80 20V30H70C60 40 50 50 40 40L30 30V10H10z';
      expect(new SVGPathData(input).reverse().encode()).toEqual(expected);
    });

    test('bezier curve with high precision coordinates', () => {
      const input =
        'M10.123456789,10.987654321 C20.111222333,20.444555666 40.777888999,20.111222333 50.555666777,10.333222111';
      const expected =
        'M50.555666777 10.333222111C40.777888999 20.111222333 20.111222333 20.444555666 10.123456789 10.987654321';
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

    test('throw on path with multiple Z commands', () => {
      const input = 'M10,10 L20,20 Z M30,30 L40,40 Z';
      expect(() => new SVGPathData(input).reverse().encode()).toThrow(
        'Multiple close path commands are not supported',
      );
    });
  });
});
