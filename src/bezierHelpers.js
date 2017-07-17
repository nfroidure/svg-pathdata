function bezierRoot(x0, x1, x2, x3) {
  const EPS = 1e-6
  const p01 = p1 - p0, p12 = p2 - p1, p23 = p3 - p2
  const a = 3 * p01 + 3 * p23 - 6 * p12
  const b = p12 - 6 * p01
  const c = 3 * p01
  // solve a * t² + b * t + c = 0
  if (Math.abs(a) < EPS) {
    // equivalent to b * t + c =>
    return [-c / b]
  } else {
    return pqFormula(b / a, c / a, EPS)
  }
}
function bezierAt(x0, x1, x2, x3, t) {
  //console.log(x0, y0, x1, y1, x2, y2, x3, y3, t)
  const s = 1 - t, c0 = s * s * s, c1 = 3 * s * s * t, c2 = 3 * s * t * t, c3 = t * t * t
  return x0 * c0 + x1 * c1 + x2 * c2 + x3 * c3
}

function pqFormula(p, q, PRECISION = 1e-6) {
  // 4 times the discriminant:in
  const discriminantX4 = p * p / 4 - q
  if (discriminantX4 < -PRECISION) {
    return []
  } else if (discriminantX4 <= PRECISION) {
    return [-p / 2]
  } else {
    const root = Math.sqrt(discriminantX4)
    return [-p / 2 - root, -p / 2 + root]
  }
}
