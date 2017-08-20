/* eslint max-len:0 */
'use strict';

const assert = require('chai').assert;
const { SVGPathData } = require('..');

describe('Positive rotate from the origin', () => {

  it('should fail with no args', () => {
    assert.throws(() => {
      new SVGPathData(
        'm20,30l10,10z'
      ).rotate().encode();
    }, Error);
  });

  it('should work with relative horizontal path', () => {
    assert.equal(new SVGPathData(
      'm10 0l60 0z'
    ).rotate(Math.PI).round(6).encode(),
    'm-10 0l-60 0z');
  });

  it('should work with relative vertical path', () => {
    assert.equal(new SVGPathData(
      'm0 10l0 60z'
    ).rotate(Math.PI).round(6).encode(),
    'm0 -10l0 -60z');
  });

  it('should work with relative path', () => {
    assert.equal(new SVGPathData(
      'm75 100l0 -50z'
    ).rotate(Math.PI).round(6).encode(),
    'm-75 -100l0 50z');
  });

  it('should work with absolute path', () => {
    assert.equal(new SVGPathData(
      'M75,100L75,50z'
    ).rotate(Math.PI).round(6).encode(),
    'M-75 -100L-75 -50z');
  });

});

describe('Positive rotate', () => {

  it('should work with relative path (Math.PI)', () => {
    assert.equal(new SVGPathData(
      'm100 100l100 100z'
    ).rotate(Math.PI, 150, 150).round(6).encode(),
    'm200 200l-100 -100z');
  });

  it('should work with relative path (Math.PI/2)', () => {
    assert.equal(new SVGPathData(
      'm100 100l100 100z'
    ).rotate(Math.PI / 2, 150, 150).round(6).encode(),
    'm200 100l-100 100z');
  });

  it('should work with relative path', () => {
    assert.equal(new SVGPathData(
      'm75 100l0 -50z'
    ).rotate(Math.PI, 75, 75).round(6).encode(),
    'm75 50l0 50z');
  });

  it('should work with absolute path', () => {
    assert.equal(new SVGPathData(
      'M75,100L75,50z'
    ).rotate(Math.PI, 75, 75).round(6).encode(),
    'M75 50L75 100z');
  });

});

describe('360° Positive rotate', () => {

  it('should work with relative path', () => {
    assert.equal(new SVGPathData(
      'm100 75l-50 -45l0 90z'
    ).rotate(2 * Math.PI, 75, 75).round(6).encode(),
    'm100 75l-50 -45l0 90z');
  });

  it('should work with absolute path', () => {
    assert.equal(new SVGPathData(
      'M 100,75L50,30L50,120 z'
    ).rotate(2 * Math.PI, 75, 75).round(6).encode(),
    'M100 75L50 30L50 120z');
  });

});
