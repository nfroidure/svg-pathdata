var assert = chai.assert;
var SVGPathDataParser = SVGPathData.Parser;

describe("Parsing numbers", function() {
  var parser = new SVGPathDataParser(function() {});

  beforeEach(function() {
    parser.state = SVGPathDataParser.STATE_NUMBER;
  });

  afterEach(function() {
    parser.curNumber = '';
  });

  it("should work with a 1 char integer", function() {
    parser.read('0');
    assert.equal(parser.curNumber, '0');
  });

  it("should work with a big integer", function() {
    parser.read('1234567890');
    assert.equal(parser.curNumber, '1234567890');
  });

  it("should work with a explicitly positive integer", function() {
    parser.read('+1254664');
    assert.equal(parser.curNumber, '+1254664');
    assert.equal(parser.state&SVGPathDataParser.STATE_NUMBER,
      SVGPathDataParser.STATE_NUMBER);
  });

  it("should work with a negative integer", function() {
    parser.read('-1254664');
    assert.equal(parser.curNumber, '-1254664');
    assert.equal(parser.state&SVGPathDataParser.STATE_NUMBER,
      SVGPathDataParser.STATE_NUMBER);
  });

  it("should work with a float with left side digits", function() {
    parser.read('123.456');
    assert.equal(parser.curNumber, '123.456');
    assert.equal(parser.state&SVGPathDataParser.STATE_NUMBER,
      SVGPathDataParser.STATE_NUMBER);
  });

  it("should work with a float without left side digits", function() {
    parser.read('.456');
    assert.equal(parser.curNumber, '.456');
    assert.equal(parser.state&SVGPathDataParser.STATE_NUMBER,
      SVGPathDataParser.STATE_NUMBER);
  });

  it("should work with a float without right side digits", function() {
    parser.read('123.');
    assert.equal(parser.curNumber, '123.');
    assert.equal(parser.state&SVGPathDataParser.STATE_NUMBER,
      SVGPathDataParser.STATE_NUMBER);
  });

  it("should work with a number with a positive exponent", function() {
    parser.read('123.456e125');
    assert.equal(parser.curNumber, '123.456e125');
    assert.equal(parser.state&SVGPathDataParser.STATE_NUMBER,
      SVGPathDataParser.STATE_NUMBER);
  });

  it("should work with a number with an explicitly positive exponent", function() {
    parser.read('123.456e+125');
    assert.equal(parser.curNumber, '123.456e+125');
    assert.equal(parser.state&SVGPathDataParser.STATE_NUMBER,
      SVGPathDataParser.STATE_NUMBER);
  });

  it("should work with a number with a negative exponent", function() {
    parser.read('123.456e-125');
    assert.equal(parser.curNumber, '123.456e-125');
    assert.equal(parser.state&SVGPathDataParser.STATE_NUMBER,
      SVGPathDataParser.STATE_NUMBER);
  });

  it("should work with a negative number with a positive exponent", function() {
    parser.read('-123.456e125');
    assert.equal(parser.curNumber, '-123.456e125');
    assert.equal(parser.state&SVGPathDataParser.STATE_NUMBER,
      SVGPathDataParser.STATE_NUMBER);
  });

  it("should work with a negative number with an explicitly positive exponent", function() {
    parser.read('-123.456e+125');
    assert.equal(parser.curNumber, '-123.456e+125');
    assert.equal(parser.state&SVGPathDataParser.STATE_NUMBER,
      SVGPathDataParser.STATE_NUMBER);
  });

  it("should work with a negative number with a negative exponent", function() {
    parser.read('-123.456e-125');
    assert.equal(parser.curNumber, '-123.456e-125');
    assert.equal(parser.state&SVGPathDataParser.STATE_NUMBER,
      SVGPathDataParser.STATE_NUMBER);
  });

});

