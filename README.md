# SVGPathData [![Build Status](https://travis-ci.org/nfroidure/SVGPathData.png?branch=master)](https://travis-ci.org/nfroidure/SVGPathData)

Manipulating SVG PathDatas (path[d] attribute content) simply and efficiently.

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

## Reading streamed PathDatas
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

## Outputting PathDatas
```js
var pathData = new SVGPathData ('\
  M 10 10 \
  H 60 \
  V 60 \
  L 10 60 \
  Z \
');

console.log(pathData.encode());
// "M10 10H60V60L10 60Z"
```

## Streaming PathDatas out
```js
var encoder = new SVGPathData.Encoder(function(chunk) {
  console.log(chunk);
});

encoder.write({
   "type": SVGPathData.MOVE_TO,
   "relative": false,
   "x": 10, "y": 10
 });
// "M10 10"

encoder.write({
   "type": SVGPathData.HORIZ_LINE_TO,
   "relative": false,
   "x": 60
});
// "H60"

encoder.write({
   "type": SVGPathData.VERT_LINE_TO,
   "relative": false,
   "y": 60
});
// "V60"

encoder.write({
   "type": SVGPathData.LINE_TO,
   "relative": false,
   "x": 10,
   "y": 60
});
// "L10 60"
  
encoder.write({"type": SVGPathData.CLOSE_PATH});
// "Z"
```

## Transforming PathDatas
This library was made to live decoding/transform/encoding SVG PathDatas. Here is
 [an example of that kind of use](https://github.com/nfroidure/grunt-fontfactory/commit/f7b7046cf08bd56d03ab4822056aae5548de9333#diff-3281a466fce36eeb82c74e380ba1b145R156).

## Contributing
Clone this project, run :
```sh
npm install; grunt test&
```
