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
  this._transformer = transformFunction.apply(null, Array.prototype.slice(arguments,1));
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

// SVG Transforms : http://www.w3.org/TR/SVGTiny12/coords.html#TransformList
// Matrix : http://apike.ca/prog_svg_transform.html
SVGPathDataTransformer.MATRIX = function(a, b, c, d, e, f) {
  if('number' !== typeof a, 'number' !== typeof b,
    'number' !== typeof c, 'number' !== typeof d,
    'number' !== typeof e, 'number' !== typeof f) {
    throw Error('A matrix transformation requires parameters [a,b,c,d,e,f]'
      +' to be set and to be numbers.');
  }
  return function(command) {
    if('undefined' !== command.x) {
      command.x =  command.x * a + command.y * c + e;
    }
    if('undefined' !== command.y) {
      command.y =  command.x * b + command.y * d + f;
    }
    if('undefined' !== command.x1) {
      command.x1 = command.x1 * a + command.y1 * c + e;
    }
    if('undefined' !== command.y1) {
      command.y1 = command.x1 * b + command.y1 * d + f;
    }
    if('undefined' !== command.x2) {
      command.x2 = command.x2 * a + command.y2 * c + e;
    }
    if('undefined' !== command.y2) {
      command.y2 = command.x2 * b + command.y2 * d + f;
    }
    return command;
  };
};

// Rotation
SVGPathDataTransformer.ROTATE = function(a, x, y) {
  return (function(toOrigin, fromOrigin, rotate) {
    return function(command) {
      return fromOrigin(rotate(toOrigin(command)));
    };
  })(SVGPathDataTransformer.TRANSLATE(x || 0, y || 0)
   , SVGPathDataTransformer.TRANSLATE(-(x || 0), -(y || 0))
   , SVGPathDataTransformer.MATRIX(Math.cos(a), Math.sin(a),
      -Math.sin(a), Math.cos(a), 0, 0)
  );
};

// Translation
SVGPathDataTransformer.TRANSLATE = function(dX, dY) {
  if('number' !== typeof dX) {
    throw Error('A translate transformation requires the parameter dX'
      +' to be set and to be a number.');
  }
  return SVGPathDataTransformer.MATRIX(1, 0, 0, 1, dX, dY || 0);
};

// Scaling
SVGPathDataTransformer.SCALE = function(dX, dY) {
  if('number' !== typeof dX) {
    throw Error('A scale transformation requires the parameter dX'
      +' to be set and to be a number.');
  }
  return SVGPathDataTransformer.MATRIX(dX, 0, 0, dY || dX, 0, 0);
};

// Skew
SVGPathDataTransformer.SKEW_X = function(a) {
  if('number' !== typeof a) {
    throw Error('A skewX transformation requires the parameter a'
      +' to be set and to be a number.');
  }
  return SVGPathDataTransformer.MATRIX(1, 0, Math.atan(a), 1, 0, 0);
}
SVGPathDataTransformer.SKEW_Y = function(a) {
  if('number' !== typeof a) {
    throw Error('A skewY transformation requires the parameter a'
      +' to be set and to be a number.');
  }
  return SVGPathDataTransformer.MATRIX(1, Math.atan(a), 0, 1, 0, 0);
}

// Symetry througth the Y axis
SVGPathDataTransformer.Y_AXIS_SIMETRY = function(yDecal) {
  var notFirst = false;
  return function(command) {
    if('undefined' !== command.y) {
      if(notFirst && command.relative) {
        command.y = -command.y;
      } else {
        command.y = yDecal - command.y;
      }
    }
    if('undefined' !== command.y1) {
      if(notFirst && command.relative) {
        command.y1 = -command.y1;
      } else {
        command.y1 = yDecal - command.y1;
      }
    }
    if('undefined' !== command.y2) {
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

