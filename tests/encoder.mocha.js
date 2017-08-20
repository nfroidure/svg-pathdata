/* eslint max-len:0 */
'use strict';

const assert = require('chai').assert;
const { SVGPathDataEncoder } = require('..');

describe('SVGPathDataEncoder', () => {

  it('should still work when the new operator is forgotten', () => {
    assert.doesNotThrow(() => {
      new SVGPathDataEncoder();
    });
  });

  it('should fail when a bad command is given', () => {
    assert.throws(() => {
      const encoder = new SVGPathDataEncoder();

      encoder.write({
        type: 'plop',
        x: 0,
        y: 0,
      });
    }, 'Unexpected command type "plop" at index 0.');
  });

});
