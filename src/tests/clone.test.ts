import { describe, test, expect } from '@jest/globals';
import { SVGPathData } from '../index.js';

const PATH = 'm10 10q10 0 10 10t10 10s10 10 20 0a5 5 0 0 1 10 0z';

describe('Cloning path data', () => {
  test('encodes the same path', () => {
    const pathData = new SVGPathData(PATH);

    expect(pathData.clone().encode()).toEqual(pathData.encode());
  });

  test('transforming the clone leaves the original unchanged', () => {
    const pathData = new SVGPathData(PATH);
    const before = pathData.encode();

    pathData.clone().toAbs().normalizeST().qtToC().aToC().translate(5, 5);

    expect(pathData.encode()).toEqual(before);
  });

  test('transforming the original leaves the clone unchanged', () => {
    const pathData = new SVGPathData(PATH);
    const clone = pathData.clone();

    pathData.toAbs().normalizeST().qtToC().aToC().translate(5, 5);

    expect(clone.encode()).toEqual(new SVGPathData(PATH).encode());
  });
});
