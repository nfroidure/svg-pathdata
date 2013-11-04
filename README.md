# SVGPathData [![Build Status](https://travis-ci.org/nfroidure/SVGPathDataParser.png?branch=master)](https://travis-ci.org/nfroidure/SVGPathDataParser)

Manipulating SVG PathData (path[d] attribute content) simply and efficiently.

## Reading PathDatas
```js
var pathData = new SVGPathData ('\
  M 10 10 \
  H 60 \
  V 60 \
  L 10 60 \
  Z \
');

console.log(pathData.commands);

// {"commands":[{
//    "type": SVGPathData.MOVE_TO,
//    "relative": false,
//    "x": 10, "y": 10
//  },{
//    "type": SVGPathData.HORIZ_LINE_TO,
//    "relative": false,
//    "x": 60
//  },{
//    "type": SVGPathData.VERT_LINE_TO,
//    "relative":false,
//    "y": 60
//  },{
//    "type": SVGPathData.LINE_TO,
//    "relative": false,
//    "x": 10,
//    "y": 60
//  },{
//    "type": SVGPathData.CLOSE_PATH
//  }
// ]}
```

## Reading streamed path data
```js
var parser = new SVGPathData.Parser(function(cmd) {
  console.log(cmd);
});

parser.read('   ');
parser.read('M 10');
parser.read(' 10');

// {
//   "type": SVGPathData.MOVE_TO,
//   "relative": false,
//   "x": 10, "y": 10
// }


parser.read('H 60');

// {
//   "type": SVGPathData.HORIZ_LINE_TO,
//   "relative": false,
//   "x": 60
// }


parser.read('V');
parser.read('60');

// {
//   "type": SVGPathData.VERT_LINE_TO,
//   "relative": false,
//   "y": 60
// }


parser.read('L 10 60 \
  Z');

// {
//   "type": SVGPathData.LINE_TO,
//   "relative": false,
//   "x": 10,
//   "y": 60
// }
  
// {
//   "type": SVGPathData.CLOSE_PATH
// }
```

## Outputting PathDatas (not implemented)

## Streaming PathDatas out (not implemented)

## Transforming PathDatas (not possible)

## Contributing
Clone this project, run :
```sh
npm install; grunt test&
```
