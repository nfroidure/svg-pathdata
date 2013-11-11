// Transform SVG PathData
// http://www.w3.org/TR/SVG/paths.html#PathDataBNF

// Access to SVGPathData constructor
var SVGPathData = require('./SVGPathData.js')

// TransformStream inherance required modules
  , TransformStream = require('stream').Transform
  , util = require('util')
;

// Inherit of transform stream
util.inherits(SVGPathDataTransformer, TransformStream);
  
function SVGPathDataTransformer(transformFunction) {
  // Ensure new were used
  if(!(this instanceof SVGPathDataTransformer)) {
    throw Error('Please use the "new" operator to instanciate an \
      SVGPathDataTransformer.');
  }

  // Transform function needed
  if('function' !== typeof transformFunction) {
    throw Error('Please provide a transform callback to receive commands.')
  }
  this._transformer = transformFunction();
  if('function' !== typeof this._transformer) {
    throw Error('Please provide a valid transform (returning a function).')
  }

  // Parent constructor
  TransformStream.call(this, {
    objectMode: true
  });
}

SVGPathDataTransformer.prototype._transform = function(command, encoding, done) {
  this.push(this._transformer(command));
  done();
};

// Predefined transforming functions
// Relative to absolute commands
SVGPathDataTransformer.TO_ABS = function() {
  var prevX = 0, prevY = 0;
  return function(command) {
    if(command.relative) {
      // x1/y1 values
      if('undefined' !== typeof command.x1) {
        command.x1 = prevX + command.x1;
      }
      if('undefined' !== typeof command.y1) {
        command.y1 = prevY + command.y1;
      }
      // x2/y2 values
      if('undefined' !== typeof command.x2) {
        command.x2 = prevX + command.x2;
      }
      if('undefined' !== typeof command.y2) {
        command.y2 = prevY + command.y2;
      }
      // Finally x/y values
      if('undefined' !== typeof command.x) {
        command.x = prevX + command.x;
      }
      if('undefined' !== typeof command.y) {
        command.y = prevY + command.y;
      }
      command.relative = false;
    }
    prevX = ('undefined' !== typeof command.x ? command.x : prevX);
    prevY = ('undefined' !== typeof command.y ? command.y : prevY);
    return command;
  };
};

// Absolute to relative commands
SVGPathDataTransformer.TO_REL = function() {
  var prevX = 0, prevY = 0;
  return function(command) {
    if(!command.relative) {
      // x1/y1 values
      if('undefined' !== typeof command.x1) {
        command.x1 = command.x1 - prevX;
      }
      if('undefined' !== typeof command.y1) {
        command.y1 = command.y1 - prevY;
      }
      // x2/y2 values
      if('undefined' !== typeof command.x2) {
        command.x2 = command.x2 - prevX;
      }
      if('undefined' !== typeof command.y2) {
        command.y2 = command.y2 - prevY;
      }
      // Finally x/y values
      if('undefined' !== typeof command.x) {
        command.x = command.x - prevX;
      }
      if('undefined' !== typeof command.y) {
        command.y = command.y - prevY;
      }
    command.relative = true;
    }
    prevX = ('undefined' !== typeof command.x ? prevX + command.x : prevX);
    prevY = ('undefined' !== typeof command.y ? prevY + command.y : prevY);
    return command;
  };
};

// Symetry througth the Y axis
SVGPathDataTransformer.Y_AXIS_SIMETRY = function(yDecal) {
  var notFirst = false;
  return function(command) {
    if('undefined' !== command.y && command.y !== 0) {
      if(notFirst && command.relative) {
        command.y = -command.y;
      } else {
        command.y = yDecal - command.y;
      }
    }
    if('undefined' !== command.y1 && command.y1 !== 0) {
      if(notFirst && command.relative) {
        command.y1 = -command.y1;
      } else {
        command.y1 = yDecal - command.y1;
      }
    }
    if('undefined' !== command.y2 && command.y2 !== 0) {
      if(notFirst && command.relative) {
        command.y2 = -command.y2;
      } else {
        command.y2 = yDecal - command.y2;
      }
    }
    notFirst = true;
    return command;
  };
};

module.exports = SVGPathDataTransformer;

