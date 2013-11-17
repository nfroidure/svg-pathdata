var assert = chai.assert;

describe("Positive scale", function() {

  it("should work with relative path", function() {
    assert.equal(new SVGPathData(
      'm20 30c0 0 10 20 15 30z'
    ).scale(10, 10).encode(),
      'm200 300c0 0 100 200 150 300z');
  });

  it("should work with absolute path", function() {
    assert.equal(new SVGPathData(
      'M20 30C0 0 10 20 15 30z'
    ).scale(10, 10).encode(),
      'M200 300C0 0 100 200 150 300z');
  });

});
