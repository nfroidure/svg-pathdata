var assert = chai.assert;

describe("Positive rotate", function() {

  it("should work with relative path", function() {
    assert.equal(new SVGPathData(
      'm100 75l-50 -45l0 90z'
    ).rotate(2*Math.PI, 75, 75).encode(),
      'm100.00000000000003 74.99999999999994l-49.99999999999999 -45.00000000000001l4.263256414560601e-14 89.99999999999997z');
  });

  it("should work with absolute path", function() {
    assert.equal(new SVGPathData(
      'M 100,75 50,30 50,120 z'
    ).rotate(2*Math.PI, 75, 75).encode(),
      'M100.00000000000003 74.99999999999994L50.00000000000003 29.99999999999997L50.00000000000004 119.99999999999997z');
  });

});
