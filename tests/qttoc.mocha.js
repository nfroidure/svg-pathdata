/* eslint max-len:0 */
'use strict';

const assert = require('chai').assert;
const SVGPathData = require('../src/SVGPathData.js');

describe('qt to c', () => {

  it('absolute Q and T commands should be converted', () => {
    assert.equal(
      new SVGPathData(`
        M0 0
        Q0,10 10,10
        T10,20
      `).qtToC().encode(),
      new SVGPathData(`
        M0 0
        C0,10 0,10 10,10
        C20,10 20,10 10,20
      `).encode()
    );
  });

  it('relative Q and T commands should be converted', () => {
    assert.equal(
      new SVGPathData(`
        M10 20
        q0,10 10,10
        t10,20
      `).qtToC().encode(),
      new SVGPathData(`
        M10 20
        c0,10 0,10 10,10
        c10,0 10,0 10,20
      `).encode()
    );
  });
});
