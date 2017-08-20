/* eslint max-len:0 */
'use strict';
const chai = require('chai');
const chaiStats = require('chai-stats');

chai.use(chaiStats);
const assert = chai.assert;
const { SVGPathData } = require('..');

// eslint-disable-next-line
function testBounds(svgString, minX, minY, maxX, maxY) {
  const path = new SVGPathData(svgString);
  const bounds = path.getBounds();

  assert.almostEqual(bounds.minX, minX, 1e-4);
  assert.almostEqual(bounds.minY, minY, 1e-4);
  assert.almostEqual(bounds.maxX, maxX, 1e-4);
  assert.almostEqual(bounds.maxY, maxY, 1e-4);
}
// eslint-disable-next-line no-unused-vars
function drawWithBounds(svgString) {
  const path = new SVGPathData(svgString);
  const bounds = path.getBounds();

  return `${svgString}M${bounds.minX} ${bounds.minY}H${bounds.maxX}V${bounds.maxY}H${bounds.minX}Z`;
}
describe('Calculating bounds', () => {

  it('should work with L', () => {
    testBounds('M10 10 L 20 30', 10, 10, 20, 30);
  });

  it('should work with A', () => {
    testBounds('M80 80 A 45 45, 0, 0, 1, 125 125', 80, 80, 125, 125);
    testBounds('M80 80 A 45 60, 20, 0, 0, 125 125', 80, 80, 125, 125.59961858400797);
    testBounds('M80 80 A 45 60, 20, 0, 1, 125 125', 80, 79.40038141599203, 125, 125);
    testBounds('M80 80 A 45 60, 20, 1, 0, 125 125', 31.02578911052131, 80, 125.03089537701737, 196.28938858015945);
    testBounds('M80 80 A 45 60, -20, 1, 1, 120 120', 74.66880591967042, 4.531089272703177, 168.6739121861665, 121.4200964368706);
  });

  it('should work with C', () => {
    testBounds('M20 10 C 0 40, 80 100, 100 40', 16.81700272781236, 10, 100, 65.67265229607777);
  });

  it('should work with a combined example', () => {
    testBounds('M100,100L150,100a50,25 0 0,0 150,100q100,-50 70,-170Z', 100, 30, 376.9230769230769, 212.5);
  });

  it('shouldn\'t change the original commands', () => {
    const path = new SVGPathData('M100,100L150,100a50,25 0 0,0 150,100q100,-50 70,-170Z');
    const originalPath = path.encode();

    path.getBounds();
    const afterPath = path.encode();

    assert.equal(afterPath, originalPath);
  });

});
