// Parse SVG PathData
// http://www.w3.org/TR/SVG/paths.html#PathDataBNF

// Private consts : Char groups
var WSP = [' ', '\t', '\r', '\n']
  , DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  , SIGNS = ['-', '+']
  , EXPONENTS = ['e', 'E']
  , DECPOINT = ['.']
  , FLAGS = ['0', '1']
  , COMMA = [',']
  , EOT = [String.fromCharCode(0x4)]
  , COMMANDS = ['m', 'M', 'z', 'Z', 'l', 'L', 'h', 'H', 'v', 'V', 'c', 'C',
    's', 'S', 'q', 'Q', 't', 'T', 'a', 'A']
;
  
function SVGPathDataParser() {
  // Parsing vars
  this.state = SVGPathDataParser.STATE_WSPS,
    SVGPathDataParser.STATE_COMMAS;
  this.curNumber = '';
  this.curCoords = {};
  this.commands = [];
  this.read = function(str) {
    if(this.state === SVGPathDataParser.STATE_ENDED) {
      throw Error('Cannot parse more datas since the stream ended.');
    }
    for(var i=0, j=str.length; i<j; i++) {
      // White spaces parsing
      if(this.state&SVGPathDataParser.STATE_WSP
        || this.state&SVGPathDataParser.STATE_WSPS) {
          if(-1 !== WSP.indexOf(str[i])) {
            this.state ^= this.state&SVGPathDataParser.STATE_WSP;
            // any space stops current number parsing
            if('' !== this.curNumber) {
              this.state ^= this.state&SVGPathDataParser.STATE_NUMBER_MASK;
            } else {
              continue;
            }
          }
      }
      // Commas parsing
      if(this.state&SVGPathDataParser.STATE_COMMA
        || this.state&SVGPathDataParser.STATE_COMMAS) {
          if(-1 !== COMMA.indexOf(str[i])) {
            this.state ^= this.state&SVGPathDataParser.STATE_COMMA;
            // any comma stops current number parsing
            if('' !== this.curNumber) {
              this.state ^= this.state&SVGPathDataParser.STATE_NUMBER_MASK;
            } else {
              continue;
            }
          }
      }
      // Numbers parsing : -125.25e-125
      if(this.state&SVGPathDataParser.STATE_NUMBER) {
        // Reading the sign
        if((this.state&SVGPathDataParser.STATE_NUMBER_MASK) ===
          SVGPathDataParser.STATE_NUMBER) {
          this.state |= SVGPathDataParser.STATE_NUMBER_INT |
            SVGPathDataParser.STATE_NUMBER_DIGITS;
          if(-1 !== SIGNS.indexOf(str[i])) {
            this.curNumber += str[i];
            continue;
          }
        }
        // Reading the exponent sign
        if(this.state&SVGPathDataParser.STATE_NUMBER_EXPSIGN) {
          this.state ^= SVGPathDataParser.STATE_NUMBER_EXPSIGN;
          this.state |= SVGPathDataParser.STATE_NUMBER_DIGITS;
          if(-1 !== SIGNS.indexOf(str[i])) {
            this.curNumber += str[i];
            continue;
          }
        }
        // Reading digits
        if(this.state&SVGPathDataParser.STATE_NUMBER_DIGITS) {
          if(-1 !== DIGITS.indexOf(str[i])) {
            this.curNumber += str[i];
            continue;
          }
          this.state ^= SVGPathDataParser.STATE_NUMBER_DIGITS;
        }
        // Ended reading left side digits
        if(this.state&SVGPathDataParser.STATE_NUMBER_INT) {
          this.state ^= SVGPathDataParser.STATE_NUMBER_INT;
          // if got a point, reading right side digits
          if(-1 !== DECPOINT.indexOf(str[i])) {
            this.curNumber += str[i];
            this.state |= SVGPathDataParser.STATE_NUMBER_FLOAT |
              SVGPathDataParser.STATE_NUMBER_DIGITS;
            continue;
          // if got e/E, reading the exponent
          } else if(-1 !== EXPONENTS.indexOf(str[i])) {
            this.curNumber += str[i];
            this.state |= SVGPathDataParser.STATE_NUMBER_EXP |
              SVGPathDataParser.STATE_NUMBER_EXPSIGN;
            continue;
          }
          // else we're done with that number
          this.state ^= this.state&SVGPathDataParser.STATE_NUMBER_MASK;
        }
        // Ended reading decimal digits
        if(this.state&SVGPathDataParser.STATE_NUMBER_FLOAT) {
          this.state ^= SVGPathDataParser.STATE_NUMBER_FLOAT;
          // if got e/E, reading the exponent
          if(-1 !== EXPONENTS.indexOf(str[i])) {
            this.curNumber += str[i];
            this.state |= SVGPathDataParser.STATE_NUMBER_EXP |
              SVGPathDataParser.STATE_NUMBER_EXPSIGN;
            continue;
          }
          // else we're done with that number
          this.state ^= this.state&SVGPathDataParser.STATE_NUMBER_MASK;
        }
        // Ended reading exponent digits
        if(this.state&SVGPathDataParser.STATE_NUMBER_EXP) {
          // we're done with that number
          this.state ^= this.state&SVGPathDataParser.STATE_NUMBER_MASK;
        }
      }
      // New number
      if(this.curNumber) {
        // Horizontal move to
        if(this.state&SVGPathDataParser.STATE_HORIZ) {
          this.commands.push({
            type: SVGPathDataParser.STATE_HORIZ,
            relative: !!(this.state&SVGPathDataParser.STATE_RELATIVE),
            x: this.curNumber
          });
          this.state |= SVGPathDataParser.STATE_NUMBER;
        // Vertical move to
        } else if(this.state&SVGPathDataParser.STATE_VERT) {
          this.commands.push({
            type: SVGPathDataParser.STATE_VERT,
            relative: !!(this.state&SVGPathDataParser.STATE_RELATIVE),
            x: this.curNumber
          });
          this.state |= SVGPathDataParser.STATE_NUMBER;
        }
        this.curNumber = '';
        // Continue if a white space or a comma was detected
        if(-1 !== WSP.indexOf(str[i]) || -1 !== COMMA.indexOf(str[i])) {
          continue;
        }
      }
      // End of a command
      if(-1 !== COMMANDS.indexOf(str[i]) || -1 !== EOT.indexOf(str[i])) {
        // Ending the stream
        if(-1 !== EOT.indexOf(str[i])) {
          this.state = SVGPathDataParser.STATE_ENDED;
          if(i<j-1) {
            throw Error('Chars after the end of the stream at index ' + i + '.');
          }
          break;
        }
      }
      // Detecting the next command
      this.state ^= this.state&SVGPathDataParser.STATE_COMMANDS_MASK;
      // Vertical move to
      if('h' === str[i].toLowerCase()) {
        this.state |= SVGPathDataParser.STATE_HORIZ |
          SVGPathDataParser.STATE_COMMAS_WSPS | SVGPathDataParser.STATE_NUMBER;
        if(str[i]==='h') {
          this.state |= SVGPathDataParser.STATE_RELATIVE;
        } else {
          this.state ^= this.state&SVGPathDataParser.STATE_RELATIVE;
        }
      // Vertical move to
      } else if('v' === str[i].toLowerCase()) {
        this.state |= SVGPathDataParser.STATE_VERT |
          SVGPathDataParser.STATE_COMMAS_WSPS | SVGPathDataParser.STATE_NUMBER;
        if(str[i]==='v') {
          this.state |= SVGPathDataParser.STATE_RELATIVE;
        } else {
          this.state ^= this.state&SVGPathDataParser.STATE_RELATIVE;
        }
      // Unkown command
      } else {
        throw Error('Unexpected character "' + str[i] + '" at index ' + i + '.');
      }
    }
    return this;
  };
  this.end = function() {
    return this.read(EOT[0]);
  };
  this.parse = function(str) {
    return this.read(str).end();
  };
}

// Static consts
// Parsing states
SVGPathDataParser.STATE_ENDED = 0;
SVGPathDataParser.STATE_WSP = 1;
SVGPathDataParser.STATE_WSPS = 2;
SVGPathDataParser.STATE_COMMA = 4;
SVGPathDataParser.STATE_COMMAS = 8;
SVGPathDataParser.STATE_COMMAS_WSPS = SVGPathDataParser.STATE_WSP |
  SVGPathDataParser.STATE_WSPS | SVGPathDataParser.STATE_COMMA |
  SVGPathDataParser.STATE_COMMAS;
SVGPathDataParser.STATE_NUMBER = 16;
SVGPathDataParser.STATE_NUMBER_DIGITS = 32;
SVGPathDataParser.STATE_NUMBER_INT = 64;
SVGPathDataParser.STATE_NUMBER_FLOAT = 128;
SVGPathDataParser.STATE_NUMBER_EXP = 256;
SVGPathDataParser.STATE_NUMBER_EXPSIGN = 512;
SVGPathDataParser.STATE_NUMBER_MASK = SVGPathDataParser.STATE_NUMBER |
  SVGPathDataParser.STATE_NUMBER_DIGITS | SVGPathDataParser.STATE_NUMBER_INT |
  SVGPathDataParser.STATE_NUMBER_EXP | SVGPathDataParser.STATE_NUMBER_FLOAT;
SVGPathDataParser.STATE_RELATIVE = 1024;
SVGPathDataParser.STATE_CLOSEPATH = 2048; // Close path command (z/Z)
SVGPathDataParser.STATE_MOVETO = 4096; // Move to command (m/M)
SVGPathDataParser.STATE_LINETO = 8192; // Line to command (l/L=)
SVGPathDataParser.STATE_HORIZ = 16384; // Horizontal line to command (h/H)
SVGPathDataParser.STATE_VERT = 32768; // Vertical line to command (h/H)
SVGPathDataParser.STATE_CURVETO = 65536; // Curve to command (c/C)
SVGPathDataParser.STATE_SMOOTHTO = 131072; // Smooth curve to command (s/S)
SVGPathDataParser.STATE_QUADTO = 262144; // Quadratic bezier curve to command (q/Q)
SVGPathDataParser.STATE_SMOOTHQUADTO = 524288; // Smooth quadratic bezier curve to command (t/T)
SVGPathDataParser.STATE_ARC = 1048576; // Elliptic arc (a/A)
SVGPathDataParser.STATE_COMMANDS_MASK = SVGPathDataParser.STATE_RELATIVE |
  SVGPathDataParser.STATE_CLOSEPATH | SVGPathDataParser.STATE_MOVETO |
  SVGPathDataParser.STATE_LINETO | SVGPathDataParser.STATE_HORIZ |
  SVGPathDataParser.STATE_VERT | SVGPathDataParser.STATE_CURVETO |
  SVGPathDataParser.STATE_SMOOTHTO | SVGPathDataParser.STATE_QUADTO |
  SVGPathDataParser.STATE_SMOOTHQUADTO | SVGPathDataParser.STATE_ARC;

module.exports = SVGPathDataParser;

