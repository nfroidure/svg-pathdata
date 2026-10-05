import { describe, test, expect } from '@jest/globals';
import { SVGPathData, SVGPathDataTransformer } from '../index.js';

function testEvenoddToNonzero(input: string): string {
  return new SVGPathData(input).evenoddToNonzero().encode();
}

describe('Reorienting evenodd subpaths for the nonzero rule', () => {
  test('empty path', () => {
    expect(testEvenoddToNonzero('')).toEqual('');
  });

  test('single subpath', () => {
    const input = 'M0 0H10V10H0Z';
    expect(testEvenoddToNonzero(input)).toEqual(
      new SVGPathData(input).encode(),
    );
  });

  test('hole drawn in the same direction as its outline', () => {
    expect(testEvenoddToNonzero('M0 0H20V20H0Z M5 5H15V15H5Z')).toEqual(
      'M0 0H20V20H0zM5 15H15V5H5z',
    );
  });

  test('hole already drawn against its outline', () => {
    const input = 'M0 0H20V20H0Z M5 5V15H15V5Z';
    expect(testEvenoddToNonzero(input)).toEqual(
      new SVGPathData(input).encode(),
    );
  });

  test('island inside a hole winds with the outline', () => {
    expect(
      testEvenoddToNonzero('M0 0H30V30H0Z M5 5H25V25H5Z M10 10H20V20H10Z'),
    ).toEqual('M0 0H30V30H0zM5 25H25V5H5zM10 10H20V20H10z');
  });

  test('nested subpaths listed from the inside out', () => {
    expect(
      testEvenoddToNonzero('M10 10H20V20H10Z M5 5H25V25H5Z M0 0H30V30H0Z'),
    ).toEqual('M10 10H20V20H10zM5 25H25V5H5zM0 0H30V30H0z');
  });

  test('separate outlines keep their own directions', () => {
    const input = 'M0 0H10V10H0Z M20 0V10H30V0Z';
    expect(testEvenoddToNonzero(input)).toEqual(
      new SVGPathData(input).encode(),
    );
  });

  test('curved hole is reversed along the same curve', () => {
    expect(
      testEvenoddToNonzero(
        'M0 0H40V40H0Z M10 20C10 14.477 14.477 10 20 10C25.523 10 30 14.477 30 20C30 25.523 25.523 30 20 30C14.477 30 10 25.523 10 20Z',
      ),
    ).toEqual(
      'M0 0H40V40H0zM10 20C10 25.523 14.477 30 20 30C25.523 30 30 25.523 30 20C30 14.477 25.523 10 20 10C14.477 10 10 14.477 10 20z',
    );
  });

  test('quadratic hole is reversed as a cubic curve', () => {
    expect(testEvenoddToNonzero('M0 0H30V30H0Z M6 6Q15 6 15 15L6 15Z')).toEqual(
      'M0 0H30V30H0zM6 15L15 15C15 9 12 6 6 6z',
    );
  });

  test('relative hole is reversed in absolute commands', () => {
    expect(testEvenoddToNonzero('m0 0h20v20h-20z m5 5h10v10h-10z')).toEqual(
      'M0 0H20V20H0zM5 15H15V5H5z',
    );
  });

  test('relative and curved subpaths that need no reversal are kept as written', () => {
    const input = 'm0 0h30v30h-30z m6 6v9h9q0 -9 -9 -9z';
    expect(testEvenoddToNonzero(input)).toEqual(
      new SVGPathData(input).encode(),
    );
  });

  test('open subpaths are reoriented like closed ones', () => {
    expect(testEvenoddToNonzero('M0 0H20V20H0 M5 5H15V15H5')).toEqual(
      'M0 0H20V20H0M5 15H15V5H5',
    );
  });

  test('subpath drawn after a closepath without a moveto', () => {
    expect(
      testEvenoddToNonzero('M10 10H20V20H10Z L0 0H30V30H0L0 0L10 10Z'),
    ).toEqual('M10 20H20V10H10zM10 10L0 0H30V30H0L0 0L10 10z');
  });

  test('subpath drawn twice cancels out', () => {
    expect(testEvenoddToNonzero('M0 0H10V10H0Z M0 0H10V10H0Z')).toEqual(
      'M0 0H10V10H0zM0 10H10V0H0z',
    );
  });

  test('subpath drawn twice in opposite directions is kept as written', () => {
    const input = 'M0 0H10V10H0Z M0 0V10H10V0Z';
    expect(testEvenoddToNonzero(input)).toEqual(
      new SVGPathData(input).encode(),
    );
  });

  test('subpath drawn three times alternates in drawing order', () => {
    expect(
      testEvenoddToNonzero('M0 0H10V10H0Z M0 0H10V10H0Z M0 0H10V10H0Z'),
    ).toEqual('M0 0H10V10H0zM0 10H10V0H0zM0 0H10V10H0z');
  });

  test('holes touching their outline on every side wind against it', () => {
    expect(
      testEvenoddToNonzero(
        'M0 0H30V30H0Z M12 0H18V8H12Z M22 12H30V18H22Z M12 22H18V30H12Z M0 12H8V18H0Z',
      ),
    ).toEqual(
      'M0 0H30V30H0zM12 8H18V0H12zM22 18H30V12H22zM12 30H18V22H12zM0 18H8V12H0z',
    );
  });

  test('subpath touching another from outside is not nested in it', () => {
    expect(
      testEvenoddToNonzero('M0 0H30V30H0Z M15 5H25V25H15Z M15 8V22L5 15Z'),
    ).toEqual('M0 0H30V30H0zM15 25H25V5H15zM5 15L15 22V8z');
  });

  test('crossing subpath mostly outside the other keeps its direction', () => {
    const input = 'M0 0H20V20H0Z M10 10H40V40H10Z';
    expect(testEvenoddToNonzero(input)).toEqual(
      new SVGPathData(input).encode(),
    );
  });

  test('crossing subpath mostly inside the other winds against it', () => {
    expect(testEvenoddToNonzero('M0 0H20V20H0Z M5 5L15 5L15 15L5 25Z')).toEqual(
      'M0 0H20V20H0zM5 25L15 15L15 5L5 5z',
    );
  });

  test('applying it again changes nothing', () => {
    const once = testEvenoddToNonzero(
      'M0 0H30V30H0Z M5 5H25V25H5Z M10 10H20V20H10Z M40 0H70V30H40Z M46 6Q55 6 55 15L46 15Z',
    );
    expect(testEvenoddToNonzero(once)).toEqual(once);
  });

  test('does not modify the commands it is given', () => {
    const commands = new SVGPathData('m0 0h30v30h-30z m6 6q9 0 9 9l-9 0z')
      .commands;
    const before = SVGPathData.encode(commands);

    SVGPathDataTransformer.EVENODD_TO_NONZERO(commands);

    expect(SVGPathData.encode(commands)).toEqual(before);
  });
});
