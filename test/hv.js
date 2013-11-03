var assert = chai.assert;

describe("Parsing horizontal commands", function() {
  var parser;

  beforeEach(function() {
    parser = new SVGPathDataParser();
  });

  afterEach(function() {
  });

  it("should work with single coordinate", function() {
    var commands = parser.parse('H100');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, '100');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with single complexer coordinate", function() {
    var commands = parser.parse('H-10e-5');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, '-10e-5');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with single even more complexer coordinate", function() {
    var commands = parser.parse('H-10.0032e-5');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, '-10.0032e-5');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with single relative coordinate", function() {
    var commands = parser.parse('h100');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[0].relative, true);
    assert.equal(commands[0].x, '100');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with comma separated coordinates", function() {
    var commands = parser.parse('H123,456,7890,9876');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[0].x, '123');
    assert.equal(commands[1].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[1].x, '456');
    assert.equal(commands[2].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[2].x, '7890');
    assert.equal(commands[3].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[3].x, '9876');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with space separated coordinates", function() {
    var commands = parser.parse('H123 456 7890 9876');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[0].x, '123');
    assert.equal(commands[1].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[1].x, '456');
    assert.equal(commands[2].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[2].x, '7890');
    assert.equal(commands[3].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[3].x, '9876');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with nested separated coordinates", function() {
    var commands = parser.parse('H123 ,  456  \t,\n7890 \r\n 9876');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[0].x, '123');
    assert.equal(commands[1].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[1].x, '456');
    assert.equal(commands[2].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[2].x, '7890');
    assert.equal(commands[3].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[3].x, '9876');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with multiple command declarations", function() {
    var commands = parser.parse('H123 ,  456  \t,\n7890 \r\n 9876H123 ,  456  \t,\n7890 \r\n 9876');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[0].x, '123');
    assert.equal(commands[1].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[1].x, '456');
    assert.equal(commands[2].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[2].x, '7890');
    assert.equal(commands[3].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[3].x, '9876');
    assert.equal(commands[4].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[4].x, '123');
    assert.equal(commands[5].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[5].x, '456');
    assert.equal(commands[6].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[6].x, '7890');
    assert.equal(commands[7].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[7].x, '9876');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

});

describe("Parsing vertical commands", function() {
  var parser;

  beforeEach(function() {
    parser = new SVGPathDataParser();
  });

  afterEach(function() {
  });

  it("should work with single coordinate", function() {
    var commands = parser.parse('V100');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].y, '100');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with single complexer coordinate", function() {
    var commands = parser.parse('V-10e-5');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].y, '-10e-5');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with single even more complexer coordinate", function() {
    var commands = parser.parse('V-10.0032e-5');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].y, '-10.0032e-5');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with single relative coordinate", function() {
    var commands = parser.parse('v100');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[0].relative, true);
    assert.equal(commands[0].y, '100');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with comma separated coordinates", function() {
    var commands = parser.parse('V123,456,7890,9876');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[0].y, '123');
    assert.equal(commands[1].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[1].y, '456');
    assert.equal(commands[2].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[2].y, '7890');
    assert.equal(commands[3].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[3].y, '9876');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with space separated coordinates", function() {
    var commands = parser.parse('V123 456 7890 9876');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[0].y, '123');
    assert.equal(commands[1].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[1].y, '456');
    assert.equal(commands[2].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[2].y, '7890');
    assert.equal(commands[3].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[3].y, '9876');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with nested separated coordinates", function() {
    var commands = parser.parse('V123 ,  456  \t,\n7890 \r\n 9876');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[0].y, '123');
    assert.equal(commands[1].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[1].y, '456');
    assert.equal(commands[2].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[2].y, '7890');
    assert.equal(commands[3].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[3].y, '9876');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with multiple command declarations", function() {
    var commands = parser.parse('V123 ,  456  \t,\n7890 \r\n 9876V123 ,  456  \t,\n7890 \r\n 9876');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[0].y, '123');
    assert.equal(commands[1].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[1].y, '456');
    assert.equal(commands[2].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[2].y, '7890');
    assert.equal(commands[3].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[3].y, '9876');
    assert.equal(commands[4].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[4].y, '123');
    assert.equal(commands[5].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[5].y, '456');
    assert.equal(commands[6].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[6].y, '7890');
    assert.equal(commands[7].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[7].y, '9876');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

});

describe("Parsing nested vertical/horizontal commands", function() {
  var parser;

  beforeEach(function() {
    parser = new SVGPathDataParser();
  });

  afterEach(function() {
  });

  it("should work", function() {
    var commands = parser.parse('V100H100v0.12h0.12,V100,h100v-10e-5 H-10e-5');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].y, '100');
    assert.equal(commands[1].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].x, '100');
    assert.equal(commands[2].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[2].relative, true);
    assert.equal(commands[2].y, '0.12');
    assert.equal(commands[3].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[3].relative, true);
    assert.equal(commands[3].x, '0.12');
    assert.equal(commands[4].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[4].relative, false);
    assert.equal(commands[4].y, '100');
    assert.equal(commands[5].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[5].relative, true);
    assert.equal(commands[5].x, '100');
    assert.equal(commands[6].type, SVGPathDataParser.STATE_VERT);
    assert.equal(commands[6].relative, true);
    assert.equal(commands[6].y, '-10e-5');
    assert.equal(commands[7].type, SVGPathDataParser.STATE_HORIZ);
    assert.equal(commands[7].relative, false);
    assert.equal(commands[7].x, '-10e-5');
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

});

