/**
 * Converts cartesian coordinates of point P relative to origin O
 * into polar coordinates { radius, angle }.
 * Angle is in radians, measured counterclockwise from positive x-axis.
 *
 * @param {Object} O - Origin point {x, y}
 * @param {Object} P - Point to convert {x, y}
 * @returns {Object} Polar coordinates { radius, angle } (angle in radians)
 */
function cartesianToPolar(O, P) {
    // Calculate differences (vector from O to P)
    const dx = P.x - O.x;
    const dy = P.y - O.y;

    // Radius (distance from origin)
    const radius = Math.hypot(dx, dy);

    // Angle in radians (-π to π)
    const angle = Math.atan2(dy, dx) % (2*Math.PI)

    return {
        radius,
        angle
    };
}

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function radiansToDegrees(radians) {
  return (radians * 180) / Math.PI;
}

function smallestRotate(angle) {
  angle = angle % (Math.PI*2)
  if (angle > 0 && angle > Math.PI) {
    angle = -(Math.PI*2 - angle)
  }
  if (angle < 0 && angle < -Math.PI) {
    angle = Math.PI*2 + angle
  }
  return angle
}

function rotateDelta(currentRadians, targetRadians) {
  return smallestRotate(((targetRadians - currentRadians + Math.PI) % (2 * Math.PI)) - Math.PI)
}

module.exports = {
  cartesianToPolar,
  degreesToRadians,
  radiansToDegrees,
  rotateDelta,
  smallestRotate,
}
