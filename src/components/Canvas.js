import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    position: relative;
    width: ${props => props.width + "px"};
    height: ${props => props.height + "px"};
    border: 5px solid ${props => props.borderColor};
    margin-left: 4px;
    box-sizing: content-box;
`;

const Canvas = (props) => {
    return (
        <Container width={props.width} height={props.height} borderColor={props.borderColor}>{props.children}</Container>
    )
};

export default Canvas;
