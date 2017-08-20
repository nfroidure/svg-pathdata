/* eslint max-len:0 */
'use strict';

const assert = require('chai').assert;
const { SVGPathData } = require('..');

describe('Matrix transformation should be the same than it\'s equivalent transformation', () => {

  it('should fail with bad args', () => {
    assert.throws(() => {
      new SVGPathData(
        'm20,30l10,10z'
      ).matrix().encode();
    }, Error);
    assert.throws(() => {
      new SVGPathData(
        'm20,30l10,10z'
      ).matrix(1).encode();
    }, Error);
    assert.throws(() => {
      new SVGPathData(
        'm20,30l10,10z'
      ).matrix(1, 1).encode();
    }, Error);
    assert.throws(() => {
      new SVGPathData(
        'm20,30l10,10z'
      ).matrix(1, 1, 1).encode();
    }, Error);
    assert.throws(() => {
      new SVGPathData(
        'm20,30l10,10z'
      ).matrix(1, 1, 1, 1).encode();
    }, Error);
    assert.throws(() => {
      new SVGPathData(
        'm20,30l10,10z'
      ).matrix(1, 1, 1, 1, 1).encode();
    }, Error);
  });

  it('for scale', () => {
    assert.equal(
      new SVGPathData('m20 30c0 0 10 20 15 30z').scale(10, 10).encode(),
      new SVGPathData('m20 30c0 0 10 20 15 30z').matrix(10, 0, 0, 10, 0, 0).encode()
    );
  });

});
