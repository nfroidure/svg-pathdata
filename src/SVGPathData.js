/* eslint-disable new-cap,max-params,func-names */
'use strict';

function SVGPathData(content) {
  this.commands = SVGPathData.parse(content);
}

SVGPathData.prototype = {
  encode() {
    return SVGPathData.encode(this.commands);
  },

  round(x) {
    return this.transform(SVGPathData.Transformer.ROUND(x));
  },

  toAbs() {
    return this.transform(SVGPathData.Transformer.TO_ABS());
  },

  toRel() {
    return this.transform(SVGPathData.Transformer.TO_REL());
  },

  normalizeHVZ(a, b, c) {
    return this.transform(SVGPathData.Transformer.NORMALIZE_HVZ(a, b, c));
  },

  normalizeST() {
    return this.transform(SVGPathData.Transformer.NORMALIZE_ST());
  },

  qtToC() {
    return this.transform(SVGPathData.Transformer.QT_TO_C());
  },

  aToC() {
    return this.transform(SVGPathData.Transformer.A_TO_C());
  },

  sanitize() {
    return this.transform(SVGPathData.Transformer.SANITIZE());
  },

  translate(x, y) {
    return this.transform(SVGPathData.Transformer.TRANSLATE(x, y));
  },

  scale(x, y) {
    return this.transform(SVGPathData.Transformer.SCALE(x, y));
  },

  rotate(a, x, y) {
    return this.transform(SVGPathData.Transformer.ROTATE(a, x, y));
  },

  matrix(a, b, c, d, e, f) {
    return this.transform(SVGPathData.Transformer.MATRIX(a, b, c, d, e, f));
  },

  skewX(a) {
    return this.transform(SVGPathData.Transformer.SKEW_X(a));
  },

  skewY(a) {
    return this.transform(SVGPathData.Transformer.SKEW_Y(a));
  },

  xSymmetry(xOffset) {
    return this.transform(SVGPathData.Transformer.X_AXIS_SYMMETRY(xOffset));
  },

  ySymmetry(yOffset) {
    return this.transform(SVGPathData.Transformer.Y_AXIS_SYMMETRY(yOffset));
  },

  annotateArcs() {
    return this.transform(SVGPathData.Transformer.ANNOTATE_ARCS());
  },

  getBounds() {
    const boundsTransform = SVGPathData.Transformer.CALCULATE_BOUNDS();

    this.transform(boundsTransform);
    return boundsTransform;
  },

  transform(transformFunction) {
    const newCommands = [];

    for(let i = 0; i < this.commands.length; i++) {
      const transformedCommand = transformFunction(this.commands[i]);

      if(transformedCommand instanceof Array) {
        newCommands.push(...transformedCommand);
      } else {
        newCommands.push(transformedCommand);
      }
    }
    this.commands = newCommands;
    return this;
  },
};

// Static methods
SVGPathData.encode = function(commands) {
  let content = '';
  const encoder = new SVGPathData.Encoder();

  encoder.on('readable', () => {
    let str;

    while(null !== (str = encoder.read())) {
      content += str;
    }
  });
  encoder.write(commands);
  encoder.end();
  return content;
};

SVGPathData.parse = function(content) {
  const commands = [];
  const parser = new SVGPathData.Parser();

  parser.on('readable', () => {
    let command;

    while(null !== (command = parser.read())) {
      commands.push(command);
    }
  });
  parser.write(content);
  parser.end();
  return commands;
};

// Commands static vars
SVGPathData.CLOSE_PATH = 1;
SVGPathData.MOVE_TO = 2;
SVGPathData.HORIZ_LINE_TO = 4;
SVGPathData.VERT_LINE_TO = 8;
SVGPathData.LINE_TO = 16;
SVGPathData.CURVE_TO = 32;
SVGPathData.SMOOTH_CURVE_TO = 64;
SVGPathData.QUAD_TO = 128;
SVGPathData.SMOOTH_QUAD_TO = 256;
SVGPathData.ARC = 512;
SVGPathData.LINE_COMMANDS =
  SVGPathData.LINE_TO | SVGPathData.HORIZ_LINE_TO | SVGPathData.VERT_LINE_TO;
SVGPathData.DRAWING_COMMANDS =
  SVGPathData.HORIZ_LINE_TO | SVGPathData.VERT_LINE_TO | SVGPathData.LINE_TO |
  SVGPathData.CURVE_TO | SVGPathData.SMOOTH_CURVE_TO | SVGPathData.QUAD_TO |
  SVGPathData.SMOOTH_QUAD_TO | SVGPathData.ARC;

// Export the main constructor first (tests fail otherwise)
module.exports = SVGPathData;

// Expose the internal constructors
SVGPathData.Parser = require('./SVGPathDataParser.js');
SVGPathData.Encoder = require('./SVGPathDataEncoder.js');
SVGPathData.Transformer = require('./SVGPathDataTransformer.js');
