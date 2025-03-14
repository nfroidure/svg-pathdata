import { describe, test, expect } from '@jest/globals';
import { SVGPathData } from '../index.js';

describe('SVGPathDataParser', () => {
  test('should fail when a bad command is given', () => {
    expect(() => SVGPathData.parse('b80,20')).toThrow(
      new Error('Unexpected character "b" at index 0.'),
    );
  });
});
