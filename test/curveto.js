var assert = chai.assert;

describe("Parsing curve to commands", function() {
  var parser;

  beforeEach(function() {
    parser = new SVGPathDataParser();
  });

  afterEach(function() {
  });

  it("should not work when badly declarated", function() {
    assert.throw(function() {
      parser.parse('C');
    }, SyntaxError, 'Unterminated command at index 0.');
    assert.throw(function() {
      new SVGPathDataParser().parse('C10');
    }, SyntaxError, 'Unterminated command at index 0.');
    assert.throw(function() {
      new SVGPathDataParser().parse('C10 10');
    }, SyntaxError, 'Unterminated command at index 0.');
    assert.throw(function() {
      new SVGPathDataParser().parse('C10 10 10');
    }, SyntaxError, 'Unterminated command at index 0.');
    assert.throw(function() {
      new SVGPathDataParser().parse('C10 10 10 10');
    }, SyntaxError, 'Unterminated command at index 0.');
    assert.throw(function() {
      new SVGPathDataParser().parse('C10 10 10 10 10');
    }, SyntaxError, 'Unterminated command at index 0.');
    assert.throw(function() {
      new SVGPathDataParser().parse('C10 10 10 10 10 10 10 10');
    }, SyntaxError, 'Unterminated command at index 0.');
    assert.throw(function() {
      new SVGPathDataParser().parse('C10 10 10C10 10 10 10 10 10');
    }, SyntaxError, 'Unterminated command at index 9.');
  });

  it("should work with comma separated coordinates", function() {
    var commands = parser.parse('C123,456 789,987 654,321');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_CURVETO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x2, '123');
    assert.equal(commands[0].y2, '456');
    assert.equal(commands[0].x1, '789');
    assert.equal(commands[0].y1, '987');
    assert.equal(commands[0].x, '654');
    assert.equal(commands[0].y, '321');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with space separated coordinates", function() {
    var commands = parser.parse('C123 456 789 987 654 321');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_CURVETO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x2, '123');
    assert.equal(commands[0].y2, '456');
    assert.equal(commands[0].x1, '789');
    assert.equal(commands[0].y1, '987');
    assert.equal(commands[0].x, '654');
    assert.equal(commands[0].y, '321');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with nested separated complexer coordinate pairs", function() {
    var commands = parser.parse('C-10.0032e-5,-20.0032e-5 -30.0032e-5,-40.0032e-5 -50.0032e-5,-60.0032e-5');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_CURVETO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x2, '-10.0032e-5');
    assert.equal(commands[0].y2, '-20.0032e-5');
    assert.equal(commands[0].x1, '-30.0032e-5');
    assert.equal(commands[0].y1, '-40.0032e-5');
    assert.equal(commands[0].x, '-50.0032e-5');
    assert.equal(commands[0].y, '-60.0032e-5');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with multiple pairs of coordinates", function() {
    var commands = parser.parse('\
    C-10.0032e-5,-20.0032e-5 -30.0032e-5,-40.0032e-5 -50.0032e-5,-60.0032e-5\
    -10.0032e-5,-20.0032e-5 -30.0032e-5,-40.0032e-5 -50.0032e-5,-60.0032e-5\
    -10.0032e-5,-20.0032e-5 -30.0032e-5,-40.0032e-5 -50.0032e-5,-60.0032e-5');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_CURVETO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x2, '-10.0032e-5');
    assert.equal(commands[0].y2, '-20.0032e-5');
    assert.equal(commands[0].x1, '-30.0032e-5');
    assert.equal(commands[0].y1, '-40.0032e-5');
    assert.equal(commands[0].x, '-50.0032e-5');
    assert.equal(commands[0].y, '-60.0032e-5');
    assert.equal(commands[1].type, SVGPathDataParser.STATE_CURVETO);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].x2, '-10.0032e-5');
    assert.equal(commands[1].y2, '-20.0032e-5');
    assert.equal(commands[1].x1, '-30.0032e-5');
    assert.equal(commands[1].y1, '-40.0032e-5');
    assert.equal(commands[1].x, '-50.0032e-5');
    assert.equal(commands[1].y, '-60.0032e-5');
    assert.equal(commands[2].type, SVGPathDataParser.STATE_CURVETO);
    assert.equal(commands[2].relative, false);
    assert.equal(commands[2].x2, '-10.0032e-5');
    assert.equal(commands[2].y2, '-20.0032e-5');
    assert.equal(commands[2].x1, '-30.0032e-5');
    assert.equal(commands[2].y1, '-40.0032e-5');
    assert.equal(commands[2].x, '-50.0032e-5');
    assert.equal(commands[2].y, '-60.0032e-5');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with multiple declarated pairs of coordinates", function() {
    var commands = parser.parse('\
    C-10.0032e-5,-20.0032e-5 -30.0032e-5,-40.0032e-5 -50.0032e-5,-60.0032e-5\
    c-10.0032e-5,-20.0032e-5 -30.0032e-5,-40.0032e-5 -50.0032e-5,-60.0032e-5\
    C-10.0032e-5,-20.0032e-5 -30.0032e-5,-40.0032e-5 -50.0032e-5,-60.0032e-5');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_CURVETO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x2, '-10.0032e-5');
    assert.equal(commands[0].y2, '-20.0032e-5');
    assert.equal(commands[0].x1, '-30.0032e-5');
    assert.equal(commands[0].y1, '-40.0032e-5');
    assert.equal(commands[0].x, '-50.0032e-5');
    assert.equal(commands[0].y, '-60.0032e-5');
    assert.equal(commands[1].type, SVGPathDataParser.STATE_CURVETO);
    assert.equal(commands[1].relative, true);
    assert.equal(commands[1].x2, '-10.0032e-5');
    assert.equal(commands[1].y2, '-20.0032e-5');
    assert.equal(commands[1].x1, '-30.0032e-5');
    assert.equal(commands[1].y1, '-40.0032e-5');
    assert.equal(commands[1].x, '-50.0032e-5');
    assert.equal(commands[1].y, '-60.0032e-5');
    assert.equal(commands[2].type, SVGPathDataParser.STATE_CURVETO);
    assert.equal(commands[2].relative, false);
    assert.equal(commands[2].x2, '-10.0032e-5');
    assert.equal(commands[2].y2, '-20.0032e-5');
    assert.equal(commands[2].x1, '-30.0032e-5');
    assert.equal(commands[2].y1, '-40.0032e-5');
    assert.equal(commands[2].x, '-50.0032e-5');
    assert.equal(commands[2].y, '-60.0032e-5');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

});
