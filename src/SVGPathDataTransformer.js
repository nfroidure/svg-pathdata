/* eslint new-cap: 0, no-mixed-operators: 0, max-len:0 */
'use strict';

// Transform SVG PathData
// http://www.w3.org/TR/SVG/paths.html#PathDataBNF

// a2c utility
const a2c = require('./a2c.js');

// Access to SVGPathData constructor
const SVGPathData = require('./SVGPathData.js');

// TransformStream inherance required modules
const TransformStream = require('readable-stream').Transform;
const util = require('util');

// Inherit of transform stream
util.inherits(SVGPathDataTransformer, TransformStream);

function SVGPathDataTransformer(transformFunction) {
  // Ensure new were used
  if(!(this instanceof SVGPathDataTransformer)) {
    return new (SVGPathDataTransformer.bind(...[SVGPathDataTransformer].concat([].slice.call(arguments, 0))))();
  }

  // Transform function needed
  if('function' !== typeof transformFunction) {
    throw new Error('Please provide a transform callback to receive commands.');
  }
  this._transformer = transformFunction(...[].slice.call(arguments, 1));
  if('function' !== typeof this._transformer) {
    throw new Error('Please provide a valid transform (returning a function).');
  }

  // Parent constructor
  TransformStream.call(this, {
    objectMode: true,
  });
}

SVGPathDataTransformer.prototype._transform = function(commands, encoding, done) {
  let i;
  let j;

  if(!(commands instanceof Array)) {
    commands = [commands];
  }
  for(i = 0, j = commands.length; i < j; i++) {
    this.push(this._transformer(commands[i]));
  }
  done();
};

// Predefined transforming functions
// Rounds commands values
SVGPathDataTransformer.ROUND = function roundGenerator(roundVal) {
  roundVal = roundVal || 10e12;
  return function round(command) {
    // x1/y1 values
    if('undefined' !== typeof command.x1) {
      command.x1 = Math.round(command.x1 * roundVal) / roundVal;
    }
    if('undefined' !== typeof command.y1) {
      command.y1 = Math.round(command.y1 * roundVal) / roundVal;
    }
    // x2/y2 values
    if('undefined' !== typeof command.x2) {
      command.x2 = Math.round(command.x2 * roundVal) / roundVal;
    }
    if('undefined' !== typeof command.y2) {
      command.y2 = Math.round(command.y2 * roundVal) / roundVal;
    }
    // Finally x/y values
    if('undefined' !== typeof command.x) {
      command.x = Math.round(command.x * roundVal, 12) / roundVal;
    }
    if('undefined' !== typeof command.y) {
      command.y = Math.round(command.y * roundVal, 12) / roundVal;
    }
    return command;
  };
};

// Relative to absolute commands
SVGPathDataTransformer.TO_ABS = function toAbsGenerator() {
  let prevX = 0;
  let prevY = 0;
  let pathStartX = NaN;
  let pathStartY = NaN;

  return function toAbs(command) {
    if(isNaN(pathStartX) && !(command.type & SVGPathData.MOVE_TO)) {
      throw new Error('path must start with moveto');
    }
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
    if(command.type & SVGPathData.CLOSE_PATH) {
      prevX = pathStartX;
      prevY = pathStartY;
    }
    prevX = ('undefined' !== typeof command.x ? command.x : prevX);
    prevY = ('undefined' !== typeof command.y ? command.y : prevY);

    if(command.type & SVGPathData.MOVE_TO) {
      pathStartX = prevX;
      pathStartY = prevY;
    }
    return command;
  };
};

// Absolute to relative commands
SVGPathDataTransformer.TO_REL = function toRelGenerator() {
  let prevX = 0;
  let prevY = 0;

  return function toRel(command) {
    if(!command.relative) {
      // x1/y1 values
      if('undefined' !== typeof command.x1) {
        command.x1 -= prevX;
      }
      if('undefined' !== typeof command.y1) {
        command.y1 -= prevY;
      }
      // x2/y2 values
      if('undefined' !== typeof command.x2) {
        command.x2 -= prevX;
      }
      if('undefined' !== typeof command.y2) {
        command.y2 -= prevY;
      }
      // Finally x/y values
      if('undefined' !== typeof command.x) {
        command.x -= prevX;
      }
      if('undefined' !== typeof command.y) {
        command.y -= prevY;
      }
      command.relative = true;
    }
    prevX = ('undefined' !== typeof command.x ? prevX + command.x : prevX);
    prevY = ('undefined' !== typeof command.y ? prevY + command.y : prevY);
    return command;
  };
};

// Convert H, V, Z and A with rX = 0 to L
SVGPathDataTransformer.NORMALIZE_HVZ = function normalizeHVZGenerator() {
  let prevX = 0;
  let prevY = 0;
  let pathStartX = NaN;
  let pathStartY = NaN;

  return function normalizeHVZ(command) {
    if(isNaN(pathStartX) && !(command.type & SVGPathData.MOVE_TO)) {
      throw new Error('path must start with moveto');
    }
    if(command.type & SVGPathData.HORIZ_LINE_TO) {
      command.type = SVGPathData.LINE_TO;
      command.y = command.relative ? 0 : prevY;
    }
    if(command.type & SVGPathData.VERT_LINE_TO) {
      command.type = SVGPathData.LINE_TO;
      command.x = command.relative ? 0 : prevX;
    }
    if(command.type & SVGPathData.CLOSE_PATH) {
      command.type = SVGPathData.LINE_TO;
      command.x = command.relative ? pathStartX - prevX : pathStartX;
      command.y = command.relative ? pathStartY - prevY : pathStartY;
    }
    if(command.type & SVGPathData.ARC && (0 === command.rX || 0 === command.rY)) {
      command.type = SVGPathData.LINE_TO;
      delete command.rX;
      delete command.rY;
      delete command.xRot;
      delete command.lArcFlag;
      delete command.sweepFlag;
    }
    // all commands have x and y now
    prevX = (command.relative ? prevX + command.x : command.x);
    prevY = (command.relative ? prevY + command.y : command.y);

    if(command.type & SVGPathData.MOVE_TO) {
      pathStartX = prevX;
      pathStartY = prevY;
    }

    return command;
  };
};

/*
 * Transforms smooth curves and quads to normal curves and quads (SsTt to CcQq)
 */
SVGPathDataTransformer.NORMALIZE_ST = function normalizeCurvesGenerator() {
  let prevX = 0;
  let prevY = 0;
  let pathStartX = NaN;
  let pathStartY = NaN;
  let prevCurveC2X = NaN;
  let prevCurveC2Y = NaN;
  let prevQuadCX = NaN;
  let prevQuadCY = NaN;

  return function normalizeCurves(command) {
    if(isNaN(pathStartX) && !(command.type & SVGPathData.MOVE_TO)) {
      throw new Error('path must start with moveto');
    }
    if(command.type & SVGPathData.SMOOTH_CURVE_TO) {
      command.type = SVGPathData.CURVE_TO;
      prevCurveC2X = isNaN(prevCurveC2X) ? prevX : prevCurveC2X;
      prevCurveC2Y = isNaN(prevCurveC2Y) ? prevY : prevCurveC2Y;
      command.x1 = command.relative ? prevX - prevCurveC2X : 2 * prevX - prevCurveC2X;
      command.y1 = command.relative ? prevY - prevCurveC2Y : 2 * prevY - prevCurveC2Y;
    }
    if(command.type & SVGPathData.CURVE_TO) {
      prevCurveC2X = command.relative ? prevX + command.x2 : command.x2;
      prevCurveC2Y = command.relative ? prevY + command.y2 : command.y2;
    } else {
      prevCurveC2X = NaN;
      prevCurveC2Y = NaN;
    }
    if(command.type & SVGPathData.SMOOTH_QUAD_TO) {
      command.type = SVGPathData.QUAD_TO;
      prevQuadCX = isNaN(prevQuadCX) ? prevX : prevQuadCX;
      prevQuadCY = isNaN(prevQuadCY) ? prevY : prevQuadCY;
      command.x1 = command.relative ? prevX - prevQuadCX : 2 * prevX - prevQuadCX;
      command.y1 = command.relative ? prevY - prevQuadCY : 2 * prevY - prevQuadCY;
    }
    if(command.type & SVGPathData.QUAD_TO) {
      prevQuadCX = command.relative ? prevX + command.x1 : command.x1;
      prevQuadCY = command.relative ? prevY + command.y1 : command.y1;
    } else {
      prevQuadCX = NaN;
      prevQuadCY = NaN;
    }


    if(command.type & SVGPathData.CLOSE_PATH) {
      prevX = pathStartX;
      prevY = pathStartY;
    }
    prevX = 'undefined' === typeof command.x ? prevX :
      (command.relative ? prevX + command.x : command.x);
    prevY = 'undefined' === typeof command.y ? prevY :
      (command.relative ? prevY + command.y : command.y);

    if(command.type & SVGPathData.MOVE_TO) {
      pathStartX = prevX;
      pathStartY = prevY;
    }

    return command;
  };
};

/*
 * A quadratic bézier curve can be represented by a cubic bézier curve which has
 * the same end points as the quadratic and both control points in place of the
 * quadratic's one.
 *
 * This transformer replaces QqTt commands with Cc commands respectively.
 * This is useful for reading path data into a system which only has a
 * representation for cubic curves.
 */
SVGPathDataTransformer.QT_TO_C = function qtToCGenerator() {
  let prevX = 0;
  let prevY = 0;
  let pathStartX = NaN;
  let pathStartY = NaN;
  let prevQuadX1 = NaN;
  let prevQuadY1 = NaN;

  return function qtToC(command) {
    if(isNaN(pathStartX) && !(command.type & SVGPathData.MOVE_TO)) {
      throw new Error('path must start with moveto');
    }
    if(command.type & SVGPathData.SMOOTH_QUAD_TO) {
      command.type = SVGPathData.QUAD_TO;
      prevQuadX1 = isNaN(prevQuadX1) ? prevX : prevQuadX1;
      prevQuadY1 = isNaN(prevQuadY1) ? prevY : prevQuadY1;
      command.x1 = command.relative ? prevX - prevQuadX1 : 2 * prevX - prevQuadX1;
      command.y1 = command.relative ? prevY - prevQuadY1 : 2 * prevY - prevQuadY1;
    }
    if(command.type & SVGPathData.QUAD_TO) {
      prevQuadX1 = command.relative ? prevX + command.x1 : command.x1;
      prevQuadY1 = command.relative ? prevY + command.y1 : command.y1;
      const x1 = command.x1;
      const y1 = command.y1;

      command.type = SVGPathData.CURVE_TO;
      command.x1 = ((command.relative ? 0 : prevX) * 2 + x1) / 3;
      command.y1 = ((command.relative ? 0 : prevY) * 2 + y1) / 3;
      command.x2 = (command.x * 2 + x1) / 3;
      command.y2 = (command.y * 2 + y1) / 3;
    } else {
      prevQuadX1 = NaN;
      prevQuadY1 = NaN;
    }


    if(command.type & SVGPathData.CLOSE_PATH) {
      prevX = pathStartX;
      prevY = pathStartY;
    }
    prevX = 'undefined' === typeof command.x ? prevX :
      (command.relative ? prevX + command.x : command.x);
    prevY = 'undefined' === typeof command.y ? prevY :
      (command.relative ? prevY + command.y : command.y);

    if(command.type & SVGPathData.MOVE_TO) {
      pathStartX = prevX;
      pathStartY = prevY;
    }

    return command;
  };
};

/*
 * remove 0-length segments
 */
SVGPathDataTransformer.SANITIZE = function sanitizeGenerator() {
  let prevX = 0;
  let prevY = 0;
  let pathStartX = NaN;
  let pathStartY = NaN;
  let prevCurveC2X = NaN;
  let prevCurveC2Y = NaN;
  let prevQuadCX = NaN;
  let prevQuadCY = NaN;

  return function sanitize(command) {
    let skip = false;
    let x1Rel = 0;
    let y1Rel = 0;

    if(isNaN(pathStartX) && !(command.type & SVGPathData.MOVE_TO)) {
      throw new Error('path must start with moveto');
    }

    if(command.type & SVGPathData.SMOOTH_CURVE_TO) {
      x1Rel = isNaN(prevCurveC2X) ? 0 : prevX - prevCurveC2X;
      y1Rel = isNaN(prevCurveC2Y) ? 0 : prevY - prevCurveC2Y;
    }
    if(command.type & (SVGPathData.CURVE_TO | SVGPathData.SMOOTH_CURVE_TO)) {
      prevCurveC2X = command.relative ? prevX + command.x2 : command.x2;
      prevCurveC2Y = command.relative ? prevY + command.y2 : command.y2;
    } else {
      prevCurveC2X = NaN;
      prevCurveC2Y = NaN;
    }
    if(command.type & SVGPathData.SMOOTH_QUAD_TO) {
      prevQuadCX = isNaN(prevQuadCX) ? prevX : 2 * prevX - prevQuadCX;
      prevQuadCY = isNaN(prevQuadCY) ? prevY : 2 * prevY - prevQuadCY;
    } else if(command.type & SVGPathData.QUAD_TO) {
      prevQuadCX = command.relative ? prevX + command.x1 : command.x1;
      prevQuadCY = command.relative ? prevY + command.y1 : command.y2;
    } else {
      prevQuadCX = NaN;
      prevQuadCY = NaN;
    }

    if(command.type & SVGPathData.LINE_COMMANDS ||
      command.type & SVGPathData.ARC && (0 === command.rX || 0 === command.rY || !command.lArcFlag) ||
      command.type & SVGPathData.CURVE_TO || command.type & SVGPathData.SMOOTH_CURVE_TO ||
      command.type & SVGPathData.QUAD_TO || command.type & SVGPathData.SMOOTH_QUAD_TO) {
      const xRel = 'undefined' === typeof command.x ? 0 :
        (command.relative ? command.x : command.x - prevX);
      const yRel = 'undefined' === typeof command.y ? 0 :
        (command.relative ? command.y : command.y - prevY);

      x1Rel = !isNaN(prevQuadCX) ? prevQuadCX - prevX :
        'undefined' === typeof command.x1 ? x1Rel :
          command.relative ? command.x :
            command.x1 - prevX;
      y1Rel = !isNaN(prevQuadCY) ? prevQuadCY - prevY :
        'undefined' === typeof command.y1 ? y1Rel :
          command.relative ? command.y :
            command.y1 - prevY;

      const x2Rel = 'undefined' === typeof command.x2 ? 0 :
        (command.relative ? command.x : command.x2 - prevX);
      const y2Rel = 'undefined' === typeof command.y2 ? 0 :
        (command.relative ? command.y : command.y2 - prevY);

      if(0 === xRel && 0 === yRel && 0 === x1Rel && 0 === y1Rel && 0 === x2Rel && 0 === y2Rel) {
        skip = true;
      }
    }

    if(command.type & SVGPathData.CLOSE_PATH) {
      if(prevX === pathStartX && prevY === pathStartY) {
        skip = true;
      } else {
        prevX = pathStartX;
        prevY = pathStartY;
      }
    }
    prevX = 'undefined' === typeof command.x ? prevX :
      (command.relative ? prevX + command.x : command.x);
    prevY = 'undefined' === typeof command.y ? prevY :
      (command.relative ? prevY + command.y : command.y);

    if(command.type & SVGPathData.MOVE_TO) {
      pathStartX = prevX;
      pathStartY = prevY;
    }

    return skip ? [] : command;
  };
};

// SVG Transforms : http://www.w3.org/TR/SVGTiny12/coords.html#TransformList
// Matrix : http://apike.ca/prog_svg_transform.html
// eslint-disable-next-line
SVGPathDataTransformer.MATRIX = function matrixGenerator(a, b, c, d, e, f) {
  let prevX;
  let prevY;

  if('number' !== typeof a || 'number' !== typeof b ||
    'number' !== typeof c || 'number' !== typeof d ||
    'number' !== typeof e || 'number' !== typeof f) {
    throw new Error('A matrix transformation requires parameters' +
      ' [a,b,c,d,e,f] to be set and to be numbers.');
  }
  return function matrix(command) {
    const origX = command.x;
    const origX1 = command.x1;
    const origX2 = command.x2;

    if('undefined' !== typeof command.x) {
      command.x = (command.x * a) +
        ('undefined' !== typeof command.y ?
          command.y : (command.relative ? 0 : prevY || 0)
        ) * c +
        (command.relative && 'undefined' !== typeof prevX ? 0 : e);
    }
    if('undefined' !== typeof command.y) {
      command.y = ('undefined' !== typeof origX ?
          origX : (command.relative ? 0 : prevX || 0)
        ) * b +
        command.y * d +
        (command.relative && 'undefined' !== typeof prevY ? 0 : f);
    }
    if('undefined' !== typeof command.x1) {
      command.x1 = command.x1 * a + command.y1 * c +
        (command.relative && 'undefined' !== typeof prevX ? 0 : e);
    }
    if('undefined' !== typeof command.y1) {
      command.y1 = origX1 * b + command.y1 * d +
        (command.relative && 'undefined' !== typeof prevY ? 0 : f);
    }
    if('undefined' !== typeof command.x2) {
      command.x2 = command.x2 * a + command.y2 * c +
        (command.relative && 'undefined' !== typeof prevX ? 0 : e);
    }
    if('undefined' !== typeof command.y2) {
      command.y2 = origX2 * b + command.y2 * d +
        (command.relative && 'undefined' !== typeof prevY ? 0 : f);
    }
    function sq(x) { return x * x; }
    const det = a * d - b * c;

    if('undefined' !== typeof command.xRot) {
      // Skip if this is a pure translation
      if(1 !== a || 0 !== b || 0 !== c || 1 !== d) {
        // Special case for singular matrix
        if(0 === det) {
          // In the singular case, the arc is compressed to a line. The actual geometric image of the original
          // curve under this transform possibly extends beyond the starting and/or ending points of the segment, but
          // for simplicity we ignore this detail and just replace this command with a single line segment.
          delete command.rX;
          delete command.rY;
          delete command.xRot;
          delete command.lArcFlag;
          delete command.sweepFlag;
          command.type = SVGPathData.LINE_TO;
        } else {
          // Convert to radians
          const xRot = command.xRot * Math.PI / 180;

          // Convert rotated ellipse to general conic form
          // x0^2/rX^2 + y0^2/rY^2 - 1 = 0
          // x0 = x*cos(xRot) + y*sin(xRot)
          // y0 = -x*sin(xRot) + y*cos(xRot)
          // --> A*x^2 + B*x*y + C*y^2 - 1 = 0, where
          const sinRot = Math.sin(xRot);
          const cosRot = Math.cos(xRot);
          const xCurve = 1 / sq(command.rX);
          const yCurve = 1 / sq(command.rY);
          const A = sq(cosRot) * xCurve + sq(sinRot) * yCurve;
          const B = 2 * sinRot * cosRot * (xCurve - yCurve);
          const C = sq(sinRot) * xCurve + sq(cosRot) * yCurve;

          // Apply matrix to A*x^2 + B*x*y + C*y^2 - 1 = 0
          // x1 = a*x + c*y
          // y1 = b*x + d*y
          //      (we can ignore e and f, since pure translations don't affect the shape of the ellipse)
          // --> A1*x1^2 + B1*x1*y1 + C1*y1^2 - det^2 = 0, where
          const A1 = A * d * d - B * b * d + C * b * b;
          const B1 = B * (a * d + b * c) - 2 * (A * c * d + C * a * b);
          const C1 = A * c * c - B * a * c + C * a * a;

          // Unapply newXRot to get back to axis-aligned ellipse equation
          // x1 = x2*cos(newXRot) - y2*sin(newXRot)
          // y1 = x2*sin(newXRot) + y2*cos(newXRot)
          // A1*x1^2 + B1*x1*y1 + C1*y1^2 - det^2 =
          //   x2^2*(A1*cos(newXRot)^2 + B1*sin(newXRot)*cos(newXRot) + C1*sin(newXRot)^2)
          //   + x2*y2*(2*(C1 - A1)*sin(newXRot)*cos(newXRot) + B1*(cos(newXRot)^2 - sin(newXRot)^2))
          //   + y2^2*(A1*sin(newXRot)^2 - B1*sin(newXRot)*cos(newXRot) + C1*cos(newXRot)^2)
          //   (which must have the same zeroes as)
          // x2^2/newRX^2 + y2^2/newRY^2 - 1
          //   (so we have)
          // 2*(C1 - A1)*sin(newXRot)*cos(newXRot) + B1*(cos(newXRot)^2 - sin(newXRot)^2) = 0
          // (A1 - C1)*sin(2*newXRot) = B1*cos(2*newXRot)
          // 2*newXRot = atan2(B1, A1 - C1)
          const newXRot = ((Math.atan2(B1, A1 - C1) + Math.PI) % Math.PI) / 2;
          // For any integer n, (atan2(B1, A1 - C1) + n*pi)/2 is a solution to the above; incrementing n just swaps the
          // x and y radii computed below (since that's what rotating an ellipse by pi/2 does).  Choosing the rotation
          // between 0 and pi/2 eliminates the ambiguity and leads to more predictable output.

          // Finally, we get newRX and newRY from the same-zeroes relationship that gave us newXRot
          const newSinRot = Math.sin(newXRot);
          const newCosRot = Math.cos(newXRot);

          command.rX = Math.abs(det) / Math.sqrt(A1 * sq(newCosRot) + B1 * newSinRot * newCosRot + C1 * sq(newSinRot));
          command.rY = Math.abs(det) / Math.sqrt(A1 * sq(newSinRot) - B1 * newSinRot * newCosRot + C1 * sq(newCosRot));
          command.xRot = newXRot * 180 / Math.PI;
        }
      }
    }
    // sweepFlag needs to be inverted when mirroring shapes
    // see http://www.itk.ilstu.edu/faculty/javila/SVG/SVG_drawing1/elliptical_curve.htm
    // m 65,10 a 50,25 0 1 0 50,25
    // M 65,60 A 50,25 0 1 1 115,35
    if('undefined' !== typeof command.sweepFlag) {
      command.sweepFlag = (command.sweepFlag + (0 <= det ? 0 : 1)) % 2;
    }

    prevX = ('undefined' !== typeof command.x ?
      (command.relative ? (prevX || 0) + command.x : command.x) :
      prevX || 0);
    prevY = ('undefined' !== typeof command.y ?
      (command.relative ? (prevY || 0) + command.y : command.y) :
      prevY || 0);
    return command;
  };
};

// Rotation
SVGPathDataTransformer.ROTATE = function rotateGenerator(a, x, y) {
  if('number' !== typeof a) {
    throw new Error('A rotate transformation requires the parameter a' +
      ' to be set and to be a number.');
  }
  return (function(toOrigin, doRotate, fromOrigin) {
    return function rotate(command) {
      return fromOrigin(doRotate(toOrigin(command)));
    };
  }(SVGPathDataTransformer.TRANSLATE(-(x || 0), -(y || 0)),
    SVGPathDataTransformer.MATRIX(Math.cos(a), Math.sin(a),
      -Math.sin(a), Math.cos(a), 0, 0),
    SVGPathDataTransformer.TRANSLATE(x || 0, y || 0)
  ));
};

// Translation
SVGPathDataTransformer.TRANSLATE = function translateGenerator(dX, dY) {
  if('number' !== typeof dX) {
    throw new Error('A translate transformation requires the parameter dX' +
      ' to be set and to be a number.');
  }
  return SVGPathDataTransformer.MATRIX(1, 0, 0, 1, dX, dY || 0);
};

// Scaling
SVGPathDataTransformer.SCALE = function scaleGenerator(dX, dY) {
  if('number' !== typeof dX) {
    throw new Error('A scale transformation requires the parameter dX' +
      ' to be set and to be a number.');
  }
  return SVGPathDataTransformer.MATRIX(dX, 0, 0, dY || dX, 0, 0);
};

// Skew
SVGPathDataTransformer.SKEW_X = function skewXGenerator(a) {
  if('number' !== typeof a) {
    throw new Error('A skewX transformation requires the parameter x' +
      ' to be set and to be a number.');
  }
  return SVGPathDataTransformer.MATRIX(1, 0, Math.atan(a), 1, 0, 0);
};
SVGPathDataTransformer.SKEW_Y = function skewYGenerator(a) {
  if('number' !== typeof a) {
    throw new Error('A skewY transformation requires the parameter y' +
      ' to be set and to be a number.');
  }
  return SVGPathDataTransformer.MATRIX(1, Math.atan(a), 0, 1, 0, 0);
};

// Symmetry througth the X axis
SVGPathDataTransformer.X_AXIS_SYMMETRY = function xSymmetryGenerator(xDecal) {
  return (function(toAbs, scale, translate) {
    return function xSymmetry(command) {
      return translate(scale(toAbs(command)));
    };
  }(SVGPathDataTransformer.TO_ABS(),
    SVGPathDataTransformer.SCALE(-1, 1),
    SVGPathDataTransformer.TRANSLATE(xDecal || 0, 0)
  ));
};

// Symmetry througth the Y axis
SVGPathDataTransformer.Y_AXIS_SYMMETRY = function ySymmetryGenerator(yDecal) {
  return (function(toAbs, scale, translate) {
    return function ySymmetry(command) {
      return translate(scale(toAbs(command)));
    };
  }(SVGPathDataTransformer.TO_ABS(),
    SVGPathDataTransformer.SCALE(1, -1),
    SVGPathDataTransformer.TRANSLATE(0, yDecal || 0)
  ));
};

// Convert arc commands to curve commands
SVGPathDataTransformer.A_TO_C = function a2CGenerator() {
  let prevX = 0;
  let prevY = 0;
  let args;

  return (function(toAbs) {
    return function a2C(command) {
      const commands = [];
      let i;
      let ii;

      command = toAbs(command);
      if(command.type === SVGPathData.ARC) {
        args = a2c(prevX, prevY, command.rX, command.rX, command.xRot,
          command.lArcFlag, command.sweepFlag, command.x, command.y);
        prevX = command.x; prevY = command.y;
        for(i = 0, ii = args.length; i < ii; i += 6) {
          commands.push({
            type: SVGPathData.CURVE_TO,
            relative: false,
            x1: args[i],
            y1: args[i + 1],
            x2: args[i + 2],
            y2: args[i + 3],
            x: args[i + 4],
            y: args[i + 5],
          });
        }
        return commands;
      }
      prevX = command.x; prevY = command.y;
      return command;

    };
  }(SVGPathDataTransformer.TO_ABS()));
};

module.exports = SVGPathDataTransformer;
