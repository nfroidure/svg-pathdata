/* eslint max-len:0 */
'use strict';

const assert = require('chai').assert;
const SVGPathData = require('../src/SVGPathData.js');

describe('SVGPathDataTransformer', () => {

  it('should fail with bad args', () => {
    assert.throws(() => {
      new SVGPathData.Transformer();
    }, 'Please provide a transform callback to receive commands.');
  });

  it('should fail with bad transform function', () => {
    assert.throws(() => {
      new SVGPathData.Transformer(() => {});
    }, 'Please provide a valid transform (returning a function).');
  });

  it('should still work when the new operator is forgotten', () => {
    assert.doesNotThrow(() => {
      new SVGPathData.Transformer(SVGPathData.Transformer.SCALE, 1, 1);
    });
  });

  it('should work in streaming mode', () => {
    const encoder = new SVGPathData.Transformer(SVGPathData.Transformer.SCALE, 1, 1);

    encoder.write({
      type: SVGPathData.Parser.LINE_TO,
      relative: true,
      x: 10,
      y: 10,
    });
    encoder.end();
  });

});
