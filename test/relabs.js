var assert = chai.assert;

describe("Converting relative commands to absolute", function() {

  it("should work with m commands", function() {
    var commands = new SVGPathData('m-100,100M10,10m10,10m-1,-1').toAbs().commands;
    assert.equal(commands[0].type, SVGPathData.MOVE_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, -100);
    assert.equal(commands[0].y, 100);
    assert.equal(commands[1].type, SVGPathData.MOVE_TO);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].x, 10);
    assert.equal(commands[1].y, 10);
    assert.equal(commands[2].type, SVGPathData.MOVE_TO);
    assert.equal(commands[2].relative, false);
    assert.equal(commands[2].x, 20);
    assert.equal(commands[2].y, 20);
    assert.equal(commands[3].type, SVGPathData.MOVE_TO);
    assert.equal(commands[3].relative, false);
    assert.equal(commands[3].x, 19);
    assert.equal(commands[3].y, 19);
  });

  it("should work with h commands", function() {
    var commands = new SVGPathData('h100H10h10h-5').toAbs().commands;
    assert.equal(commands[0].type, SVGPathData.HORIZ_LINE_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, 100);
    assert.equal(commands[1].type, SVGPathData.HORIZ_LINE_TO);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].x, 10);
    assert.equal(commands[2].type, SVGPathData.HORIZ_LINE_TO);
    assert.equal(commands[2].relative, false);
    assert.equal(commands[2].x, 20);
    assert.equal(commands[3].type, SVGPathData.HORIZ_LINE_TO);
    assert.equal(commands[3].relative, false);
    assert.equal(commands[3].x, 15);
  });

  it("should work with v commands", function() {
    var commands = new SVGPathData('v100V10v5v5').toAbs().commands;
    assert.equal(commands[0].type, SVGPathData.VERT_LINE_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].y, 100);
    assert.equal(commands[1].type, SVGPathData.VERT_LINE_TO);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].y, 10);
    assert.equal(commands[2].type, SVGPathData.VERT_LINE_TO);
    assert.equal(commands[2].relative, false);
    assert.equal(commands[2].y, 15);
    assert.equal(commands[3].type, SVGPathData.VERT_LINE_TO);
    assert.equal(commands[3].relative, false);
    assert.equal(commands[3].y, 20);
  });

  it("should work with l commands", function() {
    var commands = new SVGPathData('l100,-100L1,0l2,2l-1,-1').toAbs().commands;
    assert.equal(commands[0].type, SVGPathData.LINE_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, 100);
    assert.equal(commands[0].y, -100);
    assert.equal(commands[1].type, SVGPathData.LINE_TO);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].x, 1);
    assert.equal(commands[1].y, 0);
    assert.equal(commands[2].type, SVGPathData.LINE_TO);
    assert.equal(commands[2].relative, false);
    assert.equal(commands[2].x, 3);
    assert.equal(commands[2].y, 2);
    assert.equal(commands[3].type, SVGPathData.LINE_TO);
    assert.equal(commands[3].relative, false);
    assert.equal(commands[3].x, 2);
    assert.equal(commands[3].y, 1);
  });

  it("should work with c commands", function() {
    var commands = new SVGPathData('c100,100 100,100 100,100\
      c100,100 100,100 100,100\
      c100,100 100,100 100,100\
      c100,100 100,100 100,100').toAbs().commands;
    assert.equal(commands[0].type, SVGPathData.CURVE_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, 100);
    assert.equal(commands[0].y, 100);
    assert.equal(commands[0].x1, 100);
    assert.equal(commands[0].y1, 100);
    assert.equal(commands[0].x2, 100);
    assert.equal(commands[0].y2, 100);
    assert.equal(commands[1].type, SVGPathData.CURVE_TO);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].x, 200);
    assert.equal(commands[1].y, 200);
    assert.equal(commands[1].x1, 200);
    assert.equal(commands[1].y1, 200);
    assert.equal(commands[1].x2, 200);
    assert.equal(commands[1].y2, 200);
    assert.equal(commands[2].type, SVGPathData.CURVE_TO);
    assert.equal(commands[2].relative, false);
    assert.equal(commands[2].x, 300);
    assert.equal(commands[2].y, 300);
    assert.equal(commands[2].x1, 300);
    assert.equal(commands[2].y1, 300);
    assert.equal(commands[2].x2, 300);
    assert.equal(commands[2].y2, 300);
    assert.equal(commands[3].type, SVGPathData.CURVE_TO);
    assert.equal(commands[3].relative, false);
    assert.equal(commands[3].x, 400);
    assert.equal(commands[3].y, 400);
    assert.equal(commands[3].x1, 400);
    assert.equal(commands[3].y1, 400);
    assert.equal(commands[3].x2, 400);
    assert.equal(commands[3].y2, 400);
  });

  it("should work with c commands", function() {
    var commands = new SVGPathData('s100,100 100,100\
      s100,100 100,100s100,100 100,100s100,100 100,100').toAbs().commands;
    assert.equal(commands[0].type, SVGPathData.SMOOTH_CURVE_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, 100);
    assert.equal(commands[0].y, 100);
    assert.equal(commands[0].x2, 100);
    assert.equal(commands[0].y2, 100);
    assert.equal(commands[1].type, SVGPathData.SMOOTH_CURVE_TO);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].x, 200);
    assert.equal(commands[1].y, 200);
    assert.equal(commands[1].x2, 200);
    assert.equal(commands[1].y2, 200);
    assert.equal(commands[2].type, SVGPathData.SMOOTH_CURVE_TO);
    assert.equal(commands[2].relative, false);
    assert.equal(commands[2].x, 300);
    assert.equal(commands[2].y, 300);
    assert.equal(commands[2].x2, 300);
    assert.equal(commands[2].y2, 300);
    assert.equal(commands[3].type, SVGPathData.SMOOTH_CURVE_TO);
    assert.equal(commands[3].relative, false);
    assert.equal(commands[3].x, 400);
    assert.equal(commands[3].y, 400);
    assert.equal(commands[3].x2, 400);
    assert.equal(commands[3].y2, 400);
  });

  it("should work with q commands", function() {
    var commands = new SVGPathData('q-100,100 -100,100q-100,100 -100,100\
      q-100,100 -100,100q-100,100 -100,100').toAbs().commands;
    assert.equal(commands[0].type, SVGPathData.QUAD_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, -100);
    assert.equal(commands[0].y, 100);
    assert.equal(commands[0].x1, -100);
    assert.equal(commands[0].y1, 100);
    assert.equal(commands[1].type, SVGPathData.QUAD_TO);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].x, -200);
    assert.equal(commands[1].y, 200);
    assert.equal(commands[1].x1, -200);
    assert.equal(commands[1].y1, 200);
    assert.equal(commands[2].type, SVGPathData.QUAD_TO);
    assert.equal(commands[2].relative, false);
    assert.equal(commands[2].x, -300);
    assert.equal(commands[2].y, 300);
    assert.equal(commands[2].x1, -300);
    assert.equal(commands[2].y1, 300);
    assert.equal(commands[3].type, SVGPathData.QUAD_TO);
    assert.equal(commands[3].relative, false);
    assert.equal(commands[3].x, -400);
    assert.equal(commands[3].y, 400);
    assert.equal(commands[3].x1, -400);
    assert.equal(commands[3].y1, 400);
  });

  it("should work with t commands", function() {
    var commands = new SVGPathData('t-100,100t-100,100t10,10t10,10').toAbs().commands;
    assert.equal(commands[0].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].x, -100);
    assert.equal(commands[0].y, 100);
    assert.equal(commands[1].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].x, -200);
    assert.equal(commands[1].y, 200);
    assert.equal(commands[2].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[2].relative, false);
    assert.equal(commands[2].x, -190);
    assert.equal(commands[2].y, 210);
    assert.equal(commands[3].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[3].relative, false);
    assert.equal(commands[3].x, -180);
    assert.equal(commands[3].y, 220);
  });

  it("should work with a commands", function() {
    var commands = new SVGPathData('a20,20 180 1 0 -100,100\
      a20,20 180 1 0 -100,100a20,20 180 1 0 -100,100\
      a20,20 180 1 0 -100,100').toAbs().commands;
    assert.equal(commands[0].type, SVGPathData.ARC);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].rX, 20);
    assert.equal(commands[0].rY, 20);
    assert.equal(commands[0].xRot, 180);
    assert.equal(commands[0].lArcFlag, 1);
    assert.equal(commands[0].sweepFlag, 0);
    assert.equal(commands[0].x, -100);
    assert.equal(commands[0].y, 100);
    assert.equal(commands[1].type, SVGPathData.ARC);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].rX, 20);
    assert.equal(commands[1].rY, 20);
    assert.equal(commands[1].xRot, 180);
    assert.equal(commands[1].lArcFlag, 1);
    assert.equal(commands[1].sweepFlag, 0);
    assert.equal(commands[1].x, -200);
    assert.equal(commands[1].y, 200);
    assert.equal(commands[2].type, SVGPathData.ARC);
    assert.equal(commands[2].relative, false);
    assert.equal(commands[2].rX, 20);
    assert.equal(commands[2].rY, 20);
    assert.equal(commands[2].xRot, 180);
    assert.equal(commands[2].lArcFlag, 1);
    assert.equal(commands[2].sweepFlag, 0);
    assert.equal(commands[2].x, -300);
    assert.equal(commands[2].y, 300);
    assert.equal(commands[3].type, SVGPathData.ARC);
    assert.equal(commands[3].relative, false);
    assert.equal(commands[3].rX, 20);
    assert.equal(commands[3].rY, 20);
    assert.equal(commands[3].xRot, 180);
    assert.equal(commands[3].lArcFlag, 1);
    assert.equal(commands[3].sweepFlag, 0);
    assert.equal(commands[3].x, -400);
    assert.equal(commands[3].y, 400);
  });

  it("should work with nested commands", function() {
    var commands = new SVGPathData('a20,20 180 1 0 -100,100h10v10l10,10\
      c10,10 20,20 100,100').toAbs().commands;
    assert.equal(commands[0].type, SVGPathData.ARC);
    assert.equal(commands[0].relative, false);
    assert.equal(commands[0].rX, 20);
    assert.equal(commands[0].rY, 20);
    assert.equal(commands[0].xRot, 180);
    assert.equal(commands[0].lArcFlag, 1);
    assert.equal(commands[0].sweepFlag, 0);
    assert.equal(commands[0].x, -100);
    assert.equal(commands[0].y, 100);
    assert.equal(commands[1].type, SVGPathData.HORIZ_LINE_TO);
    assert.equal(commands[1].relative, false);
    assert.equal(commands[1].x, -90);
    assert.equal(commands[2].type, SVGPathData.VERT_LINE_TO);
    assert.equal(commands[2].relative, false);
    assert.equal(commands[2].y, 110);
    assert.equal(commands[3].type, SVGPathData.LINE_TO);
    assert.equal(commands[3].relative, false);
    assert.equal(commands[3].x, -80);
    assert.equal(commands[3].y, 120);
    assert.equal(commands[4].type, SVGPathData.CURVE_TO);
    assert.equal(commands[4].relative, false);
    assert.equal(commands[4].x, 20);
    assert.equal(commands[4].y, 220);
    assert.equal(commands[4].x1, -60);
    assert.equal(commands[4].y1, 140);
    assert.equal(commands[4].x2, -70);
    assert.equal(commands[4].y2, 130);
  });

});
