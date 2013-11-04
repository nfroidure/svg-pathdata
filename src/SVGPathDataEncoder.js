// Encode SVG PathData
// http://www.w3.org/TR/SVG/paths.html#PathDataBNF

// Parse SVG PathData
// http://www.w3.org/TR/SVG/paths.html#PathDataBNF

// Access to SVGPathData constructor
var SVGPathData = require('./SVGPathData.js');

// Private consts : Char groups
var WSP = ' ';
  
function SVGPathDataEncoder(outputCallback) {
  // Callback needed
  if('function' !== typeof outputCallback) {
    throw Error('Please provide a callback to receive output.')
  }
  this.write = function(commands) {
    if(!(commands instanceof Array)) {
      commands = [commands];
    }
    for(var i=0, j=commands.length; i<j; i++) {
      // Horizontal move to command
      if(commands[i].type === SVGPathData.CLOSE_PATH) {
        outputCallback('z');
        continue;v
      // Horizontal move to command
      } else if(commands[i].type === SVGPathData.HORIZ_LINE_TO) {
        outputCallback((commands[i].relative?'h':'H')
          + commands[i].x);
      // Vertical move to command
      } else if(commands[i].type === SVGPathData.VERT_LINE_TO) {
        outputCallback((commands[i].relative?'v':'V')
          + commands[i].y);
      // Move to command
      } else if(commands[i].type === SVGPathData.MOVE_TO) {
        outputCallback((commands[i].relative?'m':'M')
          + commands[i].x + WSP + commands[i].y);
      // Line to command
      } else if(commands[i].type === SVGPathData.LINE_TO) {
        outputCallback((commands[i].relative?'l':'L')
          + commands[i].x + WSP + commands[i].y);
      // Curve to command
      } else if(commands[i].type === SVGPathData.CURVE_TO) {
        outputCallback((commands[i].relative?'c':'C')
          + commands[i].x2 + WSP + commands[i].y2
          + WSP + commands[i].x1 + WSP + commands[i].y1
          + WSP + commands[i].x + WSP + commands[i].y);
      // Smooth curve to command
      } else if(commands[i].type === SVGPathData.SMOOTH_CURVE_TO) {
        outputCallback((commands[i].relative?'s':'S')
          + commands[i].x2 + WSP + commands[i].y2
          + WSP + commands[i].x + WSP + commands[i].y);
      // Quadratic bezier curve to command
      } else if(commands[i].type === SVGPathData.QUAD_TO) {
        outputCallback((commands[i].relative?'q':'Q')
          + commands[i].x1 + WSP + commands[i].y1
          + WSP + commands[i].x + WSP + commands[i].y);
      // Smooth quadratic bezier curve to command
      } else if(commands[i].type === SVGPathData.SMOOTH_QUAD_TO) {
        outputCallback((commands[i].relative?'t':'T')
          + commands[i].x + WSP + commands[i].y);
      // Elliptic arc command
      } else if(commands[i].type === SVGPathData.ARC) {
        outputCallback((commands[i].relative?'a':'A')
          + commands[i].rX + WSP + commands[i].rY
          + WSP + commands[i].xRot
          + WSP + commands[i].lArcFlag + WSP + commands[i].sweepFlag
          + WSP + commands[i].x + WSP + commands[i].y);
      // Unkown command
      } else {
        throw SyntaxError('Unexpected command type "' + commands[i].type
          + '" at index ' + i + '.');
      }
    }
  };
}

module.exports = SVGPathDataEncoder;

