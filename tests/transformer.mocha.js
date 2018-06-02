/* eslint-disable new-cap */
/* eslint max-len:0 */
'use strict';

const assert = require('chai').assert;
const { SVGPathData, SVGPathDataParser } = require('..');

describe('SVGPathDataTransformer', () => {

  it('should be possible to transform the parser', () => {
    const parser = new SVGPathDataParser().toAbs();

    assert.equal(SVGPathData.encode(parser.parse('m 0')), '');
    assert.equal(SVGPathData.encode(parser.parse(' 0 l')), 'M0 0');
    assert.equal(SVGPathData.encode(parser.parse('2 3')), '');
    assert.equal(SVGPathData.encode(parser.finish()), 'L2 3');
  });

});
