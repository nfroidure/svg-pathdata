function SVGPathData(content) {
  this.commands = SVGPathData.parse(content);
}

SVGPathData.prototype.encode = function() {
  return SVGPathData.encode(this.commands);
};

SVGPathData.prototype.round = function() {
  this.commands = SVGPathData.transform(this.commands,
    SVGPathData.Transformer.ROUND, arguments);
  return this;
};

SVGPathData.prototype.toAbs = function() {
  this.commands = SVGPathData.transform(this.commands,
    SVGPathData.Transformer.TO_ABS);
  return this;
};

SVGPathData.prototype.toRel = function() {
  this.commands = SVGPathData.transform(this.commands,
    SVGPathData.Transformer.TO_REL);
  return this;
};

SVGPathData.prototype.translate = function() {
  this.commands = SVGPathData.transform(this.commands,
    SVGPathData.Transformer.TRANSLATE, arguments);
  return this;
};

SVGPathData.prototype.scale = function() {
  this.commands = SVGPathData.transform(this.commands,
    SVGPathData.Transformer.SCALE, arguments);
  return this;
};

SVGPathData.prototype.rotate = function() {
  this.commands = SVGPathData.transform(this.commands,
    SVGPathData.Transformer.ROTATE, arguments);
  return this;
};

SVGPathData.prototype.matrix = function() {
  this.commands = SVGPathData.transform(this.commands,
    SVGPathData.Transformer.MATRIX, arguments);
  return this;
};

SVGPathData.prototype.skewX = function() {
  this.commands = SVGPathData.transform(this.commands,
    SVGPathData.Transformer.SKEW_X, arguments);
  return this;
};

SVGPathData.prototype.skewY = function() {
  this.commands = SVGPathData.transform(this.commands,
    SVGPathData.Transformer.SKEW_Y, arguments);
  return this;
};

SVGPathData.prototype.xSymetry = function() {
  this.commands = SVGPathData.transform(this.commands,
    SVGPathData.Transformer.X_AXIS_SIMETRY, arguments);
  return this;
};

SVGPathData.prototype.ySymetry = function() {
  this.commands = SVGPathData.transform(this.commands,
    SVGPathData.Transformer.Y_AXIS_SIMETRY, arguments);
  return this;
};

SVGPathData.prototype.aToC = function() {
  this.commands = SVGPathData.transform(this.commands,
    SVGPathData.Transformer.A_TO_C, arguments);
  return this;
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

SVGPathData.transform = function(commands, transformFunction, args) {
  var newCommands = []
    , transformFunction = transformFunction.apply(null, args)
    , curCommands;
  for(var i=0, ii=commands.length; i<ii; i++) {
    curCommands = transformFunction(commands[i]);
    if(curCommands instanceof Array) {
      newCommands = newCommands.concat(curCommands);
    } else {
      newCommands.push(curCommands);
    }
  }
  return newCommands;
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

module.exports = SVGPathData;

// Expose the parser constructor
SVGPathData.Parser = require('./SVGPathDataParser.js');
SVGPathData.Encoder = require('./SVGPathDataEncoder.js');
SVGPathData.Transformer = require('./SVGPathDataTransformer.js');

