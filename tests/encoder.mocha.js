/* eslint max-len:0 */
'use strict';

const assert = require('chai').assert;
const { encodeSVGPath, SVGPathDataEncoder } = require('..');

describe('SVGPathDataEncoder', () => {

  it('should not work when the command is forgotten', () => {
    assert.throws(() => {
      new SVGPathDataEncoder();
    });
  });

  it('should fail when a bad command is given', () => {
    assert.throws(() => {
      encodeSVGPath({
        type: 'plop',
        x: 0,
        y: 0,
      });
    }, 'Unexpected command type "plop" at index 0.');
  });

});
