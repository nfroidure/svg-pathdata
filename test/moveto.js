var assert = chai.assert;

describe("Parsing move to commands", function() {
  var parser;

  beforeEach(function() {
    parser = new SVGPathDataParser();
  });

  afterEach(function() {
  });

  it("should work with single coordinate", function() {
    var commands = parser.parse('M100');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_MOVETO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, '100');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with comma separated coordinates", function() {
    var commands = parser.parse('M100,100');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_MOVETO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, '100');
    assert.equal(commands[0].y, '100');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with space separated coordinates", function() {
    var commands = parser.parse('m100 \t   100');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_MOVETO);
    assert.equal(commands[0].relative, true);
    assert.equal(commands[0].x, '100');
    assert.equal(commands[0].y, '100');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with single complexer coordinate", function() {
    var commands = parser.parse('m-10e-5');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_MOVETO);
    assert.equal(commands[0].relative, true);
    assert.equal(commands[0].x, '-10e-5');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with complexer coordinates", function() {
    var commands = parser.parse('m-10e-5 -10e-5');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_MOVETO);
    assert.equal(commands[0].relative, true);
    assert.equal(commands[0].x, '-10e-5');
    assert.equal(commands[0].y, '-10e-5');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with single even more complexer coordinates", function() {
    var commands = parser.parse('M-10.0032e-5 -10.0032e-5');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_MOVETO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, '-10.0032e-5');
    assert.equal(commands[0].y, '-10.0032e-5');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with comma separated coordinate pairs", function() {
    var commands = parser.parse('M123,456 7890,9876');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_MOVETO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, '123');
    assert.equal(commands[0].y, '456');
    assert.equal(commands[1].type, SVGPathDataParser.STATE_MOVETO);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].x, '7890');
    assert.equal(commands[1].y, '9876');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with space separated coordinate pairs", function() {
    var commands = parser.parse('m123  \t 456  \n 7890  \r 9876');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_MOVETO);
    assert.equal(commands[0].relative, true);
    assert.equal(commands[0].x, '123');
    assert.equal(commands[0].y, '456');
    assert.equal(commands[1].type, SVGPathDataParser.STATE_MOVETO);
    assert.equal(commands[1].relative, true);
    assert.equal(commands[1].x, '7890');
    assert.equal(commands[1].y, '9876');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with nested separated coordinates", function() {
    var commands = parser.parse('M123 ,  456  \t,\n7890 \r\n 9876');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_MOVETO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, '123');
    assert.equal(commands[0].y, '456');
    assert.equal(commands[1].type, SVGPathDataParser.STATE_MOVETO);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].x, '7890');
    assert.equal(commands[1].y, '9876');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with multiple command declarations", function() {
    var commands = parser.parse('M123 ,  456  \t,\n7890 \r\n 9876m123 ,  456  \t,\n7890 \r\n 9876');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_MOVETO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, '123');
    assert.equal(commands[0].y, '456');
    assert.equal(commands[1].type, SVGPathDataParser.STATE_MOVETO);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].x, '7890');
    assert.equal(commands[1].y, '9876');
    assert.equal(commands[2].type, SVGPathDataParser.STATE_MOVETO);
    assert.equal(commands[2].relative, true);
    assert.equal(commands[2].x, '123');
    assert.equal(commands[2].y, '456');
    assert.equal(commands[3].type, SVGPathDataParser.STATE_MOVETO);
    assert.equal(commands[3].relative, true);
    assert.equal(commands[3].x, '7890');
    assert.equal(commands[3].y, '9876');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

});
