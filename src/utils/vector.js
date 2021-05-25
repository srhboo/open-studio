export const calculateNewPosition = (
  currentPosition,
  destination,
  speed = 0.05
) => {
  const [x, y, z] = [
    { dest: destination.x, curr: currentPosition.x },
    { dest: destination.y, curr: currentPosition.y },
    { dest: destination.z, curr: currentPosition.z },
  ].map(({ dest, curr }) => {
    // to get the signs
    const diff = dest - curr;
    const diffSign = Math.sign(diff);
    const updated = Math.abs(diff) < speed * 2 ? dest : curr + diffSign * speed;
    return updated;
  });
  return { x, y, z };
};
