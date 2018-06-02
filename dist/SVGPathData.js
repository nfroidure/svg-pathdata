(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.svgpathdata = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var TransformableSVG_1 = require("./TransformableSVG");
var SVGPathData = /** @class */ (function (_super) {
    __extends(SVGPathData, _super);
    function SVGPathData(content) {
        var _this = _super.call(this) || this;
        if ("string" === typeof content) {
            _this.commands = SVGPathData.parse(content);
        }
        else {
            _this.commands = content;
        }
        return _this;
    }
    SVGPathData.prototype.encode = function () {
        return SVGPathData.encode(this.commands);
    };
    SVGPathData.prototype.getBounds = function () {
        var boundsTransform = SVGPathDataTransformer_1.SVGPathDataTransformer.CALCULATE_BOUNDS();
        this.transform(boundsTransform);
        return boundsTransform;
    };
    SVGPathData.prototype.transform = function (transformFunction) {
        var newCommands = [];
        for (var _i = 0, _a = this.commands; _i < _a.length; _i++) {
            var command = _a[_i];
            var transformedCommand = transformFunction(command);
            if (Array.isArray(transformedCommand)) {
                newCommands.push.apply(newCommands, transformedCommand);
            }
            else {
                newCommands.push(transformedCommand);
            }
        }
        this.commands = newCommands;
        return this;
    };
    SVGPathData.encode = function (commands) {
        return SVGPathDataEncoder_1.encodeSVGPath(commands);
    };
    SVGPathData.parse = function (path) {
        var parser = new SVGPathDataParser_1.SVGPathDataParser();
        var commands = [];
        parser.parse(path, commands);
        parser.finish(commands);
        return commands;
    };
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
    SVGPathData.LINE_COMMANDS = SVGPathData.LINE_TO | SVGPathData.HORIZ_LINE_TO | SVGPathData.VERT_LINE_TO;
    SVGPathData.DRAWING_COMMANDS = SVGPathData.HORIZ_LINE_TO | SVGPathData.VERT_LINE_TO | SVGPathData.LINE_TO |
        SVGPathData.CURVE_TO | SVGPathData.SMOOTH_CURVE_TO | SVGPathData.QUAD_TO |
        SVGPathData.SMOOTH_QUAD_TO | SVGPathData.ARC;
    return SVGPathData;
}(TransformableSVG_1.TransformableSVG));
exports.SVGPathData = SVGPathData;
var SVGPathDataEncoder_1 = require("./SVGPathDataEncoder");
exports.encodeSVGPath = SVGPathDataEncoder_1.encodeSVGPath;
var SVGPathDataParser_1 = require("./SVGPathDataParser");
exports.SVGPathDataParser = SVGPathDataParser_1.SVGPathDataParser;
var SVGPathDataTransformer_1 = require("./SVGPathDataTransformer");
exports.SVGPathDataTransformer = SVGPathDataTransformer_1.SVGPathDataTransformer;

},{"./SVGPathDataEncoder":2,"./SVGPathDataParser":3,"./SVGPathDataTransformer":4,"./TransformableSVG":5}],2:[function(require,module,exports){
"use strict";
// Encode SVG PathData
// http://www.w3.org/TR/SVG/paths.html#PathDataBNF
Object.defineProperty(exports, "__esModule", { value: true });
var SVGPathData_1 = require("./SVGPathData");
// Private consts : Char groups
var WSP = " ";
function encodeSVGPath(commands) {
    var str = "";
    if (!Array.isArray(commands)) {
        commands = [commands];
    }
    for (var i = 0; i < commands.length; i++) {
        var command = commands[i];
        if (command.type === SVGPathData_1.SVGPathData.CLOSE_PATH) {
            str += "z";
        }
        else if (command.type === SVGPathData_1.SVGPathData.HORIZ_LINE_TO) {
            str += (command.relative ? "h" : "H") +
                command.x;
        }
        else if (command.type === SVGPathData_1.SVGPathData.VERT_LINE_TO) {
            str += (command.relative ? "v" : "V") +
                command.y;
        }
        else if (command.type === SVGPathData_1.SVGPathData.MOVE_TO) {
            str += (command.relative ? "m" : "M") +
                command.x + WSP + command.y;
        }
        else if (command.type === SVGPathData_1.SVGPathData.LINE_TO) {
            str += (command.relative ? "l" : "L") +
                command.x + WSP + command.y;
        }
        else if (command.type === SVGPathData_1.SVGPathData.CURVE_TO) {
            str += (command.relative ? "c" : "C") +
                command.x1 + WSP + command.y1 +
                WSP + command.x2 + WSP + command.y2 +
                WSP + command.x + WSP + command.y;
        }
        else if (command.type === SVGPathData_1.SVGPathData.SMOOTH_CURVE_TO) {
            str += (command.relative ? "s" : "S") +
                command.x2 + WSP + command.y2 +
                WSP + command.x + WSP + command.y;
        }
        else if (command.type === SVGPathData_1.SVGPathData.QUAD_TO) {
            str += (command.relative ? "q" : "Q") +
                command.x1 + WSP + command.y1 +
                WSP + command.x + WSP + command.y;
        }
        else if (command.type === SVGPathData_1.SVGPathData.SMOOTH_QUAD_TO) {
            str += (command.relative ? "t" : "T") +
                command.x + WSP + command.y;
        }
        else if (command.type === SVGPathData_1.SVGPathData.ARC) {
            str += (command.relative ? "a" : "A") +
                command.rX + WSP + command.rY +
                WSP + command.xRot +
                WSP + (+command.lArcFlag) + WSP + (+command.sweepFlag) +
                WSP + command.x + WSP + command.y;
        }
        else {
            // Unknown command
            throw new Error("Unexpected command type \"" + command.type + "\" at index " + i + ".");
        }
    }
    return str;
}
exports.encodeSVGPath = encodeSVGPath;

},{"./SVGPathData":1}],3:[function(require,module,exports){
"use strict";
// Parse SVG PathData
// http://www.w3.org/TR/SVG/paths.html#PathDataBNF
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var SVGPathData_1 = require("./SVGPathData");
var TransformableSVG_1 = require("./TransformableSVG");
// Private consts : Char groups
var WSP = [" ", "\t", "\r", "\n"];
var DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
var SIGNS = ["-", "+"];
var EXPONENTS = ["e", "E"];
var DECPOINT = ["."];
var FLAGS = ["0", "1"];
var COMMA = [","];
var COMMANDS = [
    "m",
    "M",
    "z",
    "Z",
    "l",
    "L",
    "h",
    "H",
    "v",
    "V",
    "c",
    "C",
    "s",
    "S",
    "q",
    "Q",
    "t",
    "T",
    "a",
    "A",
];
var SVGPathDataParser = /** @class */ (function (_super) {
    __extends(SVGPathDataParser, _super);
    function SVGPathDataParser() {
        var _this = _super.call(this) || this;
        _this.curCommand = undefined;
        _this.state = SVGPathDataParser.STATE_COMMAS_WSPS;
        _this.curNumber = "";
        return _this;
    }
    SVGPathDataParser.prototype.finish = function (commands) {
        if (commands === void 0) { commands = []; }
        var result = this.parse(" ", commands);
        // Adding residual command
        if (undefined !== this.curCommand) {
            if (this.curCommand.invalid) {
                throw new SyntaxError("Unterminated command at the path end.");
            }
            commands.push(this.curCommand);
            this.curCommand = undefined;
            this.state ^= this.state & SVGPathDataParser.STATE_COMMANDS_MASK;
        }
        return result;
    };
    SVGPathDataParser.prototype.parse = function (str, commands) {
        if (commands === void 0) { commands = []; }
        for (var i = 0; i < str.length; i++) {
            // White spaces parsing
            if (this.state & SVGPathDataParser.STATE_WSP ||
                this.state & SVGPathDataParser.STATE_WSPS) {
                if (-1 !== WSP.indexOf(str[i])) {
                    this.state ^= this.state & SVGPathDataParser.STATE_WSP;
                    // any space stops current number parsing
                    if ("" !== this.curNumber) {
                        this.state ^= this.state & SVGPathDataParser.STATE_NUMBER_MASK;
                    }
                    else {
                        continue;
                    }
                }
            }
            // Commas parsing
            if (this.state & SVGPathDataParser.STATE_COMMA ||
                this.state & SVGPathDataParser.STATE_COMMAS) {
                if (-1 !== COMMA.indexOf(str[i])) {
                    this.state ^= this.state & SVGPathDataParser.STATE_COMMA;
                    // any comma stops current number parsing
                    if ("" !== this.curNumber) {
                        this.state ^= this.state & SVGPathDataParser.STATE_NUMBER_MASK;
                    }
                    else {
                        continue;
                    }
                }
            }
            // Numbers parsing : -125.25e-125
            if (this.state & SVGPathDataParser.STATE_NUMBER) {
                // Reading the sign
                if ((this.state & SVGPathDataParser.STATE_NUMBER_MASK) ===
                    SVGPathDataParser.STATE_NUMBER) {
                    this.state |=
                        SVGPathDataParser.STATE_NUMBER_INT |
                            SVGPathDataParser.STATE_NUMBER_DIGITS;
                    if (-1 !== SIGNS.indexOf(str[i])) {
                        this.curNumber += str[i];
                        continue;
                    }
                }
                // Reading the exponent sign
                if (this.state & SVGPathDataParser.STATE_NUMBER_EXPSIGN) {
                    this.state ^= SVGPathDataParser.STATE_NUMBER_EXPSIGN;
                    this.state |= SVGPathDataParser.STATE_NUMBER_DIGITS;
                    if (-1 !== SIGNS.indexOf(str[i])) {
                        this.curNumber += str[i];
                        continue;
                    }
                }
                // Reading digits
                if (this.state & SVGPathDataParser.STATE_NUMBER_DIGITS) {
                    if (-1 !== DIGITS.indexOf(str[i])) {
                        this.curNumber += str[i];
                        continue;
                    }
                    this.state ^= SVGPathDataParser.STATE_NUMBER_DIGITS;
                }
                // Ended reading left side digits
                if (this.state & SVGPathDataParser.STATE_NUMBER_INT) {
                    this.state ^= SVGPathDataParser.STATE_NUMBER_INT;
                    // if got a point, reading right side digits
                    if (-1 !== DECPOINT.indexOf(str[i])) {
                        this.curNumber += str[i];
                        this.state |=
                            SVGPathDataParser.STATE_NUMBER_FLOAT |
                                SVGPathDataParser.STATE_NUMBER_DIGITS;
                        continue;
                        // if got e/E, reading the exponent
                    }
                    else if (-1 !== EXPONENTS.indexOf(str[i])) {
                        this.curNumber += str[i];
                        this.state |=
                            SVGPathDataParser.STATE_NUMBER_EXP |
                                SVGPathDataParser.STATE_NUMBER_EXPSIGN;
                        continue;
                    }
                    // else we"re done with that number
                    this.state ^= this.state & SVGPathDataParser.STATE_NUMBER_MASK;
                }
                // Ended reading decimal digits
                if (this.state & SVGPathDataParser.STATE_NUMBER_FLOAT) {
                    this.state ^= SVGPathDataParser.STATE_NUMBER_FLOAT;
                    // if got e/E, reading the exponent
                    if (-1 !== EXPONENTS.indexOf(str[i])) {
                        this.curNumber += str[i];
                        this.state |=
                            SVGPathDataParser.STATE_NUMBER_EXP |
                                SVGPathDataParser.STATE_NUMBER_EXPSIGN;
                        continue;
                    }
                    // else we"re done with that number
                    this.state ^= this.state & SVGPathDataParser.STATE_NUMBER_MASK;
                }
                // Ended reading exponent digits
                if (this.state & SVGPathDataParser.STATE_NUMBER_EXP) {
                    // we"re done with that number
                    this.state ^= this.state & SVGPathDataParser.STATE_NUMBER_MASK;
                }
            }
            // New number
            if (this.curNumber) {
                // Horizontal move to command (x)
                if (this.state & SVGPathDataParser.STATE_HORIZ_LINE_TO) {
                    if (undefined === this.curCommand) {
                        commands.push({
                            type: SVGPathData_1.SVGPathData.HORIZ_LINE_TO,
                            relative: !!(this.state & SVGPathDataParser.STATE_RELATIVE),
                            x: Number(this.curNumber),
                        });
                    }
                    else {
                        this.curCommand.x = Number(this.curNumber);
                        delete this.curCommand.invalid;
                        commands.push(this.curCommand);
                        this.curCommand = undefined;
                    }
                    this.state |= SVGPathDataParser.STATE_NUMBER;
                    // Vertical move to command (y)
                }
                else if (this.state & SVGPathDataParser.STATE_VERT_LINE_TO) {
                    if (undefined === this.curCommand) {
                        commands.push({
                            type: SVGPathData_1.SVGPathData.VERT_LINE_TO,
                            relative: !!(this.state & SVGPathDataParser.STATE_RELATIVE),
                            y: Number(this.curNumber),
                        });
                    }
                    else {
                        this.curCommand.y = Number(this.curNumber);
                        delete this.curCommand.invalid;
                        commands.push(this.curCommand);
                        this.curCommand = undefined;
                    }
                    this.state |= SVGPathDataParser.STATE_NUMBER;
                    // Move to / line to / smooth quadratic curve to commands (x, y)
                }
                else if (this.state & SVGPathDataParser.STATE_MOVE_TO ||
                    this.state & SVGPathDataParser.STATE_LINE_TO ||
                    this.state & SVGPathDataParser.STATE_SMOOTH_QUAD_TO) {
                    if (undefined === this.curCommand) {
                        this.curCommand = {
                            type: this.state & SVGPathDataParser.STATE_MOVE_TO
                                ? SVGPathData_1.SVGPathData.MOVE_TO
                                : this.state & SVGPathDataParser.STATE_LINE_TO
                                    ? SVGPathData_1.SVGPathData.LINE_TO
                                    : SVGPathData_1.SVGPathData.SMOOTH_QUAD_TO,
                            relative: !!(this.state & SVGPathDataParser.STATE_RELATIVE),
                            x: Number(this.curNumber),
                        };
                    }
                    else if (undefined === this.curCommand.x) {
                        this.curCommand.x = Number(this.curNumber);
                    }
                    else {
                        delete this.curCommand.invalid;
                        this.curCommand.y = Number(this.curNumber);
                        commands.push(this.curCommand);
                        this.curCommand = undefined;
                        // Switch to line to state
                        if (this.state & SVGPathDataParser.STATE_MOVE_TO) {
                            this.state ^= SVGPathDataParser.STATE_MOVE_TO;
                            this.state |= SVGPathDataParser.STATE_LINE_TO;
                        }
                    }
                    this.state |= SVGPathDataParser.STATE_NUMBER;
                    // Curve to commands (x1, y1, x2, y2, x, y)
                }
                else if (this.state & SVGPathDataParser.STATE_CURVE_TO) {
                    if (undefined === this.curCommand) {
                        this.curCommand = {
                            type: SVGPathData_1.SVGPathData.CURVE_TO,
                            relative: !!(this.state & SVGPathDataParser.STATE_RELATIVE),
                            invalid: true,
                            x1: Number(this.curNumber),
                        };
                    }
                    else if (undefined === this.curCommand.x1) {
                        this.curCommand.x1 = Number(this.curNumber);
                    }
                    else if (undefined === this.curCommand.y1) {
                        this.curCommand.y1 = Number(this.curNumber);
                    }
                    else if (undefined === this.curCommand.x2) {
                        this.curCommand.x2 = Number(this.curNumber);
                    }
                    else if (undefined === this.curCommand.y2) {
                        this.curCommand.y2 = Number(this.curNumber);
                    }
                    else if (undefined === this.curCommand.x) {
                        this.curCommand.x = Number(this.curNumber);
                    }
                    else if (undefined === this.curCommand.y) {
                        this.curCommand.y = Number(this.curNumber);
                        delete this.curCommand.invalid;
                        commands.push(this.curCommand);
                        this.curCommand = undefined;
                    }
                    this.state |= SVGPathDataParser.STATE_NUMBER;
                    // Smooth curve to commands (x1, y1, x, y)
                }
                else if (this.state & SVGPathDataParser.STATE_SMOOTH_CURVE_TO) {
                    if (undefined === this.curCommand) {
                        this.curCommand = {
                            type: SVGPathData_1.SVGPathData.SMOOTH_CURVE_TO,
                            relative: !!(this.state & SVGPathDataParser.STATE_RELATIVE),
                            invalid: true,
                            x2: Number(this.curNumber),
                        };
                    }
                    else if (undefined === this.curCommand.x2) {
                        this.curCommand.x2 = Number(this.curNumber);
                    }
                    else if (undefined === this.curCommand.y2) {
                        this.curCommand.y2 = Number(this.curNumber);
                    }
                    else if (undefined === this.curCommand.x) {
                        this.curCommand.x = Number(this.curNumber);
                    }
                    else if (undefined === this.curCommand.y) {
                        this.curCommand.y = Number(this.curNumber);
                        delete this.curCommand.invalid;
                        commands.push(this.curCommand);
                        this.curCommand = undefined;
                    }
                    this.state |= SVGPathDataParser.STATE_NUMBER;
                    // Quadratic bezier curve to commands (x1, y1, x, y)
                }
                else if (this.state & SVGPathDataParser.STATE_QUAD_TO) {
                    if (undefined === this.curCommand) {
                        this.curCommand = {
                            type: SVGPathData_1.SVGPathData.QUAD_TO,
                            relative: !!(this.state & SVGPathDataParser.STATE_RELATIVE),
                            invalid: true,
                            x1: Number(this.curNumber),
                        };
                    }
                    else if (undefined === this.curCommand.x1) {
                        this.curCommand.x1 = Number(this.curNumber);
                    }
                    else if (undefined === this.curCommand.y1) {
                        this.curCommand.y1 = Number(this.curNumber);
                    }
                    else if (undefined === this.curCommand.x) {
                        this.curCommand.x = Number(this.curNumber);
                    }
                    else if (undefined === this.curCommand.y) {
                        this.curCommand.y = Number(this.curNumber);
                        delete this.curCommand.invalid;
                        commands.push(this.curCommand);
                        this.curCommand = undefined;
                    }
                    this.state |= SVGPathDataParser.STATE_NUMBER;
                    // Elliptic arc commands (rX, rY, xRot, lArcFlag, sweepFlag, x, y)
                }
                else if (this.state & SVGPathDataParser.STATE_ARC) {
                    if (undefined === this.curCommand) {
                        this.curCommand = {
                            type: SVGPathData_1.SVGPathData.ARC,
                            relative: !!(this.state & SVGPathDataParser.STATE_RELATIVE),
                            invalid: true,
                            rX: Number(this.curNumber),
                        };
                    }
                    else if (undefined === this.curCommand.rX) {
                        if (0 > Number(this.curNumber)) {
                            throw new SyntaxError("Expected positive number, got \"" + this.curNumber + "\" at index \"" + i + "\"");
                        }
                        this.curCommand.rX = Number(this.curNumber);
                    }
                    else if (undefined === this.curCommand.rY) {
                        if (0 > Number(this.curNumber)) {
                            throw new SyntaxError("Expected positive number, got \"" + this.curNumber + "\" at index \"" + i + "\"");
                        }
                        this.curCommand.rY = Number(this.curNumber);
                    }
                    else if (undefined === this.curCommand.xRot) {
                        this.curCommand.xRot = Number(this.curNumber);
                    }
                    else if (undefined === this.curCommand.lArcFlag) {
                        if (-1 === FLAGS.indexOf(this.curNumber)) {
                            throw new SyntaxError("Expected a flag, got \"" + this.curNumber + "\" at index \"" + i + "\"");
                        }
                        this.curCommand.lArcFlag = Number(this.curNumber);
                    }
                    else if (undefined === this.curCommand.sweepFlag) {
                        if ("0" !== this.curNumber && "1" !== this.curNumber) {
                            throw new SyntaxError("Expected a flag, got \"" + this.curNumber + "\" at index \"" + i + "\"");
                        }
                        this.curCommand.sweepFlag = Number(this.curNumber);
                    }
                    else if (undefined === this.curCommand.x) {
                        this.curCommand.x = Number(this.curNumber);
                    }
                    else if (undefined === this.curCommand.y) {
                        this.curCommand.y = Number(this.curNumber);
                        delete this.curCommand.invalid;
                        commands.push(this.curCommand);
                        this.curCommand = undefined;
                    }
                    this.state |= SVGPathDataParser.STATE_NUMBER;
                }
                this.curNumber = "";
                // Continue if a white space or a comma was detected
                if (-1 !== WSP.indexOf(str[i]) || -1 !== COMMA.indexOf(str[i])) {
                    continue;
                }
                // if a sign is detected, then parse the new number
                if (-1 !== SIGNS.indexOf(str[i])) {
                    this.curNumber = str[i];
                    this.state |=
                        SVGPathDataParser.STATE_NUMBER_INT |
                            SVGPathDataParser.STATE_NUMBER_DIGITS;
                    continue;
                }
                // if the decpoint is detected, then parse the new number
                if (-1 !== DECPOINT.indexOf(str[i])) {
                    this.curNumber = str[i];
                    this.state |=
                        SVGPathDataParser.STATE_NUMBER_FLOAT |
                            SVGPathDataParser.STATE_NUMBER_DIGITS;
                    continue;
                }
            }
            // End of a command
            if (-1 !== COMMANDS.indexOf(str[i])) {
                // Adding residual command
                if (undefined !== this.curCommand) {
                    if (this.curCommand.invalid) {
                        throw new SyntaxError("Unterminated command at index " + i + ".");
                    }
                    commands.push(this.curCommand);
                    this.curCommand = undefined;
                    this.state ^= this.state & SVGPathDataParser.STATE_COMMANDS_MASK;
                }
            }
            // Detecting the next command
            this.state ^= this.state & SVGPathDataParser.STATE_COMMANDS_MASK;
            // Is the command relative
            if (str[i] === str[i].toLowerCase()) {
                this.state |= SVGPathDataParser.STATE_RELATIVE;
            }
            else {
                this.state ^= this.state & SVGPathDataParser.STATE_RELATIVE;
            }
            // Horizontal move to command
            if ("z" === str[i].toLowerCase()) {
                commands.push({
                    type: SVGPathData_1.SVGPathData.CLOSE_PATH,
                });
                this.state = SVGPathDataParser.STATE_COMMAS_WSPS;
                continue;
                // Horizontal move to command
            }
            else if ("h" === str[i].toLowerCase()) {
                this.state |= SVGPathDataParser.STATE_HORIZ_LINE_TO;
                this.curCommand = {
                    type: SVGPathData_1.SVGPathData.HORIZ_LINE_TO,
                    relative: !!(this.state & SVGPathDataParser.STATE_RELATIVE),
                    invalid: true,
                };
                // Vertical move to command
            }
            else if ("v" === str[i].toLowerCase()) {
                this.state |= SVGPathDataParser.STATE_VERT_LINE_TO;
                this.curCommand = {
                    type: SVGPathData_1.SVGPathData.VERT_LINE_TO,
                    relative: !!(this.state & SVGPathDataParser.STATE_RELATIVE),
                    invalid: true,
                };
                // Move to command
            }
            else if ("m" === str[i].toLowerCase()) {
                this.state |= SVGPathDataParser.STATE_MOVE_TO;
                this.curCommand = {
                    type: SVGPathData_1.SVGPathData.MOVE_TO,
                    relative: !!(this.state & SVGPathDataParser.STATE_RELATIVE),
                    invalid: true,
                };
                // Line to command
            }
            else if ("l" === str[i].toLowerCase()) {
                this.state |= SVGPathDataParser.STATE_LINE_TO;
                this.curCommand = {
                    type: SVGPathData_1.SVGPathData.LINE_TO,
                    relative: !!(this.state & SVGPathDataParser.STATE_RELATIVE),
                    invalid: true,
                };
                // Curve to command
            }
            else if ("c" === str[i].toLowerCase()) {
                this.state |= SVGPathDataParser.STATE_CURVE_TO;
                this.curCommand = {
                    type: SVGPathData_1.SVGPathData.CURVE_TO,
                    relative: !!(this.state & SVGPathDataParser.STATE_RELATIVE),
                    invalid: true,
                };
                // Smooth curve to command
            }
            else if ("s" === str[i].toLowerCase()) {
                this.state |= SVGPathDataParser.STATE_SMOOTH_CURVE_TO;
                this.curCommand = {
                    type: SVGPathData_1.SVGPathData.SMOOTH_CURVE_TO,
                    relative: !!(this.state & SVGPathDataParser.STATE_RELATIVE),
                    invalid: true,
                };
                // Quadratic bezier curve to command
            }
            else if ("q" === str[i].toLowerCase()) {
                this.state |= SVGPathDataParser.STATE_QUAD_TO;
                this.curCommand = {
                    type: SVGPathData_1.SVGPathData.QUAD_TO,
                    relative: !!(this.state & SVGPathDataParser.STATE_RELATIVE),
                    invalid: true,
                };
                // Smooth quadratic bezier curve to command
            }
            else if ("t" === str[i].toLowerCase()) {
                this.state |= SVGPathDataParser.STATE_SMOOTH_QUAD_TO;
                this.curCommand = {
                    type: SVGPathData_1.SVGPathData.SMOOTH_QUAD_TO,
                    relative: !!(this.state & SVGPathDataParser.STATE_RELATIVE),
                    invalid: true,
                };
                // Elliptic arc command
            }
            else if ("a" === str[i].toLowerCase()) {
                this.state |= SVGPathDataParser.STATE_ARC;
                this.curCommand = {
                    type: SVGPathData_1.SVGPathData.ARC,
                    relative: !!(this.state & SVGPathDataParser.STATE_RELATIVE),
                    invalid: true,
                };
                // Unkown command
            }
            else {
                throw new SyntaxError("Unexpected character \"" + str[i] + "\" at index " + i + ".");
            }
            // White spaces can follow a command
            this.state |=
                SVGPathDataParser.STATE_COMMAS_WSPS | SVGPathDataParser.STATE_NUMBER;
        }
        return commands;
    };
    /**
     * Return a wrapper around this parser which applies the transformation on parsed commands.
     */
    SVGPathDataParser.prototype.transform = function (transform) {
        var result = Object.create(this, {
            parse: {
                value: function (chunk, commands) {
                    if (commands === void 0) { commands = []; }
                    var parsedCommands = Object.getPrototypeOf(this).parse.call(this, chunk);
                    for (var _i = 0, parsedCommands_1 = parsedCommands; _i < parsedCommands_1.length; _i++) {
                        var c = parsedCommands_1[_i];
                        var cT = transform(c);
                        if (Array.isArray(cT)) {
                            commands.push.apply(commands, cT);
                        }
                        else {
                            commands.push(cT);
                        }
                    }
                    return commands;
                },
            },
        });
        return result;
    };
    // Parsing states
    SVGPathDataParser.STATE_WSP = 1;
    SVGPathDataParser.STATE_WSPS = 2;
    SVGPathDataParser.STATE_COMMA = 4;
    SVGPathDataParser.STATE_COMMAS = 8;
    SVGPathDataParser.STATE_COMMAS_WSPS = SVGPathDataParser.STATE_WSP |
        SVGPathDataParser.STATE_WSPS |
        SVGPathDataParser.STATE_COMMA |
        SVGPathDataParser.STATE_COMMAS;
    SVGPathDataParser.STATE_NUMBER = 16;
    SVGPathDataParser.STATE_NUMBER_DIGITS = 32;
    SVGPathDataParser.STATE_NUMBER_INT = 64;
    SVGPathDataParser.STATE_NUMBER_FLOAT = 128;
    SVGPathDataParser.STATE_NUMBER_EXP = 256;
    SVGPathDataParser.STATE_NUMBER_EXPSIGN = 512;
    SVGPathDataParser.STATE_NUMBER_MASK = SVGPathDataParser.STATE_NUMBER |
        SVGPathDataParser.STATE_NUMBER_DIGITS |
        SVGPathDataParser.STATE_NUMBER_INT |
        SVGPathDataParser.STATE_NUMBER_EXP |
        SVGPathDataParser.STATE_NUMBER_FLOAT;
    SVGPathDataParser.STATE_RELATIVE = 1024;
    SVGPathDataParser.STATE_CLOSE_PATH = 2048; // Close path command (z/Z)
    SVGPathDataParser.STATE_MOVE_TO = 4096; // Move to command (m/M)
    SVGPathDataParser.STATE_LINE_TO = 8192; // Line to command (l/L=)
    SVGPathDataParser.STATE_HORIZ_LINE_TO = 16384; // Horizontal line to command (h/H)
    SVGPathDataParser.STATE_VERT_LINE_TO = 32768; // Vertical line to command (v/V)
    SVGPathDataParser.STATE_CURVE_TO = 65536; // Curve to command (c/C)
    SVGPathDataParser.STATE_SMOOTH_CURVE_TO = 131072; // Smooth curve to command (s/S)
    SVGPathDataParser.STATE_QUAD_TO = 262144; // Quadratic bezier curve to command (q/Q)
    SVGPathDataParser.STATE_SMOOTH_QUAD_TO = 524288; // Smooth quadratic bezier curve to command (t/T)
    SVGPathDataParser.STATE_ARC = 1048576; // Elliptic arc command (a/A)
    SVGPathDataParser.STATE_COMMANDS_MASK = SVGPathDataParser.STATE_CLOSE_PATH |
        SVGPathDataParser.STATE_MOVE_TO |
        SVGPathDataParser.STATE_LINE_TO |
        SVGPathDataParser.STATE_HORIZ_LINE_TO |
        SVGPathDataParser.STATE_VERT_LINE_TO |
        SVGPathDataParser.STATE_CURVE_TO |
        SVGPathDataParser.STATE_SMOOTH_CURVE_TO |
        SVGPathDataParser.STATE_QUAD_TO |
        SVGPathDataParser.STATE_SMOOTH_QUAD_TO |
        SVGPathDataParser.STATE_ARC;
    return SVGPathDataParser;
}(TransformableSVG_1.TransformableSVG));
exports.SVGPathDataParser = SVGPathDataParser;

},{"./SVGPathData":1,"./TransformableSVG":5}],4:[function(require,module,exports){
"use strict";
// Transform SVG PathData
// http://www.w3.org/TR/SVG/paths.html#PathDataBNF
Object.defineProperty(exports, "__esModule", { value: true });
var mathUtils_js_1 = require("./mathUtils.js");
var SVGPathData_1 = require("./SVGPathData");
var SVGPathDataTransformer;
(function (SVGPathDataTransformer) {
    // Predefined transforming functions
    // Rounds commands values
    function ROUND(roundVal) {
        if (roundVal === void 0) { roundVal = 1e13; }
        mathUtils_js_1.assertNumbers(roundVal);
        function rf(val) { return Math.round(val * roundVal) / roundVal; }
        return function round(command) {
            if ("undefined" !== typeof command.x1) {
                command.x1 = rf(command.x1);
            }
            if ("undefined" !== typeof command.y1) {
                command.y1 = rf(command.y1);
            }
            if ("undefined" !== typeof command.x2) {
                command.x2 = rf(command.x2);
            }
            if ("undefined" !== typeof command.y2) {
                command.y2 = rf(command.y2);
            }
            if ("undefined" !== typeof command.x) {
                command.x = rf(command.x);
            }
            if ("undefined" !== typeof command.y) {
                command.y = rf(command.y);
            }
            return command;
        };
    }
    SVGPathDataTransformer.ROUND = ROUND;
    // Relative to absolute commands
    function TO_ABS() {
        return INFO(function (command, prevX, prevY) {
            if (command.relative) {
                // x1/y1 values
                if ("undefined" !== typeof command.x1) {
                    command.x1 += prevX;
                }
                if ("undefined" !== typeof command.y1) {
                    command.y1 += prevY;
                }
                // x2/y2 values
                if ("undefined" !== typeof command.x2) {
                    command.x2 += prevX;
                }
                if ("undefined" !== typeof command.y2) {
                    command.y2 += prevY;
                }
                // Finally x/y values
                if ("undefined" !== typeof command.x) {
                    command.x += prevX;
                }
                if ("undefined" !== typeof command.y) {
                    command.y += prevY;
                }
                command.relative = false;
            }
            return command;
        });
    }
    SVGPathDataTransformer.TO_ABS = TO_ABS;
    // Absolute to relative commands
    function TO_REL() {
        return INFO(function (command, prevX, prevY) {
            if (!command.relative) {
                // x1/y1 values
                if ("undefined" !== typeof command.x1) {
                    command.x1 -= prevX;
                }
                if ("undefined" !== typeof command.y1) {
                    command.y1 -= prevY;
                }
                // x2/y2 values
                if ("undefined" !== typeof command.x2) {
                    command.x2 -= prevX;
                }
                if ("undefined" !== typeof command.y2) {
                    command.y2 -= prevY;
                }
                // Finally x/y values
                if ("undefined" !== typeof command.x) {
                    command.x -= prevX;
                }
                if ("undefined" !== typeof command.y) {
                    command.y -= prevY;
                }
                command.relative = true;
            }
            return command;
        });
    }
    SVGPathDataTransformer.TO_REL = TO_REL;
    // Convert H, V, Z and A with rX = 0 to L
    function NORMALIZE_HVZ(normalizeZ, normalizeH, normalizeV) {
        if (normalizeZ === void 0) { normalizeZ = true; }
        if (normalizeH === void 0) { normalizeH = true; }
        if (normalizeV === void 0) { normalizeV = true; }
        return INFO(function (command, prevX, prevY, pathStartX, pathStartY) {
            if (isNaN(pathStartX) && !(command.type & SVGPathData_1.SVGPathData.MOVE_TO)) {
                throw new Error("path must start with moveto");
            }
            if (normalizeH && command.type & SVGPathData_1.SVGPathData.HORIZ_LINE_TO) {
                command.type = SVGPathData_1.SVGPathData.LINE_TO;
                command.y = command.relative ? 0 : prevY;
            }
            if (normalizeV && command.type & SVGPathData_1.SVGPathData.VERT_LINE_TO) {
                command.type = SVGPathData_1.SVGPathData.LINE_TO;
                command.x = command.relative ? 0 : prevX;
            }
            if (normalizeZ && command.type & SVGPathData_1.SVGPathData.CLOSE_PATH) {
                command.type = SVGPathData_1.SVGPathData.LINE_TO;
                command.x = command.relative ? pathStartX - prevX : pathStartX;
                command.y = command.relative ? pathStartY - prevY : pathStartY;
            }
            if (command.type & SVGPathData_1.SVGPathData.ARC && (0 === command.rX || 0 === command.rY)) {
                command.type = SVGPathData_1.SVGPathData.LINE_TO;
                delete command.rX;
                delete command.rY;
                delete command.xRot;
                delete command.lArcFlag;
                delete command.sweepFlag;
            }
            return command;
        });
    }
    SVGPathDataTransformer.NORMALIZE_HVZ = NORMALIZE_HVZ;
    /*
     * Transforms smooth curves and quads to normal curves and quads (SsTt to CcQq)
     */
    function NORMALIZE_ST() {
        var prevCurveC2X = NaN;
        var prevCurveC2Y = NaN;
        var prevQuadCX = NaN;
        var prevQuadCY = NaN;
        return INFO(function (command, prevX, prevY) {
            if (command.type & SVGPathData_1.SVGPathData.SMOOTH_CURVE_TO) {
                command.type = SVGPathData_1.SVGPathData.CURVE_TO;
                prevCurveC2X = isNaN(prevCurveC2X) ? prevX : prevCurveC2X;
                prevCurveC2Y = isNaN(prevCurveC2Y) ? prevY : prevCurveC2Y;
                command.x1 = command.relative ? prevX - prevCurveC2X : 2 * prevX - prevCurveC2X;
                command.y1 = command.relative ? prevY - prevCurveC2Y : 2 * prevY - prevCurveC2Y;
            }
            if (command.type & SVGPathData_1.SVGPathData.CURVE_TO) {
                prevCurveC2X = command.relative ? prevX + command.x2 : command.x2;
                prevCurveC2Y = command.relative ? prevY + command.y2 : command.y2;
            }
            else {
                prevCurveC2X = NaN;
                prevCurveC2Y = NaN;
            }
            if (command.type & SVGPathData_1.SVGPathData.SMOOTH_QUAD_TO) {
                command.type = SVGPathData_1.SVGPathData.QUAD_TO;
                prevQuadCX = isNaN(prevQuadCX) ? prevX : prevQuadCX;
                prevQuadCY = isNaN(prevQuadCY) ? prevY : prevQuadCY;
                command.x1 = command.relative ? prevX - prevQuadCX : 2 * prevX - prevQuadCX;
                command.y1 = command.relative ? prevY - prevQuadCY : 2 * prevY - prevQuadCY;
            }
            if (command.type & SVGPathData_1.SVGPathData.QUAD_TO) {
                prevQuadCX = command.relative ? prevX + command.x1 : command.x1;
                prevQuadCY = command.relative ? prevY + command.y1 : command.y1;
            }
            else {
                prevQuadCX = NaN;
                prevQuadCY = NaN;
            }
            return command;
        });
    }
    SVGPathDataTransformer.NORMALIZE_ST = NORMALIZE_ST;
    /*
     * A quadratic bézier curve can be represented by a cubic bézier curve which has
     * the same end points as the quadratic and both control points in place of the
     * quadratic"s one.
     *
     * This transformer replaces QqTt commands with Cc commands respectively.
     * This is useful for reading path data into a system which only has a
     * representation for cubic curves.
     */
    function QT_TO_C() {
        var prevQuadX1 = NaN;
        var prevQuadY1 = NaN;
        return INFO(function (command, prevX, prevY) {
            if (command.type & SVGPathData_1.SVGPathData.SMOOTH_QUAD_TO) {
                command.type = SVGPathData_1.SVGPathData.QUAD_TO;
                prevQuadX1 = isNaN(prevQuadX1) ? prevX : prevQuadX1;
                prevQuadY1 = isNaN(prevQuadY1) ? prevY : prevQuadY1;
                command.x1 = command.relative ? prevX - prevQuadX1 : 2 * prevX - prevQuadX1;
                command.y1 = command.relative ? prevY - prevQuadY1 : 2 * prevY - prevQuadY1;
            }
            if (command.type & SVGPathData_1.SVGPathData.QUAD_TO) {
                prevQuadX1 = command.relative ? prevX + command.x1 : command.x1;
                prevQuadY1 = command.relative ? prevY + command.y1 : command.y1;
                var x1 = command.x1;
                var y1 = command.y1;
                command.type = SVGPathData_1.SVGPathData.CURVE_TO;
                command.x1 = ((command.relative ? 0 : prevX) + x1 * 2) / 3;
                command.y1 = ((command.relative ? 0 : prevY) + y1 * 2) / 3;
                command.x2 = (command.x + x1 * 2) / 3;
                command.y2 = (command.y + y1 * 2) / 3;
            }
            else {
                prevQuadX1 = NaN;
                prevQuadY1 = NaN;
            }
            return command;
        });
    }
    SVGPathDataTransformer.QT_TO_C = QT_TO_C;
    function INFO(f) {
        var prevXAbs = 0;
        var prevYAbs = 0;
        var pathStartXAbs = NaN;
        var pathStartYAbs = NaN;
        return function transform(command) {
            if (isNaN(pathStartXAbs) && !(command.type & SVGPathData_1.SVGPathData.MOVE_TO)) {
                throw new Error("path must start with moveto");
            }
            var result = f(command, prevXAbs, prevYAbs, pathStartXAbs, pathStartYAbs);
            if (command.type & SVGPathData_1.SVGPathData.CLOSE_PATH) {
                prevXAbs = pathStartXAbs;
                prevYAbs = pathStartYAbs;
            }
            if ("undefined" !== typeof command.x) {
                prevXAbs = (command.relative ? prevXAbs + command.x : command.x);
            }
            if ("undefined" !== typeof command.y) {
                prevYAbs = (command.relative ? prevYAbs + command.y : command.y);
            }
            if (command.type & SVGPathData_1.SVGPathData.MOVE_TO) {
                pathStartXAbs = prevXAbs;
                pathStartYAbs = prevYAbs;
            }
            return result;
        };
    }
    SVGPathDataTransformer.INFO = INFO;
    /*
     * remove 0-length segments
     */
    function SANITIZE(EPS) {
        if (EPS === void 0) { EPS = 0; }
        mathUtils_js_1.assertNumbers(EPS);
        var prevCurveC2X = NaN;
        var prevCurveC2Y = NaN;
        var prevQuadCX = NaN;
        var prevQuadCY = NaN;
        return INFO(function (command, prevX, prevY, pathStartX, pathStartY) {
            var abs = Math.abs;
            var skip = false;
            var x1Rel = 0;
            var y1Rel = 0;
            if (command.type & SVGPathData_1.SVGPathData.SMOOTH_CURVE_TO) {
                x1Rel = isNaN(prevCurveC2X) ? 0 : prevX - prevCurveC2X;
                y1Rel = isNaN(prevCurveC2Y) ? 0 : prevY - prevCurveC2Y;
            }
            if (command.type & (SVGPathData_1.SVGPathData.CURVE_TO | SVGPathData_1.SVGPathData.SMOOTH_CURVE_TO)) {
                prevCurveC2X = command.relative ? prevX + command.x2 : command.x2;
                prevCurveC2Y = command.relative ? prevY + command.y2 : command.y2;
            }
            else {
                prevCurveC2X = NaN;
                prevCurveC2Y = NaN;
            }
            if (command.type & SVGPathData_1.SVGPathData.SMOOTH_QUAD_TO) {
                prevQuadCX = isNaN(prevQuadCX) ? prevX : 2 * prevX - prevQuadCX;
                prevQuadCY = isNaN(prevQuadCY) ? prevY : 2 * prevY - prevQuadCY;
            }
            else if (command.type & SVGPathData_1.SVGPathData.QUAD_TO) {
                prevQuadCX = command.relative ? prevX + command.x1 : command.x1;
                prevQuadCY = command.relative ? prevY + command.y1 : command.y2;
            }
            else {
                prevQuadCX = NaN;
                prevQuadCY = NaN;
            }
            if (command.type & SVGPathData_1.SVGPathData.LINE_COMMANDS ||
                command.type & SVGPathData_1.SVGPathData.ARC && (0 === command.rX || 0 === command.rY || !command.lArcFlag) ||
                command.type & SVGPathData_1.SVGPathData.CURVE_TO || command.type & SVGPathData_1.SVGPathData.SMOOTH_CURVE_TO ||
                command.type & SVGPathData_1.SVGPathData.QUAD_TO || command.type & SVGPathData_1.SVGPathData.SMOOTH_QUAD_TO) {
                var xRel = "undefined" === typeof command.x ? 0 :
                    (command.relative ? command.x : command.x - prevX);
                var yRel = "undefined" === typeof command.y ? 0 :
                    (command.relative ? command.y : command.y - prevY);
                x1Rel = !isNaN(prevQuadCX) ? prevQuadCX - prevX :
                    "undefined" === typeof command.x1 ? x1Rel :
                        command.relative ? command.x :
                            command.x1 - prevX;
                y1Rel = !isNaN(prevQuadCY) ? prevQuadCY - prevY :
                    "undefined" === typeof command.y1 ? y1Rel :
                        command.relative ? command.y :
                            command.y1 - prevY;
                var x2Rel = "undefined" === typeof command.x2 ? 0 :
                    (command.relative ? command.x : command.x2 - prevX);
                var y2Rel = "undefined" === typeof command.y2 ? 0 :
                    (command.relative ? command.y : command.y2 - prevY);
                if (abs(xRel) <= EPS && abs(yRel) <= EPS &&
                    abs(x1Rel) <= EPS && abs(y1Rel) <= EPS &&
                    abs(x2Rel) <= EPS && abs(y2Rel) <= EPS) {
                    skip = true;
                }
            }
            if (command.type & SVGPathData_1.SVGPathData.CLOSE_PATH) {
                if (abs(prevX - pathStartX) <= EPS && abs(prevY - pathStartY) <= EPS) {
                    skip = true;
                }
            }
            return skip ? [] : command;
        });
    }
    SVGPathDataTransformer.SANITIZE = SANITIZE;
    // SVG Transforms : http://www.w3.org/TR/SVGTiny12/coords.html#TransformList
    // Matrix : http://apike.ca/prog_svg_transform.html
    // a c e
    // b d f
    function MATRIX(a, b, c, d, e, f) {
        mathUtils_js_1.assertNumbers(a, b, c, d, e, f);
        return INFO(function (command, prevX, prevY, pathStartX) {
            var origX1 = command.x1;
            var origX2 = command.x2;
            // if isNaN(pathStartX), then this is the first command, which is ALWAYS an
            // absolute MOVE_TO, regardless what the relative flag says
            var comRel = command.relative && !isNaN(pathStartX);
            var x = "undefined" !== typeof command.x ? command.x : (comRel ? 0 : prevX);
            var y = "undefined" !== typeof command.y ? command.y : (comRel ? 0 : prevY);
            if (command.type & SVGPathData_1.SVGPathData.HORIZ_LINE_TO && 0 !== b) {
                command.type = SVGPathData_1.SVGPathData.LINE_TO;
                command.y = command.relative ? 0 : prevY;
            }
            if (command.type & SVGPathData_1.SVGPathData.VERT_LINE_TO && 0 !== c) {
                command.type = SVGPathData_1.SVGPathData.LINE_TO;
                command.x = command.relative ? 0 : prevX;
            }
            if ("undefined" !== typeof command.x) {
                command.x = (command.x * a) + (y * c) + (comRel ? 0 : e);
            }
            if ("undefined" !== typeof command.y) {
                command.y = (x * b) + command.y * d + (comRel ? 0 : f);
            }
            if ("undefined" !== typeof command.x1) {
                command.x1 = command.x1 * a + command.y1 * c + (comRel ? 0 : e);
            }
            if ("undefined" !== typeof command.y1) {
                command.y1 = origX1 * b + command.y1 * d + (comRel ? 0 : f);
            }
            if ("undefined" !== typeof command.x2) {
                command.x2 = command.x2 * a + command.y2 * c + (comRel ? 0 : e);
            }
            if ("undefined" !== typeof command.y2) {
                command.y2 = origX2 * b + command.y2 * d + (comRel ? 0 : f);
            }
            function sqr(x) { return x * x; }
            var det = a * d - b * c;
            if ("undefined" !== typeof command.xRot) {
                // Skip if this is a pure translation
                if (1 !== a || 0 !== b || 0 !== c || 1 !== d) {
                    // Special case for singular matrix
                    if (0 === det) {
                        // In the singular case, the arc is compressed to a line. The actual geometric image of the original
                        // curve under this transform possibly extends beyond the starting and/or ending points of the segment, but
                        // for simplicity we ignore this detail and just replace this command with a single line segment.
                        delete command.rX;
                        delete command.rY;
                        delete command.xRot;
                        delete command.lArcFlag;
                        delete command.sweepFlag;
                        command.type = SVGPathData_1.SVGPathData.LINE_TO;
                    }
                    else {
                        // Convert to radians
                        var xRot = command.xRot * Math.PI / 180;
                        // Convert rotated ellipse to general conic form
                        // x0^2/rX^2 + y0^2/rY^2 - 1 = 0
                        // x0 = x*cos(xRot) + y*sin(xRot)
                        // y0 = -x*sin(xRot) + y*cos(xRot)
                        // --> A*x^2 + B*x*y + C*y^2 - 1 = 0, where
                        var sinRot = Math.sin(xRot);
                        var cosRot = Math.cos(xRot);
                        var xCurve = 1 / sqr(command.rX);
                        var yCurve = 1 / sqr(command.rY);
                        var A = sqr(cosRot) * xCurve + sqr(sinRot) * yCurve;
                        var B = 2 * sinRot * cosRot * (xCurve - yCurve);
                        var C = sqr(sinRot) * xCurve + sqr(cosRot) * yCurve;
                        // Apply matrix to A*x^2 + B*x*y + C*y^2 - 1 = 0
                        // x1 = a*x + c*y
                        // y1 = b*x + d*y
                        //      (we can ignore e and f, since pure translations don"t affect the shape of the ellipse)
                        // --> A1*x1^2 + B1*x1*y1 + C1*y1^2 - det^2 = 0, where
                        var A1 = A * d * d - B * b * d + C * b * b;
                        var B1 = B * (a * d + b * c) - 2 * (A * c * d + C * a * b);
                        var C1 = A * c * c - B * a * c + C * a * a;
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
                        var newXRot = ((Math.atan2(B1, A1 - C1) + Math.PI) % Math.PI) / 2;
                        // For any integer n, (atan2(B1, A1 - C1) + n*pi)/2 is a solution to the above; incrementing n just swaps
                        // the x and y radii computed below (since that"s what rotating an ellipse by pi/2 does).  Choosing the
                        // rotation between 0 and pi/2 eliminates the ambiguity and leads to more predictable output.
                        // Finally, we get newRX and newRY from the same-zeroes relationship that gave us newXRot
                        var newSinRot = Math.sin(newXRot);
                        var newCosRot = Math.cos(newXRot);
                        command.rX = Math.abs(det) /
                            Math.sqrt(A1 * sqr(newCosRot) + B1 * newSinRot * newCosRot + C1 * sqr(newSinRot));
                        command.rY = Math.abs(det) /
                            Math.sqrt(A1 * sqr(newSinRot) - B1 * newSinRot * newCosRot + C1 * sqr(newCosRot));
                        command.xRot = newXRot * 180 / Math.PI;
                    }
                }
            }
            // sweepFlag needs to be inverted when mirroring shapes
            // see http://www.itk.ilstu.edu/faculty/javila/SVG/SVG_drawing1/elliptical_curve.htm
            // m 65,10 a 50,25 0 1 0 50,25
            // M 65,60 A 50,25 0 1 1 115,35
            if ("undefined" !== typeof command.sweepFlag && 0 > det) {
                command.sweepFlag = +!command.sweepFlag;
            }
            return command;
        });
    }
    SVGPathDataTransformer.MATRIX = MATRIX;
    function ROTATE(a, x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        mathUtils_js_1.assertNumbers(a, x, y);
        var sin = Math.sin(a);
        var cos = Math.cos(a);
        return MATRIX(cos, sin, -sin, cos, x - x * cos + y * sin, y - x * sin - y * cos);
    }
    SVGPathDataTransformer.ROTATE = ROTATE;
    function TRANSLATE(dX, dY) {
        if (dY === void 0) { dY = 0; }
        mathUtils_js_1.assertNumbers(dX, dY);
        return MATRIX(1, 0, 0, 1, dX, dY);
    }
    SVGPathDataTransformer.TRANSLATE = TRANSLATE;
    function SCALE(dX, dY) {
        if (dY === void 0) { dY = dX; }
        mathUtils_js_1.assertNumbers(dX, dY);
        return MATRIX(dX, 0, 0, dY, 0, 0);
    }
    SVGPathDataTransformer.SCALE = SCALE;
    function SKEW_X(a) {
        mathUtils_js_1.assertNumbers(a);
        return MATRIX(1, 0, Math.atan(a), 1, 0, 0);
    }
    SVGPathDataTransformer.SKEW_X = SKEW_X;
    function SKEW_Y(a) {
        mathUtils_js_1.assertNumbers(a);
        return MATRIX(1, Math.atan(a), 0, 1, 0, 0);
    }
    SVGPathDataTransformer.SKEW_Y = SKEW_Y;
    function X_AXIS_SYMMETRY(xOffset) {
        if (xOffset === void 0) { xOffset = 0; }
        mathUtils_js_1.assertNumbers(xOffset);
        return MATRIX(-1, 0, 0, 1, xOffset, 0);
    }
    SVGPathDataTransformer.X_AXIS_SYMMETRY = X_AXIS_SYMMETRY;
    function Y_AXIS_SYMMETRY(yOffset) {
        if (yOffset === void 0) { yOffset = 0; }
        mathUtils_js_1.assertNumbers(yOffset);
        return MATRIX(1, 0, 0, -1, 0, yOffset);
    }
    SVGPathDataTransformer.Y_AXIS_SYMMETRY = Y_AXIS_SYMMETRY;
    // Convert arc commands to curve commands
    function A_TO_C() {
        return INFO(function (command, prevX, prevY) {
            if (SVGPathData_1.SVGPathData.ARC === command.type) {
                return mathUtils_js_1.a2c(command, command.relative ? 0 : prevX, command.relative ? 0 : prevY);
            }
            return command;
        });
    }
    SVGPathDataTransformer.A_TO_C = A_TO_C;
    // @see annotateArcCommand
    function ANNOTATE_ARCS() {
        return INFO(function (c, x1, y1) {
            if (c.relative) {
                x1 = 0;
                y1 = 0;
            }
            if (SVGPathData_1.SVGPathData.ARC === c.type) {
                mathUtils_js_1.annotateArcCommand(c, x1, y1);
            }
            return c;
        });
    }
    SVGPathDataTransformer.ANNOTATE_ARCS = ANNOTATE_ARCS;
    function CLONE() {
        return function (c) {
            var result = {};
            // tslint:disable-next-line
            for (var key in c) {
                result[key] = c[key];
            }
            return result;
        };
    }
    SVGPathDataTransformer.CLONE = CLONE;
    // @see annotateArcCommand
    function CALCULATE_BOUNDS() {
        var clone = CLONE();
        var toAbs = TO_ABS();
        var qtToC = QT_TO_C();
        var normST = NORMALIZE_ST();
        var f = INFO(function (command, prevXAbs, prevYAbs) {
            var c = normST(qtToC(toAbs(clone(command))));
            function fixX(absX) {
                if (absX > f.maxX) {
                    f.maxX = absX;
                }
                if (absX < f.minX) {
                    f.minX = absX;
                }
            }
            function fixY(absY) {
                if (absY > f.maxY) {
                    f.maxY = absY;
                }
                if (absY < f.minY) {
                    f.minY = absY;
                }
            }
            if (c.type & SVGPathData_1.SVGPathData.DRAWING_COMMANDS) {
                fixX(prevXAbs);
                fixY(prevYAbs);
            }
            if (c.type & SVGPathData_1.SVGPathData.HORIZ_LINE_TO) {
                fixX(c.x);
            }
            if (c.type & SVGPathData_1.SVGPathData.VERT_LINE_TO) {
                fixY(c.y);
            }
            if (c.type & SVGPathData_1.SVGPathData.LINE_TO) {
                fixX(c.x);
                fixY(c.y);
            }
            if (c.type & SVGPathData_1.SVGPathData.CURVE_TO) {
                // add start and end points
                fixX(c.x);
                fixY(c.y);
                var xDerivRoots = mathUtils_js_1.bezierRoot(prevXAbs, c.x1, c.x2, c.x);
                for (var _i = 0, xDerivRoots_1 = xDerivRoots; _i < xDerivRoots_1.length; _i++) {
                    var derivRoot = xDerivRoots_1[_i];
                    if (0 < derivRoot && 1 > derivRoot) {
                        fixX(mathUtils_js_1.bezierAt(prevXAbs, c.x1, c.x2, c.x, derivRoot));
                    }
                }
                var yDerivRoots = mathUtils_js_1.bezierRoot(prevYAbs, c.y1, c.y2, c.y);
                for (var _a = 0, yDerivRoots_1 = yDerivRoots; _a < yDerivRoots_1.length; _a++) {
                    var derivRoot = yDerivRoots_1[_a];
                    if (0 < derivRoot && 1 > derivRoot) {
                        fixY(mathUtils_js_1.bezierAt(prevYAbs, c.y1, c.y2, c.y, derivRoot));
                    }
                }
            }
            if (c.type & SVGPathData_1.SVGPathData.ARC) {
                // add start and end points
                fixX(c.x);
                fixY(c.y);
                mathUtils_js_1.annotateArcCommand(c, prevXAbs, prevYAbs);
                // p = cos(phi) * xv + sin(phi) * yv
                // dp = -sin(phi) * xv + cos(phi) * yv = 0
                var xRotRad = c.xRot / 180 * Math.PI;
                // points on ellipse for phi = 0° and phi = 90°
                var x0 = Math.cos(xRotRad) * c.rX;
                var y0 = Math.sin(xRotRad) * c.rX;
                var x90 = -Math.sin(xRotRad) * c.rY;
                var y90 = Math.cos(xRotRad) * c.rY;
                // annotateArcCommand returns phi1 and phi2 such that -180° < phi1 < 180° and phi2 is smaller or greater
                // depending on the sweep flag. Calculate phiMin, phiMax such that -180° < phiMin < 180° and phiMin < phiMax
                var _b = c.phi1 < c.phi2 ?
                    [c.phi1, c.phi2] :
                    (-180 > c.phi2 ? [c.phi2 + 360, c.phi1 + 360] : [c.phi2, c.phi1]), phiMin_1 = _b[0], phiMax = _b[1];
                var normalizeXiEta = function (_a) {
                    var xi = _a[0], eta = _a[1];
                    var phiRad = Math.atan2(eta, xi);
                    var phi = phiRad * 180 / Math.PI;
                    return phi < phiMin_1 ? phi + 360 : phi;
                };
                // xi = cos(phi), eta = sin(phi)
                var xDerivRoots = mathUtils_js_1.intersectionUnitCircleLine(x90, -x0, 0).map(normalizeXiEta);
                for (var _c = 0, xDerivRoots_2 = xDerivRoots; _c < xDerivRoots_2.length; _c++) {
                    var derivRoot = xDerivRoots_2[_c];
                    if (derivRoot > phiMin_1 && derivRoot < phiMax) {
                        fixX(mathUtils_js_1.arcAt(c.cX, x0, x90, derivRoot));
                    }
                }
                var yDerivRoots = mathUtils_js_1.intersectionUnitCircleLine(y90, -y0, 0).map(normalizeXiEta);
                for (var _d = 0, yDerivRoots_2 = yDerivRoots; _d < yDerivRoots_2.length; _d++) {
                    var derivRoot = yDerivRoots_2[_d];
                    if (derivRoot > phiMin_1 && derivRoot < phiMax) {
                        fixY(mathUtils_js_1.arcAt(c.cY, y0, y90, derivRoot));
                    }
                }
            }
            return command;
        });
        f.minX = Infinity;
        f.maxX = -Infinity;
        f.minY = Infinity;
        f.maxY = -Infinity;
        return f;
    }
    SVGPathDataTransformer.CALCULATE_BOUNDS = CALCULATE_BOUNDS;
})(SVGPathDataTransformer = exports.SVGPathDataTransformer || (exports.SVGPathDataTransformer = {}));

},{"./SVGPathData":1,"./mathUtils.js":6}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SVGPathDataTransformer_1 = require("./SVGPathDataTransformer");
var TransformableSVG = /** @class */ (function () {
    function TransformableSVG() {
    }
    TransformableSVG.prototype.round = function (x) {
        return this.transform(SVGPathDataTransformer_1.SVGPathDataTransformer.ROUND(x));
    };
    TransformableSVG.prototype.toAbs = function () {
        return this.transform(SVGPathDataTransformer_1.SVGPathDataTransformer.TO_ABS());
    };
    TransformableSVG.prototype.toRel = function () {
        return this.transform(SVGPathDataTransformer_1.SVGPathDataTransformer.TO_REL());
    };
    TransformableSVG.prototype.normalizeHVZ = function (a, b, c) {
        return this.transform(SVGPathDataTransformer_1.SVGPathDataTransformer.NORMALIZE_HVZ(a, b, c));
    };
    TransformableSVG.prototype.normalizeST = function () {
        return this.transform(SVGPathDataTransformer_1.SVGPathDataTransformer.NORMALIZE_ST());
    };
    TransformableSVG.prototype.qtToC = function () {
        return this.transform(SVGPathDataTransformer_1.SVGPathDataTransformer.QT_TO_C());
    };
    TransformableSVG.prototype.aToC = function () {
        return this.transform(SVGPathDataTransformer_1.SVGPathDataTransformer.A_TO_C());
    };
    TransformableSVG.prototype.sanitize = function (eps) {
        return this.transform(SVGPathDataTransformer_1.SVGPathDataTransformer.SANITIZE(eps));
    };
    TransformableSVG.prototype.translate = function (x, y) {
        return this.transform(SVGPathDataTransformer_1.SVGPathDataTransformer.TRANSLATE(x, y));
    };
    TransformableSVG.prototype.scale = function (x, y) {
        return this.transform(SVGPathDataTransformer_1.SVGPathDataTransformer.SCALE(x, y));
    };
    TransformableSVG.prototype.rotate = function (a, x, y) {
        return this.transform(SVGPathDataTransformer_1.SVGPathDataTransformer.ROTATE(a, x, y));
    };
    TransformableSVG.prototype.matrix = function (a, b, c, d, e, f) {
        return this.transform(SVGPathDataTransformer_1.SVGPathDataTransformer.MATRIX(a, b, c, d, e, f));
    };
    TransformableSVG.prototype.skewX = function (a) {
        return this.transform(SVGPathDataTransformer_1.SVGPathDataTransformer.SKEW_X(a));
    };
    TransformableSVG.prototype.skewY = function (a) {
        return this.transform(SVGPathDataTransformer_1.SVGPathDataTransformer.SKEW_Y(a));
    };
    TransformableSVG.prototype.xSymmetry = function (xOffset) {
        return this.transform(SVGPathDataTransformer_1.SVGPathDataTransformer.X_AXIS_SYMMETRY(xOffset));
    };
    TransformableSVG.prototype.ySymmetry = function (yOffset) {
        return this.transform(SVGPathDataTransformer_1.SVGPathDataTransformer.Y_AXIS_SYMMETRY(yOffset));
    };
    TransformableSVG.prototype.annotateArcs = function () {
        return this.transform(SVGPathDataTransformer_1.SVGPathDataTransformer.ANNOTATE_ARCS());
    };
    return TransformableSVG;
}());
exports.TransformableSVG = TransformableSVG;

},{"./SVGPathDataTransformer":4}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SVGPathData_1 = require("./SVGPathData");
function rotate(_a, rad) {
    var x = _a[0], y = _a[1];
    return [
        x * Math.cos(rad) - y * Math.sin(rad),
        x * Math.sin(rad) + y * Math.cos(rad),
    ];
}
exports.rotate = rotate;
var DEBUG_CHECK_NUMBERS = true;
function assertNumbers() {
    var numbers = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        numbers[_i] = arguments[_i];
    }
    if (DEBUG_CHECK_NUMBERS) {
        for (var i = 0; i < numbers.length; i++) {
            if ("number" !== typeof numbers[i]) {
                throw new Error("assertNumbers arguments[" + i + "] is not a number. " + typeof numbers[i] + " == typeof " + numbers[i]);
            }
        }
    }
    return true;
}
exports.assertNumbers = assertNumbers;
var PI = Math.PI;
/**
 * https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
 * Fixes rX and rY.
 * Ensures lArcFlag and sweepFlag are 0 or 1
 * Adds center coordinates: command.cX, command.cY (relative or absolute, depending on command.relative)
 * Adds start and end arc parameters (in degrees): command.phi1, command.phi2; phi1 < phi2 iff. c.sweepFlag == true
 */
function annotateArcCommand(c, x1, y1) {
    c.lArcFlag = (0 === c.lArcFlag) ? 0 : 1;
    c.sweepFlag = (0 === c.sweepFlag) ? 0 : 1;
    // tslint:disable-next-line
    var rX = c.rX, rY = c.rY, x = c.x, y = c.y;
    rX = Math.abs(c.rX);
    rY = Math.abs(c.rY);
    var _a = rotate([(x1 - x) / 2, (y1 - y) / 2], -c.xRot / 180 * PI), x1_ = _a[0], y1_ = _a[1];
    var testValue = Math.pow(x1_, 2) / Math.pow(rX, 2) + Math.pow(y1_, 2) / Math.pow(rY, 2);
    if (1 < testValue) {
        rX *= Math.sqrt(testValue);
        rY *= Math.sqrt(testValue);
    }
    c.rX = rX;
    c.rY = rY;
    var c_ScaleTemp = (Math.pow(rX, 2) * Math.pow(y1_, 2) + Math.pow(rY, 2) * Math.pow(x1_, 2));
    var c_Scale = (c.lArcFlag !== c.sweepFlag ? 1 : -1) *
        Math.sqrt(Math.max(0, (Math.pow(rX, 2) * Math.pow(rY, 2) - c_ScaleTemp) / c_ScaleTemp));
    var cx_ = rX * y1_ / rY * c_Scale;
    var cy_ = -rY * x1_ / rX * c_Scale;
    var cRot = rotate([cx_, cy_], c.xRot / 180 * PI);
    c.cX = cRot[0] + (x1 + x) / 2;
    c.cY = cRot[1] + (y1 + y) / 2;
    c.phi1 = Math.atan2((y1_ - cy_) / rY, (x1_ - cx_) / rX);
    c.phi2 = Math.atan2((-y1_ - cy_) / rY, (-x1_ - cx_) / rX);
    if (0 === c.sweepFlag && c.phi2 > c.phi1) {
        c.phi2 -= 2 * PI;
    }
    if (1 === c.sweepFlag && c.phi2 < c.phi1) {
        c.phi2 += 2 * PI;
    }
    c.phi1 *= 180 / PI;
    c.phi2 *= 180 / PI;
}
exports.annotateArcCommand = annotateArcCommand;
/**
 * Solves a quadratic system of equations of the form
 *      a * x + b * y = c
 *      x² + y² = 1
 * This can be understood as the intersection of the unit circle with a line.
 *      => y = (c - a x) / b
 *      => x² + (c - a x)² / b² = 1
 *      => x² b² + c² - 2 c a x + a² x² = b²
 *      => (a² + b²) x² - 2 a c x + (c² - b²) = 0
 */
function intersectionUnitCircleLine(a, b, c) {
    assertNumbers(a, b, c);
    // cf. pqFormula
    var termSqr = a * a + b * b - c * c;
    if (0 > termSqr) {
        return [];
    }
    else if (0 === termSqr) {
        return [
            [
                (a * c) / (a * a + b * b),
                (b * c) / (a * a + b * b)
            ]
        ];
    }
    var term = Math.sqrt(termSqr);
    return [
        [
            (a * c + b * term) / (a * a + b * b),
            (b * c - a * term) / (a * a + b * b)
        ],
        [
            (a * c - b * term) / (a * a + b * b),
            (b * c + a * term) / (a * a + b * b)
        ]
    ];
}
exports.intersectionUnitCircleLine = intersectionUnitCircleLine;
exports.DEG = Math.PI / 180;
function lerp(a, b, t) {
    return (1 - t) * a + t * b;
}
exports.lerp = lerp;
function arcAt(c, x1, x2, phiDeg) {
    return c + Math.cos(phiDeg / 180 * PI) * x1 + Math.sin(phiDeg / 180 * PI) * x2;
}
exports.arcAt = arcAt;
function bezierRoot(x0, x1, x2, x3) {
    var EPS = 1e-6;
    var x01 = x1 - x0;
    var x12 = x2 - x1;
    var x23 = x3 - x2;
    var a = 3 * x01 + 3 * x23 - 6 * x12;
    var b = (x12 - x01) * 6;
    var c = 3 * x01;
    // solve a * t² + b * t + c = 0
    if (Math.abs(a) < EPS) {
        // equivalent to b * t + c =>
        return [-c / b];
    }
    return pqFormula(b / a, c / a, EPS);
}
exports.bezierRoot = bezierRoot;
function bezierAt(x0, x1, x2, x3, t) {
    // console.log(x0, y0, x1, y1, x2, y2, x3, y3, t)
    var s = 1 - t;
    var c0 = s * s * s;
    var c1 = 3 * s * s * t;
    var c2 = 3 * s * t * t;
    var c3 = t * t * t;
    return x0 * c0 + x1 * c1 + x2 * c2 + x3 * c3;
}
exports.bezierAt = bezierAt;
function pqFormula(p, q, PRECISION) {
    if (PRECISION === void 0) { PRECISION = 1e-6; }
    // 4 times the discriminant:in
    var discriminantX4 = p * p / 4 - q;
    if (discriminantX4 < -PRECISION) {
        return [];
    }
    else if (discriminantX4 <= PRECISION) {
        return [-p / 2];
    }
    var root = Math.sqrt(discriminantX4);
    return [-(p / 2) - root, -(p / 2) + root];
}
function a2c(arc, x0, y0) {
    var _a, _b, _c, _d;
    if (!arc.cX) {
        annotateArcCommand(arc, x0, y0);
    }
    var phiMin = Math.min(arc.phi1, arc.phi2), phiMax = Math.max(arc.phi1, arc.phi2), deltaPhi = phiMax - phiMin;
    var partCount = Math.ceil(deltaPhi / 90);
    var result = new Array(partCount);
    var prevX = x0, prevY = y0;
    for (var i = 0; i < partCount; i++) {
        var phiStart = lerp(arc.phi1, arc.phi2, i / partCount);
        var phiEnd = lerp(arc.phi1, arc.phi2, (i + 1) / partCount);
        var deltaPhi_1 = phiEnd - phiStart;
        var f = 4 / 3 * Math.tan(deltaPhi_1 * exports.DEG / 4);
        // x1/y1, x2/y2 and x/y coordinates on the unit circle for phiStart/phiEnd
        var _e = [
            Math.cos(phiStart * exports.DEG) - f * Math.sin(phiStart * exports.DEG),
            Math.sin(phiStart * exports.DEG) + f * Math.cos(phiStart * exports.DEG)
        ], x1 = _e[0], y1 = _e[1];
        var _f = [Math.cos(phiEnd * exports.DEG), Math.sin(phiEnd * exports.DEG)], x = _f[0], y = _f[1];
        var _g = [x + f * Math.sin(phiEnd * exports.DEG), y - f * Math.cos(phiEnd * exports.DEG)], x2 = _g[0], y2 = _g[1];
        result[i] = { relative: arc.relative, type: SVGPathData_1.SVGPathData.CURVE_TO };
        var transform = function (x, y) {
            var _a = rotate([x * arc.rX, y * arc.rY], arc.xRot), xTemp = _a[0], yTemp = _a[1];
            return [arc.cX + xTemp, arc.cY + yTemp];
        };
        _a = transform(x1, y1), result[i].x1 = _a[0], result[i].y1 = _a[1];
        _b = transform(x2, y2), result[i].x2 = _b[0], result[i].y2 = _b[1];
        _c = transform(x, y), result[i].x = _c[0], result[i].y = _c[1];
        if (arc.relative) {
            result[i].x1 -= prevX;
            result[i].y1 -= prevY;
            result[i].x2 -= prevX;
            result[i].y2 -= prevY;
            result[i].x -= prevX;
            result[i].y -= prevY;
        }
        _d = [result[i].x, result[i].y], prevX = _d[0], prevY = _d[1];
    }
    return result;
}
exports.a2c = a2c;

},{"./SVGPathData":1}]},{},[1])(1)
});
