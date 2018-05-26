/* eslint max-len:0 */
'use strict';

const assert = require('chai').assert;
const { SVGPathDataParser } = require('..');

describe('SVGPathDataParser', () => {

  it('should not work when the command is forgotten', () => {
    assert.throw(() => {
      new SVGPathDataParser();
    });
  });

  it('should fail when a bad command is given', () => {
    assert.throws(() => {
      new SVGPathDataParser('b80,20');
    }, 'Unexpected character "b" at index 0.');
  });

});
