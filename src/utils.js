export const areSamePos = (pos1, pos2) => {
  return pos1.x === pos2.x && pos1.y === pos2.y;
};

export const areOpposite = (dir1, dir2) => {
  if (dir1 === "left" && dir2 === "right") {
    return true;
  }
  if (dir1 === "right" && dir2 === "left") {
    return true;
  }
  if (dir1 === "up" && dir2 === "down") {
    return true;
  }
  if (dir1 === "down" && dir2 === "up") {
    return true;
  }
  return false;
};
