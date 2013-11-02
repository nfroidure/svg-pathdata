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
;
  
function SVGPathDataParser() {
  // Parsing vars
  this.state = SVGPathDataParser.STATE_NONE;
  // Number
  this.curNumber = '';
  this.parse = function(str) {
    for(var i=0, j=str.length; i<j; i++) {
      // Numbers parsing : -125.25e-125
      if(this.state&SVGPathDataParser.STATE_NUMBER) {
        // Reading the sign
        if(this.state === SVGPathDataParser.STATE_NUMBER) {
          this.state |= SVGPathDataParser.STATE_NUMBER_INT |
            SVGPathDataParser.STATE_NUMBER_DIGITS;
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
        }
        // Ended reading left side digits
        if(this.state&SVGPathDataParser.STATE_NUMBER_DIGITS || i>=j-1) {
          this.state ^= SVGPathDataParser.STATE_NUMBER_INT;
          // if got a point, reading right side digits
          if(-1 !== DECPOINT.indexOf(str[i])) {
            this.curNumber += str[i];
            this.state |= SVGPathDataParser.STATE_NUMBER_FLOAT |
              SVGPathDataParser.STATE_NUMBER_DIGITS;
            continue;
          }
          // if got e/E, reading the exponent
          if(-1 !== EXPONENTS.indexOf(str[i])) {
            this.curNumber += str[i];
            this.state |= SVGPathDataParser.STATE_NUMBER_EXP |
              SVGPathDataParser.STATE_NUMBER_DIGITS;
            continue;
          }
          // else we're done with that number
          this.state ^= SVGPathDataParser.STATE_NUMBER;
        }
      }
    // Coordinates parsing
    
    }
  };
}

// Static consts
// Parsing states
SVGPathDataParser.STATE_NONE = 0;
SVGPathDataParser.STATE_NUMBER = 1;
SVGPathDataParser.STATE_NUMBER_DIGITS = 2;
SVGPathDataParser.STATE_NUMBER_INT = 4;
SVGPathDataParser.STATE_NUMBER_EXP = 8;
SVGPathDataParser.STATE_NUMBER_FLOAT = 16;
SVGPathDataParser.STATE_NUMBER_MASK = SVGPathDataParser.STATE_NUMBER |
  SVGPathDataParser.STATE_NUMBER_DIGITS | SVGPathDataParser.STATE_NUMBER_INT |
  SVGPathDataParser.STATE_NUMBER_EXP | SVGPathDataParser.STATE_NUMBER_FLOAT;

module.exports = SVGPathDataParser;

