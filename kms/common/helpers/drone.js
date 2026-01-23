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
    let angle = Math.atan2(dy, dx);

    return {
        radius,
        angle
    };
}

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function fromToDelta(from, currentAngleInDegrees, to) {
  // 1. Calculate distance (Pythagorean theorem)
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // 2. Calculate target angle in radians, then degrees
  // Math.atan2 returns angle in radians (-PI to PI)
  const targetAngleRadians = Math.atan2(dy, dx);
  const targetAngleDegrees = targetAngleRadians * (180 / Math.PI);

  // 3. Calculate raw delta
  let delta = targetAngleDegrees - currentAngleInDegrees;

  // 4. Normalize delta to be between -180 and 180 for shortest turn
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;

  return {
    distance: distance,
    angle: delta
  };
}
function xfromToDelta(fromPoint, currentAngleInDegrees, toPoint) {
  const dx = toPoint.x - fromPoint.x;
  const dy = toPoint.y - fromPoint.y;

  const distance = Math.hypot(dx, dy);

  if (distance === 0) {
    return { angle: 0, distance: 0 };
  }

  // Direction we WANT to face (in radians)
  // Note: Math.atan2(y,x) → angle from positive x-axis (0 = right, 90° = up)
  const desiredAngleRad = Math.atan2(-dy, dx);

  // Convert current angle to radians
  const currentAngleRad = currentAngleInDegrees * Math.PI / 180;

  // Difference in radians
  let angleDiffRad = desiredAngleRad - currentAngleRad;

  // Normalize to [-π, π]
  angleDiffRad = ((angleDiffRad + Math.PI) % (2 * Math.PI)) - Math.PI;

  // Convert back to degrees
  let angleDegrees = angleDiffRad * 180 / Math.PI;

  // Optional: round to reasonable precision
  angleDegrees = Math.round(angleDegrees * 100) / 100;

  // return deltas
  return {
      // angle: (angleDegrees-currentAngleInDegrees),     // positive = turn right, negative = turn left
      angle: (angleDegrees-currentAngleInDegrees),     // positive = turn right, negative = turn left
      distance: Math.round(distance * 100) / 100   // or keep exact: distance
  };
}

module.exports = {
  fromToDelta,
  cartesianToPolar,
  degreesToRadians,
}
