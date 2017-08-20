/* eslint max-len:0 */
'use strict';

const assert = require('chai').assert;
const { SVGPathData } = require('..');

// Sample paths from MDN
// https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
// Here we have to round output before testing since there is some lil
// differences across browsers.

describe('Converting elliptical arc commands to curves', () => {

  it('should work sweepFlag on 0 and largeArcFlag on 0', () => {
    const arc = new SVGPathData('M80 80 A 45 45, 0, 0, 0, 125 125').annotateArcs().commands[1];

    assert.equal(arc.rX, 45);
    assert.equal(arc.rY, 45);
    assert.equal(arc.cX, 125);
    assert.equal(arc.cY, 80);
    assert.equal(arc.phi1, 180);
    assert.equal(arc.phi2, 90);
  });

  it('should work sweepFlag on 1 and largeArcFlag on 0', () => {
    const arc = new SVGPathData('M230 80 a 45 45, 0, 1, 0, 45 45').annotateArcs().commands[1];

    assert.equal(arc.relative, true);
    assert.equal(arc.rX, 45);
    assert.equal(arc.rY, 45);
    assert.equal(arc.cX, 0);
    assert.equal(arc.cY, 45);
    assert.equal(arc.phi2 - arc.phi1, -270);
    assert.equal((arc.phi1 + 360) % 360, 270);
  });

  it('should work sweepFlag on 0 and largeArcFlag on 1', () => {
    const arc = new SVGPathData('M230 80 a 45 45, 0, 0, 1, 45 45').annotateArcs().commands[1];

    assert.equal(arc.relative, true);
    assert.equal(arc.rX, 45);
    assert.equal(arc.rY, 45);
    assert.equal(arc.cX, 0);
    assert.equal(arc.cY, 45);
    assert.equal(arc.phi2 - arc.phi1, 90);
    assert.equal((arc.phi1 + 360) % 360, 270);
  });

  it('should work sweepFlag on 1 and largeArcFlag on 1', () => {
    const arc = new SVGPathData('M110 215 A 30 50 0 1 1 162.55 162.45').annotateArcs().commands[1];

    assert.equal(arc.relative, false);
    assert.equal(arc.rX, 30.64165220741206);
    assert.equal(arc.rY, 51.069420345686765);
    assert.equal(arc.cX, 136.275);
    assert.equal(arc.cY, 188.725);
    assert.equal(arc.phi1, 149.03624346792648);
    assert.equal(arc.phi2, 329.03624346792645);
  });

  it('should work sweepFlag on 0 and largeArcFlag on 1xx', () => {
    const arc = new SVGPathData('M80 80 A 45 60, 0, 1, 1, 125 125').annotateArcs().commands[1];

    assert.equal(arc.relative, false);
    assert.isBelow(arc.cX, 125);
  });


});
