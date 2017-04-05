/* eslint max-len:0 */
'use strict';

const assert = require('chai').assert;
const SVGPathData = require('../src/SVGPathData.js');

describe('qt to c', () => {

  it('absolute Q and T commands should be converted', () => {
    assert.equal(new SVGPathData(`M0 0
    Q0,9 9,9
    T9,18`).qtToC().encode(),
      new SVGPathData(`M0 0
    C0,3 6,9 9,9
    C12,9 12,15 9,18`).encode());
  });

  it('relative Q and T commands should be converted', () => {
    assert.equal(new SVGPathData(`M9 18
    q0,9 9,9
    t9,18`).qtToC().encode(),
      new SVGPathData(`M9 18
    c0,3 6,9 9,9
    c3,0 9,12 9,18`).encode());
  });

});
