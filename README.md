# svg-pathdata

> Manipulate SVG path data (path[d] attribute content) simply and efficiently.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/nfroidure/svg-pathdata/blob/main/LICENSE)
[![npm](https://img.shields.io/npm/v/svg-pathdata.svg)](https://npmjs.com/package/svg-pathdata)
[![Node version](https://img.shields.io/node/v/svg-pathdata.svg)](https://nodejs.org)
[![Build status](https://img.shields.io/github/actions/workflow/status/nfroidure/svg-pathdata/test.yml)](https://github.com/nfroidure/svg-pathdata/actions)

## Usage

Install the module:

```sh
npm install --save svg-pathdata
```

Then in your JavaScript files:

```js
import {
  SVGPathData,
  SVGPathDataTransformer,
  SVGPathDataEncoder,
  SVGPathDataParser,
} from 'svg-pathdata';
```

## Reading PathData

```js
const pathData = new SVGPathData(`
  M 10 10
  H 60
  V 60
  L 10 60
  Z`);

console.log(pathData.commands);

// [  {type: SVGPathData.MOVE_TO,       relative: false,  x: 10,  y: 10},
//    {type: SVGPathData.HORIZ_LINE_TO, relative: false,  x: 60},
//    {type: SVGPathData.VERT_LINE_TO,  relative: false,          y: 60},
//    {type: SVGPathData.LINE_TO,       relative: false,  x: 10,  y: 60},
//    {type: SVGPathData.CLOSE_PATH}]
```

## Reading PathData in chunks

```js
const parser = new SVGPathDataParser();

parser.parse('   '); // returns []
parser.parse('M 10'); // returns []
parser.parse(' 10'); // returns [{type: SVGPathData.MOVE_TO, relative: false, x: 10, y: 10 }]

parser.write('H 60'); // returns [{type: SVGPathData.HORIZ_LINE_TO, relative: false, x: 60 }]

parser.write('V'); // returns []
parser.write('60'); // returns [{type: SVGPathData.VERT_LINE_TO, relative: false, y: 60 }]

parser.write('L 10 60 \n  Z');
// returns [
//   {type: SVGPathData.LINE_TO, relative: false, x: 10, y: 60 },
//   {type: SVGPathData.CLOSE_PATH }]

parser.finish(); // tell parser there is no more data: will throw if there are unfinished commands.
```

## Outputting PathData

```js
const pathData = new SVGPathData(`
  M 10 10
  H 60
  V 60
  L 10 60
  Z`);
// returns "M10 10H60V60L10 60Z"

encodeSVGPath({ type: SVGPathData.MOVE_TO, relative: false, x: 10, y: 10 });
// returns "M10 10"

encodeSVGPath({ type: SVGPathData.HORIZ_LINE_TO, relative: false, x: 60 });
// returns "H60"

encodeSVGPath([
  { type: SVGPathData.VERT_LINE_TO, relative: false, y: 60 },
  { type: SVGPathData.LINE_TO, relative: false, x: 10, y: 60 },
  { type: SVGPathData.CLOSE_PATH },
]);
// returns "V60L10 60Z"
```

## Transforming PathData

This library can perform transformations on SVG paths. Here is
[an example of that kind of use](https://github.com/nfroidure/svgicons2svgfont/blob/aa6df0211419e9d61c417c63bcc353f0cb2ea0c8/src/index.js#L192).

### Transforming entire paths

```js
new SVGPathData(`
   m 10,10
   h 60
   v 60
   l 10,60
   z`)
  .toAbs()
  .encode();
// return s"M10,10 H70 V70 L80,130 Z"
```

### Transforming partial data

Here, we take SVGPathData from stdin and output it transformed to stdout.

```js
const transformingParser = new SVGPathDataParser().toAbs().scale(2, 2);
transformingParser.parse('m 0 0'); // returns [{ type: SVGPathData.MOVE_TO,       relative: false, x: 0, y: 0 }]
transformingParser.parse('l 2 3'); // returns [{ type: SVGPathData.LINE_TO,       relative: false, x: 4, y: 6 }]
```

## Supported transformations

You can find all supported transformations in
[src/SVGPathDataTransformer.ts](https://github.com/nfroidure/SVGPathData/blob/master/src/SVGPathDataTransformer.ts#L47).
Additionally, you can create your own by writing a function with the following
signature:

```js
type TransformFunction = (command: SVGCommand) => SVGCommand | SVGCommand[];

function SET_X_TO(xValue = 10) {
  return function(command) {
    command.x = xValue; // transform command objects and return them
    return command;
  };
};

// Synchronous usage
new SVGPathData('...')
  .transform(SET_X_TO(25))
  .encode();

// Chunk usage
new SVGPathDataParser().transform(SET_X_TO(25));
```

## Contributing

Clone this project, run:

```sh
npm install; npm test
```

# Authors

- [Nicolas Froidure](https://insertafter.com/en/index.html)
- [Anders Kaseorg](mailto:andersk@mit.edu)

# License

[MIT](https://github.com/nfroidure/svg-pathdata/blob/main/LICENSE)
