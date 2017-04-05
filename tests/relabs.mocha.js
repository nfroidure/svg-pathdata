/* eslint max-len:0 */
'use strict';

const assert = require('chai').assert;
const SVGPathData = require('../src/SVGPathData.js');

describe('Converting absolute commands to relative ones', () => {

  it('should work with M commands', () => {
    assert.equal(new SVGPathData('M100,100 M110,90 M120,80 M130,70').toRel().encode(),
      new SVGPathData('m100,100 m10,-10 m10,-10 m10,-10').encode());
  });

  it('should work with m commands', () => {
    assert.equal(
      new SVGPathData('M-100,100m90,-90M20,20M19,19').toRel().encode(),
      new SVGPathData('m-100,100 m90,-90 m30,10 m-1,-1').encode());
  });
  it('should work with m commands', () => {
    assert.equal(new SVGPathData('m-100,100 M10,10 m10,10 m-1,-1').toAbs().encode(),
      new SVGPathData('M-100,100 M10,10 M20,20 M19,19').encode());
  });

  it('should work with h commands', () => {
    assert.equal(new SVGPathData('M0 0 h100 H10 h10 h-5').toAbs().encode(),
      new SVGPathData('M0 0 H100 H10 H20 H15').encode());
  });

  it('should work with v commands', () => {
    assert.equal(new SVGPathData('M0 0 v100 V10 v5 v5').toAbs().encode(),
      new SVGPathData('M0 0 V100 V10 V15 V20').encode());
  });

  it('should work with l commands', () => {
    assert.equal(new SVGPathData('M0 0 l100,-100 L1,0 l2,2 l-1,-1').toAbs().encode(),
      new SVGPathData('M0 0 L100,-100 L1,0 L3,2 L2,1').encode());
  });

  it('should work with c commands', () => {
    assert.equal(new SVGPathData(`M0 0
      c100,100 100,100 100,100
      c100,100 100,100 100,100
      c100,100 100,100 100,100
      c100,100 100,100 100,100`).toAbs().encode(),
      new SVGPathData(`M 0 0 
      C100,100 100,100 100,100
      C200,200 200,200 200,200
      C300,300 300,300 300,300
      C400,400 400,400 400,400`).encode());
  });

  it('should work with s commands', () => {
    assert.equal(new SVGPathData(`M0 0
      s100,100 100,100
      s100,100 100,100
      s100,100 100,100
      s100,100 100,100`).toAbs().encode(),
      new SVGPathData(`M 0 0 
      S100,100 100,100
      S200,200 200,200
      S300,300 300,300
      S400,400 400,400`).encode());
  });

  it('should work with q commands', () => {
    assert.equal(new SVGPathData(`M0 0
      q-100,100 -100,100
      q-100,100 -100,100
      q-100,100 -100,100
      q-100,100 -100,100`).toAbs().encode(),
      new SVGPathData(`M0 0
      Q-100,100 -100,100
      Q-200,200 -200,200
      Q-300,300 -300,300
      Q-400,400 -400,400`).encode());
  });

  it('should work with t commands', () => {
    assert.equal(new SVGPathData('M0 0 t-100,100 t-100,100 t10,10 t10,10').toAbs().encode(),
      new SVGPathData('M0 0 T-100,100 T-200,200 T-190,210 -180,220').encode());
  });

  it('should work with a commands', () => {
    assert.equal(new SVGPathData(`M0 0
      a20,20 180 1 0 -100,100
      a20,20 180 1 0 -100,100
      a20,20 180 1 0 -100,100
      a20,20 180 1 0 -100,100`).toAbs().encode(),
      new SVGPathData(`M0 0
      A20,20 180 1 0 -100,100
      A20,20 180 1 0 -200,200
      A20,20 180 1 0 -300,300
      A20,20 180 1 0 -400,400`).encode());
  });

  it('should work with nested commands', () => {
    assert.equal(new SVGPathData(`M0 0
      a20,20 180 1 0 -100,100
      h10
      v10
      l10,10
      c10,10 20,20 100,100`).toAbs().encode(),
      new SVGPathData(`M0 0
      A20,20 180 1 0 -100,100
      H-90
      V110
      L-80,120
      C-70,130 -60,140 20,220`).encode());
  });

  it('should work with H commands', () => {
    assert.equal(
      new SVGPathData('H100 H10  H20 H15').toRel().encode(),
      new SVGPathData('h100 h-90 h10 h-5').encode());
  });

  it('should work with V commands', () => {
    assert.equal(
      new SVGPathData('V100 V10  V15V20').toRel().encode(),
      new SVGPathData('v100 v-90 v5 v5').encode());
  });

  it('should work with L commands', () => {
    assert.equal(
      new SVGPathData('L100,-100 L1,0     L3,2 L2,1').toRel().encode(),
      new SVGPathData('l100,-100 l-99,100 l2,2 l-1,-1').encode());
  });

  it('should work with C commands', () => {
    const commands = new SVGPathData(`C100,100 100,100 100,100
      C200,200 200,200 200,200
      C300,300 300,300 300,300
      C400,400 400,400 400,400`).toRel().commands;

    assert.equal(commands[0].type, SVGPathData.CURVE_TO);
    assert.equal(commands[0].relative, true);
    assert.equal(commands[0].x, 100);
    assert.equal(commands[0].y, 100);
    assert.equal(commands[0].x1, 100);
    assert.equal(commands[0].y1, 100);
    assert.equal(commands[0].x2, 100);
    assert.equal(commands[0].y2, 100);
    assert.equal(commands[1].type, SVGPathData.CURVE_TO);
    assert.equal(commands[1].relative, true);
    assert.equal(commands[1].x, 100);
    assert.equal(commands[1].y, 100);
    assert.equal(commands[1].x1, 100);
    assert.equal(commands[1].y1, 100);
    assert.equal(commands[1].x2, 100);
    assert.equal(commands[1].y2, 100);
    assert.equal(commands[2].type, SVGPathData.CURVE_TO);
    assert.equal(commands[2].relative, true);
    assert.equal(commands[2].x, 100);
    assert.equal(commands[2].y, 100);
    assert.equal(commands[2].x1, 100);
    assert.equal(commands[2].y1, 100);
    assert.equal(commands[2].x2, 100);
    assert.equal(commands[2].y2, 100);
    assert.equal(commands[3].type, SVGPathData.CURVE_TO);
    assert.equal(commands[3].relative, true);
    assert.equal(commands[3].x, 100);
    assert.equal(commands[3].y, 100);
    assert.equal(commands[3].x1, 100);
    assert.equal(commands[3].y1, 100);
    assert.equal(commands[3].x2, 100);
    assert.equal(commands[3].y2, 100);
  });

  it('should work with S commands', () => {
    const commands = new SVGPathData(`S100,100 100,100
      S200,200 200,200S300,300 300,300S400,400 400,400`).toRel().commands;

    assert.equal(commands[0].type, SVGPathData.SMOOTH_CURVE_TO);
    assert.equal(commands[0].relative, true);
    assert.equal(commands[0].x, 100);
    assert.equal(commands[0].y, 100);
    assert.equal(commands[0].x2, 100);
    assert.equal(commands[0].y2, 100);
    assert.equal(commands[1].type, SVGPathData.SMOOTH_CURVE_TO);
    assert.equal(commands[1].relative, true);
    assert.equal(commands[1].x, 100);
    assert.equal(commands[1].y, 100);
    assert.equal(commands[1].x2, 100);
    assert.equal(commands[1].y2, 100);
    assert.equal(commands[2].type, SVGPathData.SMOOTH_CURVE_TO);
    assert.equal(commands[2].relative, true);
    assert.equal(commands[2].x, 100);
    assert.equal(commands[2].y, 100);
    assert.equal(commands[2].x2, 100);
    assert.equal(commands[2].y2, 100);
    assert.equal(commands[3].type, SVGPathData.SMOOTH_CURVE_TO);
    assert.equal(commands[3].relative, true);
    assert.equal(commands[3].x, 100);
    assert.equal(commands[3].y, 100);
    assert.equal(commands[3].x2, 100);
    assert.equal(commands[3].y2, 100);
  });

  it('should work with Q commands', () => {
    const commands = new SVGPathData(`Q-100,100 -100,100Q-200,200 -200,200
      Q-300,300 -300,300Q-400,400 -400,400`).toRel().commands;

    assert.equal(commands[0].type, SVGPathData.QUAD_TO);
    assert.equal(commands[0].relative, true);
    assert.equal(commands[0].x, -100);
    assert.equal(commands[0].y, 100);
    assert.equal(commands[0].x1, -100);
    assert.equal(commands[0].y1, 100);
    assert.equal(commands[1].type, SVGPathData.QUAD_TO);
    assert.equal(commands[1].relative, true);
    assert.equal(commands[1].x, -100);
    assert.equal(commands[1].y, 100);
    assert.equal(commands[1].x1, -100);
    assert.equal(commands[1].y1, 100);
    assert.equal(commands[2].type, SVGPathData.QUAD_TO);
    assert.equal(commands[2].relative, true);
    assert.equal(commands[2].x, -100);
    assert.equal(commands[2].y, 100);
    assert.equal(commands[2].x1, -100);
    assert.equal(commands[2].y1, 100);
    assert.equal(commands[3].type, SVGPathData.QUAD_TO);
    assert.equal(commands[3].relative, true);
    assert.equal(commands[3].x, -100);
    assert.equal(commands[3].y, 100);
    assert.equal(commands[3].x1, -100);
    assert.equal(commands[3].y1, 100);
  });

  it('should work with T commands', () => {
    const commands = new SVGPathData('T-100,100T-200,200T-190,210T-180,220').toRel().commands;

    assert.equal(commands[0].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[0].relative, true);
    assert.equal(commands[0].x, -100);
    assert.equal(commands[0].y, 100);
    assert.equal(commands[1].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[1].relative, true);
    assert.equal(commands[1].x, -100);
    assert.equal(commands[1].y, 100);
    assert.equal(commands[2].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[2].relative, true);
    assert.equal(commands[2].x, 10);
    assert.equal(commands[2].y, 10);
    assert.equal(commands[3].type, SVGPathData.SMOOTH_QUAD_TO);
    assert.equal(commands[3].relative, true);
    assert.equal(commands[3].x, 10);
    assert.equal(commands[3].y, 10);
  });

  it('should work with A commands', () => {
    const commands = new SVGPathData(`A20,20 180 1 0 -100,100
      A20,20 180 1 0 -200,200A20,20 180 1 0 -300,300
      A20,20 180 1 0 -400,400`).toRel().commands;

    assert.equal(commands[0].type, SVGPathData.ARC);
    assert.equal(commands[0].relative, true);
    assert.equal(commands[0].rX, 20);
    assert.equal(commands[0].rY, 20);
    assert.equal(commands[0].xRot, 180);
    assert.equal(commands[0].lArcFlag, 1);
    assert.equal(commands[0].sweepFlag, 0);
    assert.equal(commands[0].x, -100);
    assert.equal(commands[0].y, 100);
    assert.equal(commands[1].type, SVGPathData.ARC);
    assert.equal(commands[1].relative, true);
    assert.equal(commands[1].rX, 20);
    assert.equal(commands[1].rY, 20);
    assert.equal(commands[1].xRot, 180);
    assert.equal(commands[1].lArcFlag, 1);
    assert.equal(commands[1].sweepFlag, 0);
    assert.equal(commands[1].x, -100);
    assert.equal(commands[1].y, 100);
    assert.equal(commands[2].type, SVGPathData.ARC);
    assert.equal(commands[2].relative, true);
    assert.equal(commands[2].rX, 20);
    assert.equal(commands[2].rY, 20);
    assert.equal(commands[2].xRot, 180);
    assert.equal(commands[2].lArcFlag, 1);
    assert.equal(commands[2].sweepFlag, 0);
    assert.equal(commands[2].x, -100);
    assert.equal(commands[2].y, 100);
    assert.equal(commands[3].type, SVGPathData.ARC);
    assert.equal(commands[3].relative, true);
    assert.equal(commands[3].rX, 20);
    assert.equal(commands[3].rY, 20);
    assert.equal(commands[3].xRot, 180);
    assert.equal(commands[3].lArcFlag, 1);
    assert.equal(commands[3].sweepFlag, 0);
    assert.equal(commands[3].x, -100);
    assert.equal(commands[3].y, 100);
  });

  it('should work with nested commands', () => {
    const commands = new SVGPathData(`A20,20 180 1 0 -100,100H-90V110L20,220
      C10,10 20,20 20,220`).toRel().commands;

    assert.equal(commands[0].type, SVGPathData.ARC);
    assert.equal(commands[0].relative, true);
    assert.equal(commands[0].rX, 20);
    assert.equal(commands[0].rY, 20);
    assert.equal(commands[0].xRot, 180);
    assert.equal(commands[0].lArcFlag, 1);
    assert.equal(commands[0].sweepFlag, 0);
    assert.equal(commands[0].x, -100);
    assert.equal(commands[0].y, 100);
    assert.equal(commands[1].type, SVGPathData.HORIZ_LINE_TO);
    assert.equal(commands[1].relative, true);
    assert.equal(commands[1].x, 10);
    assert.equal(commands[2].type, SVGPathData.VERT_LINE_TO);
    assert.equal(commands[2].relative, true);
    assert.equal(commands[2].y, 10);
    assert.equal(commands[3].type, SVGPathData.LINE_TO);
    assert.equal(commands[3].relative, true);
    assert.equal(commands[3].x, 110);
    assert.equal(commands[3].y, 110);
    assert.equal(commands[4].type, SVGPathData.CURVE_TO);
    assert.equal(commands[4].relative, true);
    assert.equal(commands[4].x, 0);
    assert.equal(commands[4].y, 0);
    assert.equal(commands[4].x2, 0);
    assert.equal(commands[4].y2, -200);
    assert.equal(commands[4].x1, -10);
    assert.equal(commands[4].y1, -210);
  });

});
