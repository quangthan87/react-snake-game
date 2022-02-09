import React from "react";

import Pixel from "./Pixel";

import { PIXEL_SIZE } from "../constants";

const Food = ({ position }) => {
  return (
    <Pixel
      left={position.x * PIXEL_SIZE}
      top={position.y * PIXEL_SIZE}
      background={Math.floor(Math.random() * 10) < 5 ? "red" : "blue"}
    />
  );
};

export default React.memo(Food);
