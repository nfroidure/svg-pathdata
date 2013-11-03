var assert = chai.assert;

describe("Parsing close path commands", function() {
  var parser;

  beforeEach(function() {
    parser = new SVGPathDataParser();
  });

  afterEach(function() {
  });

  it("should work", function() {
    var commands = parser.parse('Z');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_CLOSEPATH);
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with spaces before", function() {
    var commands = parser.parse('   Z');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_CLOSEPATH);
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work with spaces after", function() {
    var commands = parser.parse('   Z');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_CLOSEPATH);
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work before a command sequence", function() {
    var commands = parser.parse(' Z M10,10 L10,10, H10, V10');
    assert.equal(commands[0].type, SVGPathDataParser.STATE_CLOSEPATH);
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work after a command sequence", function() {
    var commands = parser.parse('M10,10 L10,10, H10, V10 Z');
    assert.equal(commands[4].type, SVGPathDataParser.STATE_CLOSEPATH);
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

  it("should work in a command sequence", function() {
    var commands = parser.parse('M10,10 L10,10, H10, V10 Z M10,10 L10,10, H10, V10');
    assert.equal(commands[4].type, SVGPathDataParser.STATE_CLOSEPATH);
    assert.equal(parser.state, SVGPathDataParser.STATE_ENDED);
  });

});
