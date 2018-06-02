/* eslint max-len:0 */
'use strict';

const assert = require('chai').assert;
const { SVGPathData } = require('..');

describe('SVGPathDataParser', () => {
  it('should fail when a bad command is given', () => {
    assert.throws(() => {
      SVGPathData.parse('b80,20');
    }, 'Unexpected character "b" at index 0.');
  });

});
