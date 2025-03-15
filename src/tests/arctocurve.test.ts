import { describe, test, expect } from 'vitest';
import { SVGPathData } from '../index.js';

// Sample pathes from MDN
// https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
// Here we have to round output before testing since there is some lil
// differences across browsers.

function testArcToCurve(input: string) {
  const data = new SVGPathData(input).aToC();
  return data.round().encode();
}

describe('Converting elliptical arc commands to curves', () => {
  test('should work sweepFlag on 0 and largeArcFlag on 0', () => {
    expect(
      testArcToCurve('M80 80 A 45 45, 0, 0, 0, 125 125 L 125 80 Z'),
    ).toEqual(
      'M80 80C80 104.8528137423857 100.1471862576143 125 125 125L125 80z',
    );
  });

  test('should work sweepFlag on 1 and largeArcFlag on 0', () => {
    expect(
      testArcToCurve('M230 80 A 45 45, 0, 1, 0, 275 125 L 275 80 Z'),
    ).toEqual(
      'M230 80C205.1471862576143 80 185 100.1471862576143 185 125C185 149.8528137423857 205.1471862576143 170 230 170C254.8528137423857 170 275 149.8528137423857 275 125L275 80z',
    );
  });

  test('should work sweepFlag on 0 and largeArcFlag on 1', () => {
    expect(
      testArcToCurve('M80 230 A 45 45, 0, 0, 1, 125 275 L 125 230 Z'),
    ).toEqual(
      'M80 230C104.8528137423857 230 125 250.1471862576143 125 275L125 230z',
    );
  });

  test('should work sweepFlag on 1 and largeArcFlag on 1', () => {
    expect(
      testArcToCurve('M230 230 A 45 45, 0, 1, 1, 275 275 L 275 230 Z'),
    ).toEqual(
      'M230 230C230 205.1471862576143 250.1471862576143 185 275 185C299.8528137423857 185 320 205.1471862576143 320 230C320 254.8528137423857 299.8528137423857 275 275 275L275 230z',
    );
  });

  test('should work sweepFlag on 0 and largeArcFlag on 0 with relative arc', () => {
    expect(
      testArcToCurve('M80 80 a 45 45, 0, 0, 0, 125 125 L 125 80 Z'),
    ).toEqual(
      'M80 80c-34.5177968644246 34.5177968644246 -34.5177968644246 90.4822031355754 0 125c34.5177968644246 34.5177968644246 90.4822031355754 34.5177968644246 125 0L125 80z',
    );
  });

  test('should handle zero radius arcs by converting to lines', () => {
    // Zero y-radius
    expect(testArcToCurve('M0 0A80 0 0 0 0 125 125')).toEqual(
      'M0 0C41.6666666666667 41.6666666666667 83.3333333333333 83.3333333333333 125 125',
    );

    // Zero x-radius
    expect(testArcToCurve('M0 0A0 80 0 0 0 125 125')).toEqual(
      'M0 0C41.6666666666667 41.6666666666667 83.3333333333333 83.3333333333333 125 125',
    );

    // Both x and y radius zero
    expect(testArcToCurve('M0 0A0 0 0 0 0 125 125')).toEqual(
      'M0 0C41.6666666666667 41.6666666666667 83.3333333333333 83.3333333333333 125 125',
    );
  });

  test('should convert to correct arc', () => {
    expect(testArcToCurve('M 30 30 A 30 30 90 0 0 30 80 Z')).toEqual(
      'M30 30C21.6206442862417 35.5582357774914 16.583123951777 44.9447731434901 16.583123951777 55C16.583123951777 65.0552268565099 21.6206442862417 74.4417642225086 30 80z',
    );
  });

  test('should correctly handle rotated arcs', () => {
    // 45 degree rotation
    expect(testArcToCurve('M 50 50 A 30 15 45 0 1 100 100')).toEqual(
      'M50 50C56.9035593728849 43.0964406271151 73.6928812542302 48.6928812542302 87.5 62.5C101.3071187457698 76.3071187457698 106.9035593728849 93.0964406271151 100 100',
    );

    // 90 degree rotation
    expect(testArcToCurve('M 30 30 A 30 15 90 0 1 80 80')).toEqual(
      'M30 30C36.9035593728849 2.3857625084603 53.6928812542302 -8.8071187457698 67.5 5C81.3071187457698 18.8071187457698 86.9035593728849 52.3857625084603 80 80',
    );

    // 180 degree rotation (equivalent to flipping x and y radii)
    expect(testArcToCurve('M 30 30 A 30 15 180 0 1 80 80')).toEqual(
      'M30 30C57.6142374125551 23.0964408852183 91.1928806985313 28.6928815616988 104.999999309466 42.5000001726335C118.8071179204008 56.3071187835682 107.6142370311837 73.096440503847 80 80',
    );
  });

  test('should handle different radius combinations', () => {
    // Very different radius values
    expect(testArcToCurve('M 50 50 A 50 10 0 0 1 100 60')).toEqual(
      'M50 50C77.6142374915397 50 100 54.4771525016921 100 60',
    );

    // Equal radius values (circle)
    expect(testArcToCurve('M 50 50 A 30 30 0 0 1 100 80')).toEqual(
      'M50 50C59.7206056797015 40.1416040718891 74.9250308199694 38.2155183741452 86.7968382872808 45.338602854532C98.6686457545922 52.4616873349189 104.1241819696502 66.7837498458583 100 80',
    );
  });

  test('should handle full and nearly-full ellipses', () => {
    // Nearly full ellipse with large-arc flag
    expect(testArcToCurve('M 100 50 A 50 30 0 1 1 99 50')).toEqual(
      'M100 50C127.5152793990511 50.1650999315973 149.636959976665 63.6387150592171 149.4993749804677 80.1485018375802C149.3617899842705 96.6582886159432 127.0166552662119 109.9984999624981 99.5 109.9984999624981C71.9833447337882 109.9984999624981 49.6382100157296 96.6582886159433 49.5006250195323 80.1485018375802C49.363040023335 63.6387150592171 71.4847206009489 50.1650999315973 99 50',
    );

    // Arc crossing coordinate axes
    expect(testArcToCurve('M 0 0 A 50 50 0 0 1 100 0')).toEqual(
      'M0 0C0 -27.6142374915397 22.3857625084603 -50 50 -50C77.6142374915397 -50 100 -27.6142374915397 100 0',
    );
  });

  test('should correctly handle special cases with precise angles', () => {
    // Vertical line with 90 degree rotation
    expect(testArcToCurve('M 30 30 A 30 30 90 0 0 30 80')).toEqual(
      'M30 30C21.6206442862417 35.5582357774914 16.583123951777 44.9447731434901 16.583123951777 55C16.583123951777 65.0552268565099 21.6206442862417 74.4417642225086 30 80',
    );

    // Same vertical line but in opposite direction (sweepFlag changed from 0 to 1)
    expect(testArcToCurve('M 30 30 A 30 30 90 0 1 30 80')).toEqual(
      'M30 30C38.3793557137583 35.5582357774914 43.416876048223 44.9447731434901 43.416876048223 55C43.416876048223 65.0552268565099 38.3793557137583 74.4417642225086 30 80',
    );

    // 90 degree arc segment
    expect(testArcToCurve('M 50 50 A 30 30 0 0 1 80 80')).toEqual(
      'M50 50C66.5685424949238 50 80 63.4314575050762 80 80',
    );
  });

  test('should handle extreme values correctly', () => {
    // Very small but non-zero radius
    expect(testArcToCurve('M 50 50 A 0.1 0.1 0 0 1 51 51')).toEqual(
      'M50 50C50.2761423749154 49.7238576250846 50.7238576250846 49.7238576250846 51 50C51.2761423749154 50.2761423749154 51.2761423749154 50.7238576250846 51 51',
    );

    // Very large radius
    expect(testArcToCurve('M 0 0 A 1000 1000 0 0 1 10 10')).toEqual(
      'M0 0C3.3568621862997 3.3097211449502 6.6902788550498 6.6431378137003 10 10',
    );
  });
});
