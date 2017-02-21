var assert = (
    global && global.chai
    ? global.chai.assert
    : require('chai').assert
  )
  , SVGPathData = (
    global && global.SVGPathData
    ? global.SVGPathData
    : require(__dirname + '/../src/SVGPathData.js')
  )
;

describe("HVZA normalization", function() {

  // currently z/Z is always absolute
  it("should tranform relative h v z", function() {
    assert.equal(new SVGPathData(
      'm 10 10 h 100 v 100 z'
      ).normalizeHVZ().encode(),
      new SVGPathData('m 10 10 l 100 0 l 0 100 L 10 10').encode());
  });

  it("should tranform absolute h v z", function() {
    assert.equal(new SVGPathData(
      'M 10 10 H 100 V 100 Z'
      ).normalizeHVZ().encode(),
      new SVGPathData('M 10 10 L 100 10 L 100 100 L 10 10').encode());
  });

  it("should tranform degenerate arcs", function() {
    assert.equal(new SVGPathData(
      'M 10 10 A 0 10 0 0 0 100 100 a 20 0 0 0 0 20 0'
      ).normalizeHVZ().encode(),
      new SVGPathData('M 10 10 L 100 100 l 20 0').encode());
  });
});