function SVGPathData(content) {
  this.commands = SVGPathData.parse(content);
}

SVGPathData.prototype.encode = function() {
  return SVGPathData.encode(this.commands);
};

SVGPathData.prototype.round = function() {
  return this.transform(SVGPathData.Transformer.ROUND, arguments);
};

SVGPathData.prototype.toAbs = function() {
  return this.transform(SVGPathData.Transformer.TO_ABS);
};

SVGPathData.prototype.toRel = function() {
  return this.transform(SVGPathData.Transformer.TO_REL);
};

SVGPathData.prototype.translate = function() {
  return this.transform(SVGPathData.Transformer.TRANSLATE, arguments);
};

SVGPathData.prototype.scale = function() {
  return this.transform(SVGPathData.Transformer.SCALE, arguments);
};

SVGPathData.prototype.rotate = function() {
  return this.transform(SVGPathData.Transformer.ROTATE, arguments);
};

SVGPathData.prototype.matrix = function() {
  return this.transform(SVGPathData.Transformer.MATRIX, arguments);
};

SVGPathData.prototype.skewX = function() {
  return this.transform(SVGPathData.Transformer.SKEW_X, arguments);
};

SVGPathData.prototype.skewY = function() {
  return this.transform(SVGPathData.Transformer.SKEW_Y, arguments);
};

SVGPathData.prototype.xSymetry = function() {
  return this.transform(SVGPathData.Transformer.X_AXIS_SIMETRY, arguments);
};

SVGPathData.prototype.ySymetry = function() {
  return this.transform(SVGPathData.Transformer.Y_AXIS_SIMETRY, arguments);
};

SVGPathData.prototype.aToC = function() {
  return this.transform(SVGPathData.Transformer.A_TO_C, arguments);
};

// Static methods
SVGPathData.encode = function(commands) {
  var content = '', encoder = new SVGPathData.Encoder();
  encoder.on('data', function (str) {
    content += str;
  });
  encoder.write(commands);
  encoder.end();
  return content;
};

SVGPathData.parse = function(content) {
  var commands = [], parser = new SVGPathData.Parser();
  parser.on('data', function (command) {
    commands.push(command);
  });
  parser.write(content);
  parser.end();
  return commands;
};

SVGPathData.prototype.transform = function(transformFunction, args) {
  var newCommands = []
    , transformFunction = transformFunction.apply(null, args)
    , curCommands = []
    , commands = this.commands;
  for(var i=0, ii=commands.length; i<ii; i++) {
    curCommands = transformFunction(commands[i]);
    if(curCommands instanceof Array) {
      newCommands = newCommands.concat(curCommands);
    } else {
      newCommands.push(curCommands);
    }
  }
  this.commands = newCommands;
  return this;
};

// Commands static vars
SVGPathData.CLOSE_PATH = 1;
SVGPathData.MOVE_TO = 2;
SVGPathData.HORIZ_LINE_TO = 3;
SVGPathData.VERT_LINE_TO = 4;
SVGPathData.LINE_TO = 5;
SVGPathData.CURVE_TO = 6;
SVGPathData.SMOOTH_CURVE_TO = 7;
SVGPathData.QUAD_TO = 8;
SVGPathData.SMOOTH_QUAD_TO = 9;
SVGPathData.ARC = 10;

// Export the main contructor first (tests are failing otherwise)
module.exports = SVGPathData;

// Expose the internal constructors
SVGPathData.Parser = require('./SVGPathDataParser.js');
SVGPathData.Encoder = require('./SVGPathDataEncoder.js');
SVGPathData.Transformer = require('./SVGPathDataTransformer.js');

