import React from "react";

import Pixel from "./Pixel";

import { PIXEL_SIZE } from "../constants";

const Food = ({ position }) => {
  return (
    <Pixel
      left={position.x * PIXEL_SIZE}
      top={position.y * PIXEL_SIZE}
      background="blue"
    />
  );
};

export default Food;
