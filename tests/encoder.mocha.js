'use strict';

let assert = (
    global && global.chai ?
    global.chai.assert :
    require('chai').assert
  ),
  SVGPathData = (
    global && global.SVGPathData ?
    global.SVGPathData :
    require(`${__dirname}/../src/SVGPathData.js`)
  )

  ;

describe('SVGPathDataEncoder', () => {

  it('should still work when the new operator is forgotten', () => {
    assert.doesNotThrow(() => {
      new SVGPathData.Encoder();
    });
  });

  it('should fail when a bad command is given', () => {
    assert.throws(() => {
      const encoder = new SVGPathData.Encoder();

      encoder.write({
        type: 'plop',
        x: 0,
        y: 0,
      });
    }, 'Unexpected command type "plop" at index 0.');
  });

});
