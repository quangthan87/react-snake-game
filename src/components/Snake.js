import React from "react";

import Pixel from "./Pixel";

import { PIXEL_SIZE } from "../constants";

const Snake = ({ positions }) => {
  return (
    <React.Fragment>
      {positions.map((position) => (
        <Pixel
          key={`${position.x}_${position.y}`}
          left={position.x * PIXEL_SIZE}
          top={position.y * PIXEL_SIZE}
          background="black"
        />
      ))}
    </React.Fragment>
  );
};

export default Snake;
