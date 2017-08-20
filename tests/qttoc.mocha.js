/* eslint max-len:0 */
'use strict';

const assert = require('chai').assert;
const { SVGPathData } = require('..');

describe('qt to c', () => {

  it('absolute Q and T commands should be converted', () => {
    assert.equal(new SVGPathData(`M0 0
    Q0,9 9,9
    T9,18`).qtToC().encode(),
    new SVGPathData(`M0 0
    C0,6 3,9 9,9
    C15,9 15,12 9,18`).encode());
  });

  it('relative Q and T commands should be converted', () => {
    assert.equal(new SVGPathData(`M9 18
    q0,9 9,9
    t9,18`).qtToC().encode(),
    new SVGPathData(`M9 18
    c0,6 3,9 9,9
    c6,0 9,6 9,18`).encode());
  });

});
