var assert = chai.assert;

describe("Parsing smooth curve to commands", function() {
  var parser;

  beforeEach(function() {
    parser = new SVGPathDataParser();
  });

  afterEach(function() {
  });

  it("should not work when badly declarated", function() {
    assert.throw(function() {
      parser.parse('S');
    }, SyntaxError, 'Unterminated command at index 0.');
    assert.throw(function() {
      new SVGPathDataParser().parse('S10');
    }, SyntaxError, 'Unterminated command at index 0.');
    assert.throw(function() {
      new SVGPathDataParser().parse('S10 10');
    }, SyntaxError, 'Unterminated command at index 0.');
    assert.throw(function() {
      new SVGPathDataParser().parse('S10 10 10');
    }, SyntaxError, 'Unterminated command at index 0.');
    assert.throw(function() {
      new SVGPathDataParser().parse('S10 10 10 10 10 10');
    }, SyntaxError, 'Unterminated command at index 0.');
    assert.throw(function() {
      new SVGPathDataParser().parse('S10 10 10S10 10 10 10');
    }, SyntaxError, 'Unterminated command at index 9.');
  });

  it("should work with comma separated coordinates", function() {
    var commands = parser.parse('S123,456 789,987');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_SMOOTHTO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x2, '123');
    assert.equal(commands[0].y2, '456');
    assert.equal(commands[0].x, '789');
    assert.equal(commands[0].y, '987');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with space separated coordinates", function() {
    var commands = parser.parse('S123 456 789 987');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_SMOOTHTO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x2, '123');
    assert.equal(commands[0].y2, '456');
    assert.equal(commands[0].x, '789');
    assert.equal(commands[0].y, '987');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with nested separated complexer coordinate pairs", function() {
    var commands = parser.parse('S-10.0032e-5,-20.0032e-5 -30.0032e-5,-40.0032e-5');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_SMOOTHTO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x2, '-10.0032e-5');
    assert.equal(commands[0].y2, '-20.0032e-5');
    assert.equal(commands[0].x, '-30.0032e-5');
    assert.equal(commands[0].y, '-40.0032e-5');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with multiple pairs of coordinates", function() {
    var commands = parser.parse('S-10.0032e-5,-20.0032e-5 -30.0032e-5,-40.0032e-5 -10.0032e-5,-20.0032e-5 -30.0032e-5,-40.0032e-5 -10.0032e-5,-20.0032e-5 -30.0032e-5,-40.0032e-5');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_SMOOTHTO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x2, '-10.0032e-5');
    assert.equal(commands[0].y2, '-20.0032e-5');
    assert.equal(commands[0].x, '-30.0032e-5');
    assert.equal(commands[0].y, '-40.0032e-5');
    assert.equal(commands[1].type, SVGPathDataParser.STATE_SMOOTHTO);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].x2, '-10.0032e-5');
    assert.equal(commands[1].y2, '-20.0032e-5');
    assert.equal(commands[1].x, '-30.0032e-5');
    assert.equal(commands[1].y, '-40.0032e-5');
    assert.equal(commands[2].type, SVGPathDataParser.STATE_SMOOTHTO);
    assert.equal(commands[2].relative, false);
    assert.equal(commands[2].x2, '-10.0032e-5');
    assert.equal(commands[2].y2, '-20.0032e-5');
    assert.equal(commands[2].x, '-30.0032e-5');
    assert.equal(commands[2].y, '-40.0032e-5');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with multiple declarated pairs of coordinates", function() {
    var commands = parser.parse('S-10.0032e-5,-20.0032e-5 -30.0032e-5,-40.0032e-5 s-10.0032e-5,-20.0032e-5 -30.0032e-5,-40.0032e-5 S-10.0032e-5,-20.0032e-5 -30.0032e-5,-40.0032e-5');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_SMOOTHTO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x2, '-10.0032e-5');
    assert.equal(commands[0].y2, '-20.0032e-5');
    assert.equal(commands[0].x, '-30.0032e-5');
    assert.equal(commands[0].y, '-40.0032e-5');
    assert.equal(commands[1].type, SVGPathDataParser.STATE_SMOOTHTO);
    assert.equal(commands[1].relative, true);
    assert.equal(commands[1].x2, '-10.0032e-5');
    assert.equal(commands[1].y2, '-20.0032e-5');
    assert.equal(commands[1].x, '-30.0032e-5');
    assert.equal(commands[1].y, '-40.0032e-5');
    assert.equal(commands[2].type, SVGPathDataParser.STATE_SMOOTHTO);
    assert.equal(commands[2].relative, false);
    assert.equal(commands[2].x2, '-10.0032e-5');
    assert.equal(commands[2].y2, '-20.0032e-5');
    assert.equal(commands[2].x, '-30.0032e-5');
    assert.equal(commands[2].y, '-40.0032e-5');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

});
