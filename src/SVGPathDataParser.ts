// Parse SVG PathData
// http://www.w3.org/TR/SVG/paths.html#PathDataBNF

import { SVGPathData } from "./SVGPathData";

// Private consts : Char groups
const WSP = [" ", "\t", "\r", "\n"];
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const SIGNS = ["-", "+"];
const EXPONENTS = ["e", "E"];
const DECPOINT = ["."];
const FLAGS = ["0", "1"];
const COMMA = [","];
const COMMANDS = [
  "m", "M", "z", "Z", "l", "L", "h", "H", "v", "V", "c", "C",
  "s", "S", "q", "Q", "t", "T", "a", "A",
];

// Parsing states
const STATE_WSP = 1;
const STATE_WSPS = 2;
const STATE_COMMA = 4;
const STATE_COMMAS = 8;
const STATE_COMMAS_WSPS =
STATE_WSP | STATE_WSPS |
STATE_COMMA | STATE_COMMAS;
const STATE_NUMBER = 16;
const STATE_NUMBER_DIGITS = 32;
const STATE_NUMBER_INT = 64;
const STATE_NUMBER_FLOAT = 128;
const STATE_NUMBER_EXP = 256;
const STATE_NUMBER_EXPSIGN = 512;
const STATE_NUMBER_MASK = STATE_NUMBER |
STATE_NUMBER_DIGITS | STATE_NUMBER_INT |
STATE_NUMBER_EXP | STATE_NUMBER_FLOAT;
const STATE_RELATIVE = 1024;
const STATE_CLOSE_PATH = 2048; // Close path command (z/Z)
const STATE_MOVE_TO = 4096; // Move to command (m/M)
const STATE_LINE_TO = 8192; // Line to command (l/L=)
const STATE_HORIZ_LINE_TO = 16384; // Horizontal line to command (h/H)
const STATE_VERT_LINE_TO = 32768; // Vertical line to command (v/V)
const STATE_CURVE_TO = 65536; // Curve to command (c/C)
const STATE_SMOOTH_CURVE_TO = 131072; // Smooth curve to command (s/S)
const STATE_QUAD_TO = 262144; // Quadratic bezier curve to command (q/Q)
const STATE_SMOOTH_QUAD_TO = 524288; // Smooth quadratic bezier curve to command (t/T)
const STATE_ARC = 1048576; // Elliptic arc command (a/A)
const STATE_COMMANDS_MASK =
STATE_CLOSE_PATH | STATE_MOVE_TO |
STATE_LINE_TO | STATE_HORIZ_LINE_TO |
STATE_VERT_LINE_TO | STATE_CURVE_TO |
STATE_SMOOTH_CURVE_TO | STATE_QUAD_TO |
STATE_SMOOTH_QUAD_TO | STATE_ARC;

export class SVGPathDataParser {
  commands: any[] = [];
  curCommand: any = null;
  state: number = STATE_COMMAS_WSPS;
  curNumber: any = "";
  emit(type: string, err: any) {
    throw err;
  }
  _transform(str: string) {
    let i;

    str += " ";

    for (i = 0; i < str.length; i++) {
      // White spaces parsing
      if (this.state & STATE_WSP ||
        this.state & STATE_WSPS) {
        if (-1 !== WSP.indexOf(str[i])) {
          this.state ^= this.state & STATE_WSP;
          // any space stops current number parsing
          if ("" !== this.curNumber) {
            this.state ^= this.state & STATE_NUMBER_MASK;
          } else {
            continue;
          }
        }
      }
      // Commas parsing
      if (this.state & STATE_COMMA ||
        this.state & STATE_COMMAS) {
        if (-1 !== COMMA.indexOf(str[i])) {
          this.state ^= this.state & STATE_COMMA;
          // any comma stops current number parsing
          if ("" !== this.curNumber) {
            this.state ^= this.state & STATE_NUMBER_MASK;
          } else {
            continue;
          }
        }
      }
      // Numbers parsing : -125.25e-125
      if (this.state & STATE_NUMBER) {
        // Reading the sign
        if ((this.state & STATE_NUMBER_MASK) ===
          STATE_NUMBER) {
          this.state |= STATE_NUMBER_INT |
            STATE_NUMBER_DIGITS;
          if (-1 !== SIGNS.indexOf(str[i])) {
            this.curNumber += str[i];
            continue;
          }
        }
        // Reading the exponent sign
        if (this.state & STATE_NUMBER_EXPSIGN) {
          this.state ^= STATE_NUMBER_EXPSIGN;
          this.state |= STATE_NUMBER_DIGITS;
          if (-1 !== SIGNS.indexOf(str[i])) {
            this.curNumber += str[i];
            continue;
          }
        }
        // Reading digits
        if (this.state & STATE_NUMBER_DIGITS) {
          if (-1 !== DIGITS.indexOf(str[i])) {
            this.curNumber += str[i];
            continue;
          }
          this.state ^= STATE_NUMBER_DIGITS;
        }
        // Ended reading left side digits
        if (this.state & STATE_NUMBER_INT) {
          this.state ^= STATE_NUMBER_INT;
          // if got a point, reading right side digits
          if (-1 !== DECPOINT.indexOf(str[i])) {
            this.curNumber += str[i];
            this.state |= STATE_NUMBER_FLOAT |
              STATE_NUMBER_DIGITS;
            continue;
            // if got e/E, reading the exponent
          } else if (-1 !== EXPONENTS.indexOf(str[i])) {
            this.curNumber += str[i];
            this.state |= STATE_NUMBER_EXP |
              STATE_NUMBER_EXPSIGN;
            continue;
          }
          // else we"re done with that number
          this.state ^= this.state & STATE_NUMBER_MASK;
        }
        // Ended reading decimal digits
        if (this.state & STATE_NUMBER_FLOAT) {
          this.state ^= STATE_NUMBER_FLOAT;
          // if got e/E, reading the exponent
          if (-1 !== EXPONENTS.indexOf(str[i])) {
            this.curNumber += str[i];
            this.state |= STATE_NUMBER_EXP |
              STATE_NUMBER_EXPSIGN;
            continue;
          }
          // else we"re done with that number
          this.state ^= this.state & STATE_NUMBER_MASK;
        }
        // Ended reading exponent digits
        if (this.state & STATE_NUMBER_EXP) {
          // we"re done with that number
          this.state ^= this.state & STATE_NUMBER_MASK;
        }
      }
      // New number
      if (this.curNumber) {
        // Horizontal move to command (x)
        if (this.state & STATE_HORIZ_LINE_TO) {
          if (null === this.curCommand) {
            this.commands.push({
              type: SVGPathData.HORIZ_LINE_TO,
              relative: !!(this.state & STATE_RELATIVE),
              x: Number(this.curNumber),
            });
          } else {
            this.curCommand.x = Number(this.curNumber);
            delete this.curCommand.invalid;
            this.commands.push(this.curCommand);
            this.curCommand = null;
          }
          this.state |= STATE_NUMBER;
          // Vertical move to command (y)
        } else if (this.state & STATE_VERT_LINE_TO) {
          if (null === this.curCommand) {
            this.commands.push({
              type: SVGPathData.VERT_LINE_TO,
              relative: !!(this.state & STATE_RELATIVE),
              y: Number(this.curNumber),
            });
          } else {
            this.curCommand.y = Number(this.curNumber);
            delete this.curCommand.invalid;
            this.commands.push(this.curCommand);
            this.curCommand = null;
          }
          this.state |= STATE_NUMBER;
          // Move to / line to / smooth quadratic curve to commands (x, y)
        } else if (this.state & STATE_MOVE_TO ||
          this.state & STATE_LINE_TO ||
          this.state & STATE_SMOOTH_QUAD_TO) {
          if (null === this.curCommand) {
            this.curCommand = {
              type: (this.state & STATE_MOVE_TO ?
                SVGPathData.MOVE_TO :
                (this.state & STATE_LINE_TO ?
                  SVGPathData.LINE_TO : SVGPathData.SMOOTH_QUAD_TO
                )
              ),
              relative: !!(this.state & STATE_RELATIVE),
              x: Number(this.curNumber),
            };
          } else if ("undefined" === typeof this.curCommand.x) {
            this.curCommand.x = Number(this.curNumber);
          } else {
            delete this.curCommand.invalid;
            this.curCommand.y = Number(this.curNumber);
            this.commands.push(this.curCommand);
            this.curCommand = null;
            // Switch to line to state
            if (this.state & STATE_MOVE_TO) {
              this.state ^= STATE_MOVE_TO;
              this.state |= STATE_LINE_TO;
            }
          }
          this.state |= STATE_NUMBER;
          // Curve to commands (x1, y1, x2, y2, x, y)
        } else if (this.state & STATE_CURVE_TO) {
          if (null === this.curCommand) {
            this.curCommand = {
              type: SVGPathData.CURVE_TO,
              relative: !!(this.state & STATE_RELATIVE),
              invalid: true,
              x1: Number(this.curNumber),
            };
          } else if ("undefined" === typeof this.curCommand.x1) {
            this.curCommand.x1 = Number(this.curNumber);
          } else if ("undefined" === typeof this.curCommand.y1) {
            this.curCommand.y1 = Number(this.curNumber);
          } else if ("undefined" === typeof this.curCommand.x2) {
            this.curCommand.x2 = Number(this.curNumber);
          } else if ("undefined" === typeof this.curCommand.y2) {
            this.curCommand.y2 = Number(this.curNumber);
          } else if ("undefined" === typeof this.curCommand.x) {
            this.curCommand.x = Number(this.curNumber);
          } else if ("undefined" === typeof this.curCommand.y) {
            this.curCommand.y = Number(this.curNumber);
            delete this.curCommand.invalid;
            this.commands.push(this.curCommand);
            this.curCommand = null;
          }
          this.state |= STATE_NUMBER;
          // Smooth curve to commands (x1, y1, x, y)
        } else if (this.state & STATE_SMOOTH_CURVE_TO) {
          if (null === this.curCommand) {
            this.curCommand = {
              type: SVGPathData.SMOOTH_CURVE_TO,
              relative: !!(this.state & STATE_RELATIVE),
              invalid: true,
              x2: Number(this.curNumber),
            };
          } else if ("undefined" === typeof this.curCommand.x2) {
            this.curCommand.x2 = Number(this.curNumber);
          } else if ("undefined" === typeof this.curCommand.y2) {
            this.curCommand.y2 = Number(this.curNumber);
          } else if ("undefined" === typeof this.curCommand.x) {
            this.curCommand.x = Number(this.curNumber);
          } else if ("undefined" === typeof this.curCommand.y) {
            this.curCommand.y = Number(this.curNumber);
            delete this.curCommand.invalid;
            this.commands.push(this.curCommand);
            this.curCommand = null;
          }
          this.state |= STATE_NUMBER;
          // Quadratic bezier curve to commands (x1, y1, x, y)
        } else if (this.state & STATE_QUAD_TO) {
          if (null === this.curCommand) {
            this.curCommand = {
              type: SVGPathData.QUAD_TO,
              relative: !!(this.state & STATE_RELATIVE),
              invalid: true,
              x1: Number(this.curNumber),
            };
          } else if ("undefined" === typeof this.curCommand.x1) {
            this.curCommand.x1 = Number(this.curNumber);
          } else if ("undefined" === typeof this.curCommand.y1) {
            this.curCommand.y1 = Number(this.curNumber);
          } else if ("undefined" === typeof this.curCommand.x) {
            this.curCommand.x = Number(this.curNumber);
          } else if ("undefined" === typeof this.curCommand.y) {
            this.curCommand.y = Number(this.curNumber);
            delete this.curCommand.invalid;
            this.commands.push(this.curCommand);
            this.curCommand = null;
          }
          this.state |= STATE_NUMBER;
          // Elliptic arc commands (rX, rY, xRot, lArcFlag, sweepFlag, x, y)
        } else if (this.state & STATE_ARC) {
          if (null === this.curCommand) {
            this.curCommand = {
              type: SVGPathData.ARC,
              relative: !!(this.state & STATE_RELATIVE),
              invalid: true,
              rX: Number(this.curNumber),
            };
          } else if ("undefined" === typeof this.curCommand.rX) {
            if (0 > Number(this.curNumber)) {
              this.emit("error", new SyntaxError(
                  `Expected positive number, got "${this.curNumber}" at index "${i}"`));
            }
            this.curCommand.rX = Number(this.curNumber);
          } else if ("undefined" === typeof this.curCommand.rY) {
            if (0 > Number(this.curNumber)) {
              this.emit("error", new SyntaxError(
                  `Expected positive number, got "${this.curNumber}" at index "${i}"`));
            }
            this.curCommand.rY = Number(this.curNumber);
          } else if ("undefined" === typeof this.curCommand.xRot) {
            this.curCommand.xRot = Number(this.curNumber);
          } else if ("undefined" === typeof this.curCommand.lArcFlag) {
            if (-1 === FLAGS.indexOf(this.curNumber)) {
              this.emit("error", new SyntaxError(
                  `Expected a flag, got "${this.curNumber}" at index "${i}"`));
            }
            this.curCommand.lArcFlag = Number(this.curNumber);
          } else if ("undefined" === typeof this.curCommand.sweepFlag) {
            if ("0" !== this.curNumber && "1" !== this.curNumber) {
              this.emit("error", new SyntaxError(
                  `Expected a flag, got "${this.curNumber}" at index "${i}"`));
            }
            this.curCommand.sweepFlag = Number(this.curNumber);
          } else if ("undefined" === typeof this.curCommand.x) {
            this.curCommand.x = Number(this.curNumber);
          } else if ("undefined" === typeof this.curCommand.y) {
            this.curCommand.y = Number(this.curNumber);
            delete this.curCommand.invalid;
            this.commands.push(this.curCommand);
            this.curCommand = null;
          }
          this.state |= STATE_NUMBER;
        }
        this.curNumber = "";
        // Continue if a white space or a comma was detected
        if (-1 !== WSP.indexOf(str[i]) || -1 !== COMMA.indexOf(str[i])) {
          continue;
        }
        // if a sign is detected, then parse the new number
        if (-1 !== SIGNS.indexOf(str[i])) {
          this.curNumber = str[i];
          this.state |= STATE_NUMBER_INT |
            STATE_NUMBER_DIGITS;
          continue;
        }
        // if the decpoint is detected, then parse the new number
        if (-1 !== DECPOINT.indexOf(str[i])) {
          this.curNumber = str[i];
          this.state |= STATE_NUMBER_FLOAT |
            STATE_NUMBER_DIGITS;
          continue;
        }
      }
      // End of a command
      if (-1 !== COMMANDS.indexOf(str[i])) {
        // Adding residual command
        if (null !== this.curCommand) {
          if (this.curCommand.invalid) {
            this.emit("error",
              new SyntaxError(`Unterminated command at index ${i}.`));
          }
          this.commands.push(this.curCommand);
          this.curCommand = null;
          this.state ^= this.state & STATE_COMMANDS_MASK;
        }
      }
      // Detecting the next command
      this.state ^= this.state & STATE_COMMANDS_MASK;
      // Is the command relative
      if (str[i] === str[i].toLowerCase()) {
        this.state |= STATE_RELATIVE;
      } else {
        this.state ^= this.state & STATE_RELATIVE;
      }
      // Horizontal move to command
      if ("z" === str[i].toLowerCase()) {
        this.commands.push({
          type: SVGPathData.CLOSE_PATH,
        });
        this.state = STATE_COMMAS_WSPS;
        continue;
        // Horizontal move to command
      } else if ("h" === str[i].toLowerCase()) {
        this.state |= STATE_HORIZ_LINE_TO;
        this.curCommand = {
          type: SVGPathData.HORIZ_LINE_TO,
          relative: !!(this.state & STATE_RELATIVE),
          invalid: true,
        };
        // Vertical move to command
      } else if ("v" === str[i].toLowerCase()) {
        this.state |= STATE_VERT_LINE_TO;
        this.curCommand = {
          type: SVGPathData.VERT_LINE_TO,
          relative: !!(this.state & STATE_RELATIVE),
          invalid: true,
        };
        // Move to command
      } else if ("m" === str[i].toLowerCase()) {
        this.state |= STATE_MOVE_TO;
        this.curCommand = {
          type: SVGPathData.MOVE_TO,
          relative: !!(this.state & STATE_RELATIVE),
          invalid: true,
        };
        // Line to command
      } else if ("l" === str[i].toLowerCase()) {
        this.state |= STATE_LINE_TO;
        this.curCommand = {
          type: SVGPathData.LINE_TO,
          relative: !!(this.state & STATE_RELATIVE),
          invalid: true,
        };
        // Curve to command
      } else if ("c" === str[i].toLowerCase()) {
        this.state |= STATE_CURVE_TO;
        this.curCommand = {
          type: SVGPathData.CURVE_TO,
          relative: !!(this.state & STATE_RELATIVE),
          invalid: true,
        };
        // Smooth curve to command
      } else if ("s" === str[i].toLowerCase()) {
        this.state |= STATE_SMOOTH_CURVE_TO;
        this.curCommand = {
          type: SVGPathData.SMOOTH_CURVE_TO,
          relative: !!(this.state & STATE_RELATIVE),
          invalid: true,
        };
        // Quadratic bezier curve to command
      } else if ("q" === str[i].toLowerCase()) {
        this.state |= STATE_QUAD_TO;
        this.curCommand = {
          type: SVGPathData.QUAD_TO,
          relative: !!(this.state & STATE_RELATIVE),
          invalid: true,
        };
        // Smooth quadratic bezier curve to command
      } else if ("t" === str[i].toLowerCase()) {
        this.state |= STATE_SMOOTH_QUAD_TO;
        this.curCommand = {
          type: SVGPathData.SMOOTH_QUAD_TO,
          relative: !!(this.state & STATE_RELATIVE),
          invalid: true,
        };
        // Elliptic arc command
      } else if ("a" === str[i].toLowerCase()) {
        this.state |= STATE_ARC;
        this.curCommand = {
          type: SVGPathData.ARC,
          relative: !!(this.state & STATE_RELATIVE),
          invalid: true,
        };
        // Unkown command
      } else {
        this.emit("error", new SyntaxError(`Unexpected character "${str[i]
          }" at index ${i}.`));
      }
      // White spaces can follow a command
      this.state |= STATE_COMMAS_WSPS |
        STATE_NUMBER;
    }

    if (null !== this.curCommand) {
      if (this.curCommand.invalid) {
        this.emit("error",
          new SyntaxError("Unterminated command at the path end."));
      }
      this.commands.push(this.curCommand);
      this.curCommand = null;
      this.state ^= this.state & STATE_COMMANDS_MASK;
    }

    return this.commands;
  }
}
