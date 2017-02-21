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

describe("normalization of curves", function() {

  it("should clear zero length line segments", function() {
    assert.equal(new SVGPathData(
      'M 10 10 h 0 h 10 H 20 H 30 v 0 v 10 V 20 V 30 l 0 0 l 10 10 L 40 40 L 50 50'
      ).sanitize().encode(),
      new SVGPathData('M 10 10 h 10 H 30 v 10 V 30 l 10 10 L 50 50').encode());
  });

  it("should clear zero length quadratic curves", function() {
    assert.equal(new SVGPathData(
      'M 10 10 t 0 0 t 10 10 t 0 0 t 0 0'
      ).sanitize().encode(),
      new SVGPathData('M 10 10 t 10 10 t 0 0 t 0 0').encode());
  });

  it("should clear zero length quadratic curves (absolute)", function() {
    assert.equal(new SVGPathData(
      'M 10 10 T 10 10 T 20 20 T 20 20 T 20 20'
      ).sanitize().encode(),
      new SVGPathData('M 10 10 T 20 20 T 20 20 T 20 20').encode());
  });

  it("should clear zero length cubic curves", function() {
    assert.equal(new SVGPathData(
      'M 10 10 C 10 10 10 10 10 10 c 0 0 0 0 0 0 S 10 10 10 10 s 0 0 0 0'
      ).sanitize().encode(),
      new SVGPathData('M 10 10').encode());
  });

  it("should correctly handle first control point from smooth curve", function() {
    assert.equal(new SVGPathData(
      'M 10 10 s 10 10 20 10 s 0 0 0 0'
      ).sanitize().encode(),
      new SVGPathData('M 10 10 s 10 10 20 10 s 0 0 0 0').encode());
  });

  it("should remove 0-length Zz", function() {
    assert.equal(new SVGPathData(
      'M 10 10 h 10 h -10 Z'
      ).sanitize().encode(),
      new SVGPathData('M 10 10 h 10 h -10').encode());
  });

});