/* eslint max-len:0 */
'use strict';

const assert = require('chai').assert;
const { SVGPathData } = require('..');

describe('Positive scale', () => {

  it('should fail with no args', () => {
    assert.throws(() => {
      new SVGPathData(
        'm20,30l10,10z'
      ).scale().encode();
    }, Error);
  });

  it('should work with relative path', () => {
    assert.equal(new SVGPathData(
      'm20 30c0 0 10 20 15 30z'
    ).scale(10, 10).encode(),
    'm200 300c0 0 100 200 150 300z');
  });

  it('should work with absolute path', () => {
    assert.equal(new SVGPathData(
      'M20 30C0 0 10 20 15 30z'
    ).scale(10, 10).encode(),
    'M200 300C0 0 100 200 150 300z');
  });

});
