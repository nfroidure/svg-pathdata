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

describe('SVGPathDataParser', () => {

  it('should still work when the new operator is forgotten', () => {
    assert.doesNotThrow(() => {
      SVGPathData.Parser();
    });
  });

  it('should fail when a bad command is given', () => {
    assert.throws(() => {
      const parser = new SVGPathData.Parser();

      parser.write('b80,20');
      parser.end();
    }, 'Unexpected character "b" at index 0.');
  });

});
