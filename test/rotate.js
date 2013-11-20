var assert = chai.assert;

describe("Positive rotate", function() {

  it("should work with relative path", function() {
    assert.equal(new SVGPathData(
      'm100 75l-50 -45l0 90z'
    ).rotate(2*Math.PI, 75, 75).encode(),
      'm99.99999999999997 75.00000000000006l-50.00000000000001 -44.99999999999999l-4.263256414560601e-14 90.00000000000003z');
  });

  it("should work with absolute path", function() {
    assert.equal(new SVGPathData(
      'M 100,75 50,30 50,120 z'
    ).rotate(2*Math.PI, 75, 75).encode(),
      'M99.99999999999997 75.00000000000006L49.99999999999997 30.00000000000003L49.99999999999996 120.00000000000003z');
  });

});
