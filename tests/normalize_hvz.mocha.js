/* eslint max-len:0 */
'use strict';

const assert = require('chai').assert;
const { SVGPathData } = require('..');

describe('HVZA normalization', () => {

  // currently z/Z is always absolute
  it('should transform relative h v z', () => {
    assert.equal(new SVGPathData(
      'm 10 10 h 100 v 100 z'
    ).normalizeHVZ().encode(),
    new SVGPathData('m 10 10 l 100 0 l 0 100 L 10 10').encode());
  });

  it('should transform absolute h v z', () => {
    assert.equal(new SVGPathData(
      'M 10 10 H 100 V 100 Z'
    ).normalizeHVZ().encode(),
    new SVGPathData('M 10 10 L 100 10 L 100 100 L 10 10').encode());
  });

  it('should transform degenerate arcs', () => {
    assert.equal(new SVGPathData(
      'M 10 10 A 0 10 0 0 0 100 100 a 20 0 0 0 0 20 0'
    ).normalizeHVZ().encode(),
    new SVGPathData('M 10 10 L 100 100 l 20 0').encode());
  });
});
