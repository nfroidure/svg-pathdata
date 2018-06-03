// Parse SVG PathData
// http://www.w3.org/TR/SVG/paths.html#PathDataBNF
import { SVGCommand, SVGPathData, TransformFunction } from "./SVGPathData";
import { TransformableSVG } from "./TransformableSVG";
// Private consts : Char groups
const isWhiteSpace = (c: string) => " " === c || "\t" === c || "\r" === c || "\n" === c;
const isDigit = (c: string) =>
  "0".charCodeAt(0) <= c.charCodeAt(0) && c.charCodeAt(0) <= "9".charCodeAt(0);
const COMMANDS = "mMzZlLhHvVcCsSqQtTaA";

export class SVGPathDataParser extends TransformableSVG {
  private curCommand: any = undefined;
  private curNumber: string = "";
  private curCommandType: number = -1;
  private curCommandRelative = false;
  private canParseCommandOrComma = true;
  private curNumberHasExp = false;
  private curNumberHasExpDigits = false;
  private curNumberHasDecimal = false;

  constructor() {
    super();
  }

  finish(commands: SVGCommand[] = []) {
    this.parse(" ", commands);
    // Adding residual command
    if (this.curCommand || !this.canParseCommandOrComma) {
      throw new SyntaxError("Unterminated command at the path end.");
    }
    return commands;
  }

  parse(str: string, commands: SVGCommand[] = []) {
    const finishCommand = (command = this.curCommand) => {
      commands.push(command);
      this.curCommand = undefined;
      this.canParseCommandOrComma = true;
    };

    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      // White spaces parsing

      if (isDigit(c)) {
        this.curNumber += c;
        this.curNumberHasExpDigits = this.curNumberHasExp;
        continue;
      }
      if ("e" === c || "E" === c) {
        this.curNumber += c;
        this.curNumberHasExp = true;
        continue;
      }
      if (("-" === c || "+" === c) && this.curNumberHasExp && !this.curNumberHasExpDigits) {
        this.curNumber += c;
        continue;
      }
      // if we already have a ".", it means we are starting a new number
      if ("." === c && !this.curNumberHasExp && !this.curNumberHasDecimal) {
        this.curNumber += c;
        this.curNumberHasDecimal = true;
        continue;
      }

      // New number
      if (this.curNumber && -1 !== this.curCommandType) {
        const val = Number(this.curNumber);
        if (isNaN(val)) {
          throw new SyntaxError(`Invalid number ending at ${i}`);
        }
        // Horizontal move to command (x)
        if (this.curCommandType === SVGPathData.HORIZ_LINE_TO) {
          finishCommand({
            type: SVGPathData.HORIZ_LINE_TO,
            relative: this.curCommandRelative,
            x: val,
          });
          // Vertical move to command (y)
        } else if (this.curCommandType === SVGPathData.VERT_LINE_TO) {
          finishCommand({
            type: SVGPathData.VERT_LINE_TO,
            relative: this.curCommandRelative,
            y: val,
          });
          // Move to / line to / smooth quadratic curve to commands (x, y)
        } else if (
          this.curCommandType === SVGPathData.MOVE_TO ||
          this.curCommandType === SVGPathData.LINE_TO ||
          this.curCommandType === SVGPathData.SMOOTH_QUAD_TO
        ) {
          if (undefined === this.curCommand) {
            this.curCommand = {
              type: this.curCommandType,
              relative: this.curCommandRelative,
              x: val,
            };
          } else {
            this.curCommand.y = val;
            finishCommand();
            // Switch to line to state
            if (SVGPathData.MOVE_TO === this.curCommandType) {
              this.curCommandType = SVGPathData.LINE_TO;
            }
          }
          // Curve to commands (x1, y1, x2, y2, x, y)
        } else if (this.curCommandType === SVGPathData.CURVE_TO) {
          if (undefined === this.curCommand) {
            this.curCommand = {
              type: SVGPathData.CURVE_TO,
              relative: this.curCommandRelative,
              x1: val,
            };
          } else if (undefined === this.curCommand.y1) {
            this.curCommand.y1 = val;
          } else if (undefined === this.curCommand.x2) {
            this.curCommand.x2 = val;
          } else if (undefined === this.curCommand.y2) {
            this.curCommand.y2 = val;
          } else if (undefined === this.curCommand.x) {
            this.curCommand.x = val;
          } else if (undefined === this.curCommand.y) {
            this.curCommand.y = val;
            finishCommand();
          }
          // Smooth curve to commands (x1, y1, x, y)
        } else if (this.curCommandType === SVGPathData.SMOOTH_CURVE_TO) {
          if (undefined === this.curCommand) {
            this.curCommand = {
              type: SVGPathData.SMOOTH_CURVE_TO,
              relative: this.curCommandRelative,
              x2: val,
            };
          } else if (undefined === this.curCommand.y2) {
            this.curCommand.y2 = val;
          } else if (undefined === this.curCommand.x) {
            this.curCommand.x = val;
          } else if (undefined === this.curCommand.y) {
            this.curCommand.y = val;
            finishCommand();
          }
          // Quadratic bezier curve to commands (x1, y1, x, y)
        } else if (this.curCommandType === SVGPathData.QUAD_TO) {
          if (undefined === this.curCommand) {
            this.curCommand = {
              type: SVGPathData.QUAD_TO,
              relative: this.curCommandRelative,
              x1: val,
            };
          } else if (undefined === this.curCommand.y1) {
            this.curCommand.y1 = val;
          } else if (undefined === this.curCommand.x) {
            this.curCommand.x = val;
          } else if (undefined === this.curCommand.y) {
            this.curCommand.y = val;
            finishCommand();
          }
          // Elliptic arc commands (rX, rY, xRot, lArcFlag, sweepFlag, x, y)
        } else if (this.curCommandType === SVGPathData.ARC) {
          if (undefined === this.curCommand) {
            if (0 > val) {
              throw new SyntaxError(`Expected positive number, got "${val}" at index "${i}"`);
            }
            this.curCommand = {
              type: SVGPathData.ARC,
              relative: this.curCommandRelative,
              rX: val,
            };
          } else if (undefined === this.curCommand.rY) {
            if (0 > val) {
              throw new SyntaxError(`Expected positive number, got "${val}" at index "${i}"`);
            }
            this.curCommand.rY = val;
          } else if (undefined === this.curCommand.xRot) {
            this.curCommand.xRot = val;
          } else if (undefined === this.curCommand.lArcFlag) {
            if ("0" !== this.curNumber && "1" !== this.curNumber) {
              throw new SyntaxError(`Expected a flag, got "${this.curNumber}" at index "${i}"`);
            }
            this.curCommand.lArcFlag = val;
          } else if (undefined === this.curCommand.sweepFlag) {
            if ("0" !== this.curNumber && "1" !== this.curNumber) {
              throw new SyntaxError(`Expected a flag, got "${this.curNumber}" at index "${i}"`);
            }
            this.curCommand.sweepFlag = val;
          } else if (undefined === this.curCommand.x) {
            this.curCommand.x = val;
          } else if (undefined === this.curCommand.y) {
            this.curCommand.y = val;
            finishCommand();
          }
        }
        this.curNumber = "";
        this.curNumberHasExpDigits = false;
        this.curNumberHasExp = false;
        this.curNumberHasDecimal = false;
        this.canParseCommandOrComma = true;
      }
      // Continue if a white space or a comma was detected
      if (isWhiteSpace(c)) {
        continue;
      }
      if ("," === c && this.canParseCommandOrComma) {
        // L 0,0, H is not valid:
        this.canParseCommandOrComma = false;
        continue;
      }
      // if a sign is detected, then parse the new number
      if ("+" === c || "-" === c || "." === c) {
        this.curNumber = c;
        this.curNumberHasDecimal = "." === c;
        continue;
      }

      // Adding residual command
      if (undefined !== this.curCommand) {
        throw new SyntaxError(`Unterminated command at index ${i}.`);
      }
      if (!this.canParseCommandOrComma) {
        throw new SyntaxError(`Unexpected character "${c}" at index ${i}. Command cannot follow comma`);
      }
      this.canParseCommandOrComma = false;
      // Detecting the next command
      if ("z" === c || "Z" === c) {
        commands.push({
          type: SVGPathData.CLOSE_PATH,
        });
        this.canParseCommandOrComma = true;
        this.curCommandType = -1;
        continue;
        // Horizontal move to command
      } else if ("h" === c || "H" === c) {
        this.curCommandType = SVGPathData.HORIZ_LINE_TO;
        this.curCommandRelative = "h" === c;
        // Vertical move to command
      } else if ("v" === c || "V" === c) {
        this.curCommandType = SVGPathData.VERT_LINE_TO;
        this.curCommandRelative = "v" === c;
        // Move to command
      } else if ("m" === c || "M" === c) {
        this.curCommandType = SVGPathData.MOVE_TO;
        this.curCommandRelative = "m" === c;
        // Line to command
      } else if ("l" === c || "L" === c) {
        this.curCommandType = SVGPathData.LINE_TO;
        this.curCommandRelative = "l" === c;
        // Curve to command
      } else if ("c" === c || "C" === c) {
        this.curCommandType = SVGPathData.CURVE_TO;
        this.curCommandRelative = "c" === c;
        // Smooth curve to command
      } else if ("s" === c || "S" === c) {
        this.curCommandType = SVGPathData.SMOOTH_CURVE_TO;
        this.curCommandRelative = "s" === c;
        // Quadratic bezier curve to command
      } else if ("q" === c || "Q" === c) {
        this.curCommandType = SVGPathData.QUAD_TO;
        this.curCommandRelative = "q" === c;
        // Smooth quadratic bezier curve to command
      } else if ("t" === c || "T" === c) {
        this.curCommandType = SVGPathData.SMOOTH_QUAD_TO;
        this.curCommandRelative = "t" === c;
        // Elliptic arc command
      } else if ("a" === c || "A" === c) {
        this.curCommandType = SVGPathData.ARC;
        this.curCommandRelative = "a" === c;
      } else {
        throw new SyntaxError(`Unexpected character "${c}" at index ${i}.`);
      }
    }
    return commands;
  }

  /**
   * Return a wrapper around this parser which applies the transformation on parsed commands.
   */
  transform(transform: TransformFunction) {
    const result = Object.create(this, {
      parse: {
        value(chunk: string, commands: SVGCommand[] = []) {
          const parsedCommands = Object.getPrototypeOf(this).parse.call(
            this,
            chunk,
          );
          for (const c of parsedCommands) {
            const cT = transform(c);
            if (Array.isArray(cT)) {
              commands.push(...cT);
            } else {
              commands.push(cT);
            }
          }
          return commands;
        },
      },
    });
    return result as this;
  }
}
