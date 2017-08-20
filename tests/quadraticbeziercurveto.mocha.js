/* eslint max-len:0 */
'use strict';

const assert = require('chai').assert;
const { SVGPathData } = require('..');

describe('Parsing quadratic bezier curve to commands', () => {

  it('should not work when badly declared', () => {
    assert.throw(() => {
      new SVGPathData('Q');
    }, SyntaxError, 'Unterminated command at the path end.');
    assert.throw(() => {
      new SVGPathData('Q10');
    }, SyntaxError, 'Unterminated command at the path end.');
    assert.throw(() => {
      new SVGPathData('Q10 10');
    }, SyntaxError, 'Unterminated command at the path end.');
    assert.throw(() => {
      new SVGPathData('Q10 10 10');
    }, SyntaxError, 'Unterminated command at the path end.');
    assert.throw(() => {
      new SVGPathData('Q10 10 10 10 10 10');
    }, SyntaxError, 'Unterminated command at the path end.');
    assert.throw(() => {
      new SVGPathData('Q10 10 10Q10 10 10 10');
    }, SyntaxError, 'Unterminated command at index 9.');
  });

  it('should work with comma separated coordinates', () => {
    const commands = new SVGPathData('Q123,456 789,987').commands;

    assert.equal(commands[0].type, SVGPathData.QUAD_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x1, '123');
    assert.equal(commands[0].y1, '456');
    assert.equal(commands[0].x, '789');
    assert.equal(commands[0].y, '987');
  });

  it('should work with space separated coordinates', () => {
    const commands = new SVGPathData('Q123 456 789 987').commands;

    assert.equal(commands[0].type, SVGPathData.QUAD_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x1, '123');
    assert.equal(commands[0].y1, '456');
    assert.equal(commands[0].x, '789');
    assert.equal(commands[0].y, '987');
  });

  it('should work with nested separated complexer coordinate pairs', () => {
    const commands = new SVGPathData('Q-10.0032e-5,-20.0032e-5 -30.0032e-5,-40.0032e-5').commands;

    assert.equal(commands[0].type, SVGPathData.QUAD_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x1, '-10.0032e-5');
    assert.equal(commands[0].y1, '-20.0032e-5');
    assert.equal(commands[0].x, '-30.0032e-5');
    assert.equal(commands[0].y, '-40.0032e-5');
  });

  it('should work with multiple pairs of coordinates', () => {
    const commands = new SVGPathData(`
      Q-10.0032e-5,-20.0032e-5 -30.0032e-5,-40.0032e-5
        -10.0032e-5,-20.0032e-5 -30.0032e-5,-40.0032e-5
        -10.0032e-5,-20.0032e-5 -30.0032e-5,-40.0032e-5
    `).commands;

    assert.equal(commands[0].type, SVGPathData.QUAD_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x1, '-10.0032e-5');
    assert.equal(commands[0].y1, '-20.0032e-5');
    assert.equal(commands[0].x, '-30.0032e-5');
    assert.equal(commands[0].y, '-40.0032e-5');
    assert.equal(commands[1].type, SVGPathData.QUAD_TO);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].x1, '-10.0032e-5');
    assert.equal(commands[1].y1, '-20.0032e-5');
    assert.equal(commands[1].x, '-30.0032e-5');
    assert.equal(commands[1].y, '-40.0032e-5');
    assert.equal(commands[2].type, SVGPathData.QUAD_TO);
    assert.equal(commands[2].relative, false);
    assert.equal(commands[2].x1, '-10.0032e-5');
    assert.equal(commands[2].y1, '-20.0032e-5');
    assert.equal(commands[2].x, '-30.0032e-5');
    assert.equal(commands[2].y, '-40.0032e-5');
  });

  it('should work with multiple declared pairs of coordinates', () => {
    const commands = new SVGPathData(`
      Q-10.0032e-5,-20.0032e-5 -30.0032e-5,-40.0032e-5
        q-10.0032e-5,-20.0032e-5 -30.0032e-5,-40.0032e-5
      Q-10.0032e-5,-20.0032e-5 -30.0032e-5,-40.0032e-5
    `).commands;

    assert.equal(commands[0].type, SVGPathData.QUAD_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x1, '-10.0032e-5');
    assert.equal(commands[0].y1, '-20.0032e-5');
    assert.equal(commands[0].x, '-30.0032e-5');
    assert.equal(commands[0].y, '-40.0032e-5');
    assert.equal(commands[1].type, SVGPathData.QUAD_TO);
    assert.equal(commands[1].relative, true);
    assert.equal(commands[1].x1, '-10.0032e-5');
    assert.equal(commands[1].y1, '-20.0032e-5');
    assert.equal(commands[1].x, '-30.0032e-5');
    assert.equal(commands[1].y, '-40.0032e-5');
    assert.equal(commands[2].type, SVGPathData.QUAD_TO);
    assert.equal(commands[2].relative, false);
    assert.equal(commands[2].x1, '-10.0032e-5');
    assert.equal(commands[2].y1, '-20.0032e-5');
    assert.equal(commands[2].x, '-30.0032e-5');
    assert.equal(commands[2].y, '-40.0032e-5');
  });

});

describe('Encoding line to commands', () => {

  it('should work with one command', () => {
    assert.equal(
      new SVGPathData('Q-10.0032e-5 -20.0032e-5 -30.0032e-5 -40.0032e-5').encode(),
      'Q-0.000100032 -0.000200032 -0.000300032 -0.000400032'
    );
  });

  it('should work with several commands', () => {
    assert.equal(
      new SVGPathData('Q-10.0032e-5 -20.0032e-5 -30.0032e-5 -40.0032e-5q-10.0032e-5 -20.0032e-5 -30.0032e-5 -40.0032e-5Q-10.0032e-5 -20.0032e-5 -30.0032e-5 -40.0032e-5').encode(),
      'Q-0.000100032 -0.000200032 -0.000300032 -0.000400032q-0.000100032 -0.000200032 -0.000300032 -0.000400032Q-0.000100032 -0.000200032 -0.000300032 -0.000400032'
    );
  });

});
