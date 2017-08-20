/* eslint max-len:0 */
'use strict';

const assert = require('chai').assert;
const { SVGPathData } = require('..');

describe('normalization of curves', () => {

  it('should ignore everything which isn\'t S s T t', () => {
    assert.equal(new SVGPathData(
      'm20,30c0 0 10 20 15 30q10 20 15 30h10v10a10 10 5 1 0 10 10z'
    ).normalizeST().encode(),
    new SVGPathData('m20,30c0 0 10 20 15 30q10 20 15 30h10v10a10 10 5 1 0 10 10z').encode());
  });

  it('should take the previous point as the curve parameter if the previous curve isn\'t of the same type', () => {
    assert.equal(new SVGPathData(
      'M 10 10 h 100 s 10 20 15 30 t 20 15'
    ).normalizeST().encode(),
    new SVGPathData('M 10 10 h 100 c 0 0 10 20 15 30 q 0 0 20 15').encode());
  });

  it('should mirror the previous control point', () => {
    assert.equal(new SVGPathData(
      'M 10 10 s 10 20 15 30 S 90 80 100 100'
    ).normalizeST().encode(),
    new SVGPathData('M 10 10 c 0 0 10 20 15 30 C 30 50 90 80 100 100').encode());
  });
});
