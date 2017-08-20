/* eslint max-len:0 */
'use strict';

const assert = require('chai').assert;
const { SVGPathData } = require('..');

describe('Parsing line to commands', () => {

  it('should not work with single coordinate', () => {
    assert.throw(() => {
      new SVGPathData('L100');
    }, SyntaxError, 'Unterminated command at the path end.');
  });

  it('should not work with single complexer coordinate', () => {
    assert.throw(() => {
      new SVGPathData('l-10e-5');
    }, SyntaxError, 'Unterminated command at the path end.');
  });

  it('should work with single coordinate followed by another', () => {
    assert.throw(() => {
      new SVGPathData('l-10l10 10');
    }, SyntaxError, 'Unterminated command at index 4.');
  });

  it('should work with comma separated coordinates', () => {
    const commands = new SVGPathData('L100,100').commands;

    assert.equal(commands[0].type, SVGPathData.LINE_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, '100');
    assert.equal(commands[0].y, '100');
  });

  it('should work with space separated coordinates', () => {
    const commands = new SVGPathData('l100 \t   100').commands;

    assert.equal(commands[0].type, SVGPathData.LINE_TO);
    assert.equal(commands[0].relative, true);
    assert.equal(commands[0].x, '100');
    assert.equal(commands[0].y, '100');
  });

  it('should work with complexer coordinates', () => {
    const commands = new SVGPathData('l-10e-5 -10e-5').commands;

    assert.equal(commands[0].type, SVGPathData.LINE_TO);
    assert.equal(commands[0].relative, true);
    assert.equal(commands[0].x, '-10e-5');
    assert.equal(commands[0].y, '-10e-5');
  });

  it('should work with single even more complexer coordinates', () => {
    const commands = new SVGPathData('L-10.0032e-5 -10.0032e-5').commands;

    assert.equal(commands[0].type, SVGPathData.LINE_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, '-10.0032e-5');
    assert.equal(commands[0].y, '-10.0032e-5');
  });

  it('should work with comma separated coordinate pairs', () => {
    const commands = new SVGPathData('L123,456 7890,9876').commands;

    assert.equal(commands[0].type, SVGPathData.LINE_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, '123');
    assert.equal(commands[0].y, '456');
    assert.equal(commands[1].type, SVGPathData.LINE_TO);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].x, '7890');
    assert.equal(commands[1].y, '9876');
  });

  it('should work with space separated coordinate pairs', () => {
    const commands = new SVGPathData('l123  \t 456  \n 7890  \r 9876').commands;

    assert.equal(commands[0].type, SVGPathData.LINE_TO);
    assert.equal(commands[0].relative, true);
    assert.equal(commands[0].x, '123');
    assert.equal(commands[0].y, '456');
    assert.equal(commands[1].type, SVGPathData.LINE_TO);
    assert.equal(commands[1].relative, true);
    assert.equal(commands[1].x, '7890');
    assert.equal(commands[1].y, '9876');
  });

  it('should work with nested separated coordinates', () => {
    const commands = new SVGPathData('L123 ,  456  \t,\n7890 \r\n 9876').commands;

    assert.equal(commands[0].type, SVGPathData.LINE_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, '123');
    assert.equal(commands[0].y, '456');
    assert.equal(commands[1].type, SVGPathData.LINE_TO);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].x, '7890');
    assert.equal(commands[1].y, '9876');
  });

  it('should work with multiple command declarations', () => {
    const commands = new SVGPathData(`
      L123 ,  456  \t,\n7890 \r\n 9876l123 ,
       456  \t,\n7890 \r\n 9876
    `).commands;

    assert.equal(commands[0].type, SVGPathData.LINE_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, '123');
    assert.equal(commands[0].y, '456');
    assert.equal(commands[1].type, SVGPathData.LINE_TO);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].x, '7890');
    assert.equal(commands[1].y, '9876');
    assert.equal(commands[2].type, SVGPathData.LINE_TO);
    assert.equal(commands[2].relative, true);
    assert.equal(commands[2].x, '123');
    assert.equal(commands[2].y, '456');
    assert.equal(commands[3].type, SVGPathData.LINE_TO);
    assert.equal(commands[3].relative, true);
    assert.equal(commands[3].x, '7890');
    assert.equal(commands[3].y, '9876');
  });

});

describe('Encoding line to commands', () => {

  it('should work with one command', () => {
    assert.equal(
      new SVGPathData('L-0.000500032 -0.000600032').encode(),
      'L-0.000500032 -0.000600032'
    );
  });

  it('should work with several commands', () => {
    assert.equal(
      new SVGPathData('L-50.0032e-5 -60.0032e-5L-50.0032e-5 -60.0032e-5L-50.0032e-5 -60.0032e-5').encode(),
      'L-0.000500032 -0.000600032L-0.000500032 -0.000600032L-0.000500032 -0.000600032'
    );
  });

});
