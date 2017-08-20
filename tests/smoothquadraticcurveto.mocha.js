/* eslint max-len:0 */
'use strict';

const assert = require('chai').assert;
const { SVGPathData } = require('..');

describe('Parsing smooth quadratic curve to commands', () => {

  it('should fail with a with single coordinate', () => {
    assert.throw(() => {
      new SVGPathData('T100');
    }, SyntaxError, 'Unterminated command at the path end.');
  });

  it('should fail with a single complexer coordinate', () => {
    assert.throw(() => {
      new SVGPathData('t-10e-5');
    }, SyntaxError, 'Unterminated command at the path end.');
  });

  it('should work with comma separated coordinates', () => {
    const commands = new SVGPathData('T100,100').commands;

    assert.equal(commands[0].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, '100');
    assert.equal(commands[0].y, '100');
  });

  it('should work with space separated coordinates', () => {
    const commands = new SVGPathData('t100 \t   100').commands;

    assert.equal(commands[0].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[0].relative, true);
    assert.equal(commands[0].x, '100');
    assert.equal(commands[0].y, '100');
  });

  it('should work with complexer coordinates', () => {
    const commands = new SVGPathData('t-10e-5 -10e-5').commands;

    assert.equal(commands[0].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[0].relative, true);
    assert.equal(commands[0].x, '-10e-5');
    assert.equal(commands[0].y, '-10e-5');
  });

  it('should work with even more complexer coordinates', () => {
    const commands = new SVGPathData('T-10.0032e-5 -10.0032e-5').commands;

    assert.equal(commands[0].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, '-10.0032e-5');
    assert.equal(commands[0].y, '-10.0032e-5');
  });

  it('should work with comma separated coordinate pairs', () => {
    const commands = new SVGPathData('T123,456 7890,9876').commands;

    assert.equal(commands[0].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, '123');
    assert.equal(commands[0].y, '456');
    assert.equal(commands[1].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].x, '7890');
    assert.equal(commands[1].y, '9876');
  });

  it('should work with space separated coordinate pairs', () => {
    const commands = new SVGPathData('t123  \t 456  \n 7890  \r 9876').commands;

    assert.equal(commands[0].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[0].relative, true);
    assert.equal(commands[0].x, '123');
    assert.equal(commands[0].y, '456');
    assert.equal(commands[1].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[1].relative, true);
    assert.equal(commands[1].x, '7890');
    assert.equal(commands[1].y, '9876');
  });

  it('should work with nested separated coordinates', () => {
    const commands = new SVGPathData('T123 ,  456  \t,\n7890 \r\n 9876').commands;

    assert.equal(commands[0].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, '123');
    assert.equal(commands[0].y, '456');
    assert.equal(commands[1].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].x, '7890');
    assert.equal(commands[1].y, '9876');
  });

  it('should work with multiple command declarations', () => {
    const commands = new SVGPathData(
      'T123 ,  456  \t,\n7890 \r\n9876t123 ,  456  \t,\n7890 \r\n 9876'
    ).commands;

    assert.equal(commands[0].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, '123');
    assert.equal(commands[0].y, '456');
    assert.equal(commands[1].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].x, '7890');
    assert.equal(commands[1].y, '9876');
    assert.equal(commands[2].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[2].relative, true);
    assert.equal(commands[2].x, '123');
    assert.equal(commands[2].y, '456');
    assert.equal(commands[3].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[3].relative, true);
    assert.equal(commands[3].x, '7890');
    assert.equal(commands[3].y, '9876');
  });

});

describe('Encoding smooth quadratic bezier curve to commands', () => {

  it('should work with one command', () => {
    assert.equal(
      new SVGPathData('T-50.0032e-5 -60.0032e-5').encode(),
      'T-0.000500032 -0.000600032'
    );
  });

  it('should work with several commands', () => {
    assert.equal(
      new SVGPathData('T-50.0032e-5 -60.0032e-5t-50.0032e-5 -60.0032e-5T-50.0032e-5 -60.0032e-5 -50.0032e-5 -60.0032e-5').encode(),
      'T-0.000500032 -0.000600032t-0.000500032 -0.000600032T-0.000500032 -0.000600032T-0.000500032 -0.000600032'
    );
  });

});
