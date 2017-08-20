/* eslint max-len:0 */
'use strict';

const assert = require('chai').assert;
const { SVGPathData } = require('..');

describe('Parsing commands with different numbers', () => {

  it('should work with a 1 char integer', () => {
    assert.equal(new SVGPathData('H0').commands[0].x, 0);
  });

  it('should work with a big integer', () => {
    assert.equal(new SVGPathData('H1234567890').commands[0].x, 1234567890);
  });

  it('should work with a explicitly positive integer', () => {
    assert.equal(new SVGPathData('H+1254664').commands[0].x, +1254664);
  });

  it('should work with a negative integer', () => {
    assert.equal(new SVGPathData('H-1254664').commands[0].x, -1254664);
  });

  it('should work with a float with left side digits', () => {
    assert.equal(new SVGPathData('H123.456').commands[0].x, 123.456);
  });

  it('should work with a float without left side digits', () => {
    assert.equal(new SVGPathData('H.456').commands[0].x, 0.456);
  });

  it('should work with a float without right side digits', () => {
    assert.equal(new SVGPathData('H123.').commands[0].x, 123.0);
  });

  it('should work with a number with a positive exponent', () => {
    assert.equal(new SVGPathData('H123.456e125').commands[0].x, 123.456e125);
  });

  it('should work with a number with an explicitly positive exponent', () => {
    assert.equal(new SVGPathData('H123.456e+125').commands[0].x, 123.456e+125);
  });

  it('should work with a number with a negative exponent', () => {
    assert.equal(new SVGPathData('H123.456e-125').commands[0].x, 123.456e-125);
  });

  it('should work with a negative number with a positive exponent', () => {
    assert.equal(new SVGPathData('H-123.456e125').commands[0].x, -123.456e125);
  });

  it('should work with a negative number with an explicitly positive exponent', () => {
    assert.equal(new SVGPathData('H-123.456e+125').commands[0].x, -123.456e+125);
  });

  it('should work with a negative number with a negative exponent', () => {
    assert.equal(new SVGPathData('H-123.456e-125').commands[0].x, -123.456e-125);
  });

  it('should work with sign separated numbers', () => {
    const commands = new SVGPathData('M-123.456e-125-1234.456e-125').commands;

    assert.equal(commands[0].x, -123.456e-125);
    assert.equal(commands[0].y, -1234.456e-125);
  });

  it('should work with sign separated numbers', () => {
    const commands = new SVGPathData('M-1.456e-125-12.456e-125-123.456e-125-1234.456e-125').commands;

    assert.equal(commands[0].x, -1.456e-125);
    assert.equal(commands[0].y, -12.456e-125);
    assert.equal(commands[1].x, -123.456e-125);
    assert.equal(commands[1].y, -1234.456e-125);
  });

  it('should work with decpoint separated numbers', () => {
    const commands = new SVGPathData('M-123.123e-123.456e-456').commands;

    assert.equal(commands[0].x, -123.123e-123);
    assert.equal(commands[0].y, 0.456e-456);
  });

  it('should work with decpoint separated numbers', () => {
    const commands = new SVGPathData('M-123.123e-123.456e-456.789e-789.123e-123').commands;

    assert.equal(commands[0].x, -123.123e-123);
    assert.equal(commands[0].y, 0.456e-456);
    assert.equal(commands[1].x, 0.789e-789);
    assert.equal(commands[1].y, 0.123e-123);
  });

});
