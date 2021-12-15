import React from "react";
import styled from "styled-components";

import { PIXEL_SIZE } from "../constants";

const Square = styled.div.attrs((props) => ({
  style: {
    left: props.left + "px",
    top: props.top + "px",
    background: props.background
  }
}))`
  position: absolute;
  width: ${PIXEL_SIZE + "px"};
  height: ${PIXEL_SIZE + "px"};
  border: 1px solid #aaa;
`;

const Pixel = ({ left, top, background }) => {
  return <Square left={left} top={top} background={background} />;
};

export default Pixel;
