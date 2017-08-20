// Encode SVG PathData
// http://www.w3.org/TR/SVG/paths.html#PathDataBNF

import { Transform } from "stream";
import {SVGCommand, SVGPathData} from "./SVGPathData";

// Private consts : Char groups
const WSP = " ";

export class SVGPathDataEncoder extends Transform {
  constructor() {
    super({objectMode: true, writableObjectMode: true, readableObjectMode: false});
  }

  // Read method
  _transform(commands: SVGCommand | SVGCommand[], encoding: string, done: () => void) {
    let str = "";
    let i;
    let j;

    if (!Array.isArray(commands)) {
      commands = [commands];
    }
    for (i = 0, j = commands.length; i < j; i++) {
      const command = commands[i];
      if (command.type === SVGPathData.CLOSE_PATH) {
        str += "z";
      } else if (command.type === SVGPathData.HORIZ_LINE_TO) {
        str += (command.relative ? "h" : "H") +
          command.x;
      } else if (command.type === SVGPathData.VERT_LINE_TO) {
        str += (command.relative ? "v" : "V") +
          command.y;
      } else if (command.type === SVGPathData.MOVE_TO) {
        str += (command.relative ? "m" : "M") +
          command.x + WSP + command.y;
      } else if (command.type === SVGPathData.LINE_TO) {
        str += (command.relative ? "l" : "L") +
          command.x + WSP + command.y;
      } else if (command.type === SVGPathData.CURVE_TO) {
        str += (command.relative ? "c" : "C") +
          command.x1 + WSP + command.y1 +
          WSP + command.x2 + WSP + command.y2 +
          WSP + command.x + WSP + command.y;
      } else if (command.type === SVGPathData.SMOOTH_CURVE_TO) {
        str += (command.relative ? "s" : "S") +
          command.x2 + WSP + command.y2 +
          WSP + command.x + WSP + command.y;
      } else if (command.type === SVGPathData.QUAD_TO) {
        str += (command.relative ? "q" : "Q") +
          command.x1 + WSP + command.y1 +
          WSP + command.x + WSP + command.y;
      } else if (command.type === SVGPathData.SMOOTH_QUAD_TO) {
        str += (command.relative ? "t" : "T") +
          command.x + WSP + command.y;
      } else if (command.type === SVGPathData.ARC) {
        str += (command.relative ? "a" : "A") +
          command.rX + WSP + command.rY +
          WSP + command.xRot +
          WSP + (+command.lArcFlag) + WSP + (+command.sweepFlag) +
          WSP + command.x + WSP + command.y;
      } else {
        // Unknown command
        this.emit("error", new Error(
          `Unexpected command type "${ (command as any).type}" at index ${i}.`));
      }
    }
    this.push(new Buffer(str, "utf8"));
    done();
  }
}
