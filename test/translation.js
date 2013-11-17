var assert = chai.assert;

describe("Possitive translation", function() {

  it("should work with relative path", function() {
    assert.equal(new SVGPathData(
      'm20,30c0 0 10 20 15 30z'
    ).translate(10, 10).encode(),
      'm30 40c10 10 20 30 25 40z');
  });

  it("should work with absolute path", function() {
    assert.equal(new SVGPathData(
      'M20,30C0 0 10 20 15 30z'
    ).translate(10, 10).encode(),
      'M30 40C10 10 20 30 25 40z');
  });

});
