import React from "react";
import styled from "styled-components";

import { PIXEL_SIZE } from "../constants";

const Square = styled.div.attrs((props) => ({
  style: {
    left: props.left + "px",
    top: props.top + "px",
    background: props.background,
    border: props.border ? "1px solid #aaa" : "none"
  }
}))`
  position: absolute;
  width: ${PIXEL_SIZE + "px"};
  height: ${PIXEL_SIZE + "px"};
`;

const Pixel = ({ left, top, background, border }) => {
  return (
    <Square left={left} top={top} background={background} border={border} />
  );
};

export default Pixel;
