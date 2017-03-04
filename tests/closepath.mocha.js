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

describe('Parsing close path commands', () => {

  it('should work', () => {
    const commands = new SVGPathData('Z').commands;

    assert.equal(commands[0].type, SVGPathData.CLOSE_PATH);
  });

  it('should work with spaces before', () => {
    const commands = new SVGPathData('   Z').commands;

    assert.equal(commands[0].type, SVGPathData.CLOSE_PATH);
  });

  it('should work with spaces after', () => {
    const commands = new SVGPathData('Z    ').commands;

    assert.equal(commands[0].type, SVGPathData.CLOSE_PATH);
  });

  it('should work before a command sequence', () => {
    const commands = new SVGPathData(' Z M10,10 L10,10, H10, V10').commands;

    assert.equal(commands[0].type, SVGPathData.CLOSE_PATH);
  });

  it('should work after a command sequence', () => {
    const commands = new SVGPathData('M10,10 L10,10, H10, V10 Z').commands;

    assert.equal(commands[4].type, SVGPathData.CLOSE_PATH);
  });

  it('should work in a command sequence', () => {
    const commands = new SVGPathData('M10,10 L10,10, H10, V10 Z M10,10 L10,10, H10, V10').commands;

    assert.equal(commands[4].type, SVGPathData.CLOSE_PATH);
  });

});

describe('Encoding close path commands', () => {

  it('should work with one command', () => {
    assert.equal(
        new SVGPathData('z').encode(),
        'z'
      );
  });

  it('should work with several commands', () => {
    assert.equal(
        new SVGPathData('zzzz').encode(),
        'zzzz'
      );
  });

});
