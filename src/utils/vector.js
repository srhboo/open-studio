export const calculateNewPosition = (
  currentPosition,
  destination,
  speed = 0.05
) => {
  let resting = true;
  const [x, y, z] = [
    { dest: destination.x, curr: currentPosition.x },
    { dest: destination.y, curr: currentPosition.y },
    { dest: destination.z, curr: currentPosition.z },
  ].map(({ dest, curr }) => {
    // to get the signs
    const diff = dest - curr;
    const diffSign = Math.sign(diff);
    const noMovement = Math.abs(diff) < speed * 2;
    if (!noMovement) {
      resting = false;
    }
    const updated = noMovement ? dest : curr + diffSign * speed;
    return updated;
  });
  return { x, y, z, resting };
};

export const hypotenuse = (a, b) => Math.sqrt(a ** 2 + b ** 2);
