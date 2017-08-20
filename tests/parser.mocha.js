/* eslint max-len:0 */
'use strict';

const assert = require('chai').assert;
const { SVGPathDataParser } = require('..');

describe('SVGPathDataParser', () => {

  it('should still work when the new operator is forgotten', () => {
    assert.doesNotThrow(() => {
      new SVGPathDataParser();
    });
  });

  it('should fail when a bad command is given', () => {
    assert.throws(() => {
      const parser = new SVGPathDataParser();

      parser.write('b80,20');
      parser.end();
    }, 'Unexpected character "b" at index 0.');
  });

});
