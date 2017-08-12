/* eslint-disable */
'use strict';

// Borrowed from https://github.com/PPvG/svg-path/blob/master/lib/Path.js#L208
// that were borrowed from https://github.com/DmitryBaranovskiy/raphael/blob/4d97d4ff5350bb949b88e6d78b877f76ea8b5e24/raphael.js#L2216-L2304
// (MIT licensed; http://raphaeljs.com/license.html).


const PI = Math.PI;

/**
 * https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
 * Fixes rX and rY.
 * Ensures lArcFlag and sweepFlag are 0 or 1
 * Adds center coordinates: command.cX, command.cY (relative or absolute, depending on command.relative)
 * Adds start and end arc parameters (in degrees): command.phi1, command.phi2; phi1 < phi2 iff. c.sweepFlag == true
 */
function annotateArcCommand(c, x1, y1) {
  function rotate([x, y], rad) {
    return [
      x * Math.cos(rad) - y * Math.sin(rad),
      x * Math.sin(rad) + y * Math.cos(rad),
    ];
  }
  c.lArcFlag = (c.lArcFlag == 0) ? 0 : 1
  c.sweepFlag = (c.sweepFlag == 0) ? 0 : 1
  //noinspection TsLint
  let {rX, rY, x, y} = c
  rX = Math.abs(c.rX)
  rY = Math.abs(c.rY)
  const [x1_, y1_] = rotate([(x1 - x) / 2, (y1 - y) / 2], -c.xRot / 180 * Math.PI)
  const testValue = Math.pow(x1_, 2) / Math.pow(rX, 2) + Math.pow(y1_, 2) / Math.pow(rY, 2)
  if (testValue > 1) {
    rX *= Math.sqrt(testValue)
    rY *= Math.sqrt(testValue)
  }
  c.rX = rX
  c.rY = rY
  const c_ScaleTemp = (Math.pow(rX, 2) * Math.pow(y1_, 2) + Math.pow(rY, 2) * Math.pow(x1_, 2))
  const c_Scale =
    (c.lArcFlag != c.sweepFlag ? 1 : -1) * Math.sqrt(Math.max(0, (Math.pow(rX, 2) * Math.pow(rY, 2) - c_ScaleTemp) / c_ScaleTemp))
  const cx_ = rX * y1_ / rY * c_Scale
  const cy_ = -rY * x1_ / rX * c_Scale
  const cRot = rotate([cx_, cy_], c.xRot / 180 * Math.PI)
  c.cX = cRot[0] + (x1 + x) / 2
  c.cY = cRot[1] + (y1 + y) / 2
  c.phi1 = Math.atan2((y1_ - cy_) / rY, (x1_ - cx_) / rX)
  c.phi2 = Math.atan2((-y1_ - cy_) / rY, (-x1_ - cx_) / rX)
  if (c.sweepFlag == 0 && c.phi2 > c.phi1) {
    c.phi2 -= 2 * Math.PI
  }
  if (c.sweepFlag == 1 && c.phi2 < c.phi1) {
    c.phi2 += 2 * Math.PI
  }
  c.phi1 *= 180 / Math.PI
  c.phi2 *= 180 / Math.PI
}

function a2c(x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
    // for more information of where this math came from visit:
    // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
  let _120 = PI * 120 / 180,
    rad = PI / 180 * (+angle || 0),
    res = [],
    xy,
    rotate = (x, y, rad) => {
      return { x: x * Math.cos(rad) - y * Math.sin(rad), y: x * Math.sin(rad) + y * Math.cos(rad) };
    };

  if(!recursive) {
    xy = rotate(x1, y1, -rad);
    x1 = xy.x;
    y1 = xy.y;
    xy = rotate(x2, y2, -rad);
    x2 = xy.x;
    y2 = xy.y;
    let cos = Math.cos(PI / 180 * angle),
      sin = Math.sin(PI / 180 * angle),
      x = (x1 - x2) / 2,
      y = (y1 - y2) / 2;
    let h = (x * x) / (rx * rx) + (y * y) / (ry * ry);

    if(1 < h) {
      h = Math.sqrt(h);
      rx = h * rx;
      ry = h * ry;
    }
    var rx2 = rx * rx,
      ry2 = ry * ry,
      k = (large_arc_flag == sweep_flag ? -1 : 1) *
                Math.sqrt(Math.abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
      cx = k * rx * y / ry + (x1 + x2) / 2,
      cy = k * -ry * x / rx + (y1 + y2) / 2,
      f1 = Math.asin(((y1 - cy) / ry).toFixed(9)),
      f2 = Math.asin(((y2 - cy) / ry).toFixed(9));

    f1 = x1 < cx ? PI - f1 : f1;
    f2 = x2 < cx ? PI - f2 : f2;
    0 > f1 && (f1 = PI * 2 + f1);
    0 > f2 && (f2 = PI * 2 + f2);
    if(sweep_flag && f1 > f2) {
      f1 -= PI * 2;
    }
    if(!sweep_flag && f2 > f1) {
      f2 -= PI * 2;
    }
  } else {
    f1 = recursive[0];
    f2 = recursive[1];
    cx = recursive[2];
    cy = recursive[3];
  }
  let df = f2 - f1;

  if(Math.abs(df) > _120) {
    let f2old = f2,
      x2old = x2,
      y2old = y2;

    f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
    x2 = cx + rx * Math.cos(f2);
    y2 = cy + ry * Math.sin(f2);
    res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
  }
  df = f2 - f1;
  let c1 = Math.cos(f1),
    s1 = Math.sin(f1),
    c2 = Math.cos(f2),
    s2 = Math.sin(f2),
    t = Math.tan(df / 4),
    hx = 4 / 3 * rx * t,
    hy = 4 / 3 * ry * t,
    m1 = [x1, y1],
    m2 = [x1 + hx * s1, y1 - hy * c1],
    m3 = [x2 + hx * s2, y2 - hy * c2],
    m4 = [x2, y2];

  m2[0] = 2 * m1[0] - m2[0];
  m2[1] = 2 * m1[1] - m2[1];
  if(recursive) {
    return [m2, m3, m4]['concat'](res);
  }
  res = [m2, m3, m4]['concat'](res).join()['split'](',');
  const newres = [];

  for(let i = 0, ii = res.length; i < ii; i++) {
    newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
  }
  return newres;

}

module.exports = {a2c, annotateArcCommand};
