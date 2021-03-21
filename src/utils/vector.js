export const calculateNewPosition = (currentPosition, destination) => {
  const [x, y, z] = [
    { dest: destination.x, curr: currentPosition.x },
    { dest: destination.y, curr: currentPosition.y },
    { dest: destination.z, curr: currentPosition.z },
  ].map(({ dest, curr }) => {
    // to get the signs
    const diff = dest - curr;
    const diffSign = Math.sign(diff);
    const updated = Math.abs(diff) < 0.1 ? dest : curr + diffSign * 0.05;
    return updated;
  });
  return { x, y, z };
};
