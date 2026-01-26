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
    const angle = Math.atan2(dy, dx);

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

module.exports = {
  cartesianToPolar,
  degreesToRadians,
  radiansToDegrees,
}
