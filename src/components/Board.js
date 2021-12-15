import React from "react";

import Pixel from "./Pixel";

import { PIXEL_SIZE } from "../constants";

const Board = React.memo(({ pixels }) => {
  return (
    <React.Fragment>
      {pixels.map((pixel) => (
        <Pixel
          key={pixel.id}
          left={pixel.position.x * PIXEL_SIZE}
          top={pixel.position.y * PIXEL_SIZE}
          background={pixel.background}
        />
      ))}
    </React.Fragment>
  );
});

export default Board;
