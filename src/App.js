import React, { useEffect, useCallback, useReducer } from "react";
import { useInterval } from "./hooks/useInterval";
import { areSamePos, areOpposite } from "./utils";

import styled from "styled-components";

import Canvas from "./components/Canvas";
import Board from "./components/Board";
import Snake from "./components/Snake";
import Food from "./components/Food";

import { CANVAS_WIDTH, CANVAS_HEIGHT, ROWS, COLS } from "./constants";

const Container = styled.div`
  display: grid;
  justify-content: center;
  gap: 4px;
`;

const ScoreBar = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
`;

const pixels = [];

for (let i = 0; i < ROWS; i++) {
  for (let j = 0; j < COLS; j++) {
    pixels.push({
      id: i + "_" + j,
      position: { x: j, y: i },
      background: "white"
    });
  }
}

const initialState = {
  snake: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 }
  ],
  food: {},
  direction: "right",
  directionQueue: [],
  gameOver: null,
  paused: false,
  score: 0,
  highestScore: 0,
  showGrid: false
};

const reducer = (state, action) => {
  const {
    snake,
    food,
    direction,
    directionQueue,
    paused,
    score,
    highestScore,
    showGrid
  } = state;

  switch (action.type) {
    case "SNAKE_STEP":
      let currentDir = direction;
      const queue = [...directionQueue];

      // Get current direction from queue
      while (queue.length > 0) {
        let candidateDir = queue.shift();

        if (!areOpposite(candidateDir, currentDir)) {
          currentDir = candidateDir;
          break;
        }
      }

      const currSnake = [...snake];
      const head = currSnake[currSnake.length - 1];

      let nextHead;

      switch (currentDir) {
        case "right":
          nextHead = { ...head, x: head.x + 1 };
          break;
        case "left":
          nextHead = { ...head, x: head.x - 1 };
          break;
        case "up":
          nextHead = { ...head, y: head.y - 1 };
          break;
        case "down":
          nextHead = { ...head, y: head.y + 1 };
          break;
        default:
      }

      // Snake hit wall
      if (
        nextHead.y >= ROWS ||
        nextHead.y < 0 ||
        nextHead.x < 0 ||
        nextHead.x >= COLS
      ) {
        return {
          ...state,
          gameOver: "lose"
        };
      }

      // Snake hit its own body
      if (currSnake.some((p) => areSamePos(p, nextHead))) {
        return {
          ...state,
          gameOver: "lose"
        };
      }

      // Eat food
      if (areSamePos(nextHead, food)) {
        return {
          ...state,
          snake: [...currSnake, nextHead],
          direction: currentDir,
          directionQueue: queue,
          score: score + 1
        };
      } else {
        return {
          ...state,
          snake: [...currSnake.splice(1), nextHead],
          direction: currentDir,
          directionQueue: queue
        };
      }
    case "SPAWN_FOOD":
      const availPixels = pixels.filter(
        (pixel) =>
          !snake.some((p) => areSamePos(p, pixel.position)) &&
          !areSamePos(food, pixel.position)
      );

      if (availPixels.length === 0) {
        return {
          ...state,
          gameOver: "win"
        };
      }

      const idx = Math.floor(Math.random() * availPixels.length);

      return {
        ...state,
        food: availPixels[idx].position
      };
    case "CHANGE_DIRECTION":
      return {
        ...state,
        directionQueue: [...directionQueue, action.payload]
      };
    case "PAUSE_GAME":
      return {
        ...state,
        paused: !paused
      };
    case "RESET_GAME":
      return {
        ...initialState,
        highestScore: highestScore,
        showGrid: showGrid
      };
    case "SET_HIGHEST_SCORE":
      return {
        ...state,
        highestScore: score
      };
    case "TOGGLE_GRID":
      return {
        ...state,
        showGrid: action.payload
      };
    default:
  }
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { snake, food, gameOver, paused, score, highestScore, showGrid } =
    state;

  useInterval(
    () => {
      dispatch({ type: "SNAKE_STEP" });
    },
    gameOver || paused ? null : 50
  );

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          dispatch({ type: "CHANGE_DIRECTION", payload: "left" });
          break;
        case "ArrowRight":
        case "d":
        case "D":
          dispatch({ type: "CHANGE_DIRECTION", payload: "right" });
          break;
        case "ArrowUp":
        case "w":
        case "W":
          dispatch({ type: "CHANGE_DIRECTION", payload: "up" });
          break;
        case "ArrowDown":
        case "s":
        case "S":
          dispatch({ type: "CHANGE_DIRECTION", payload: "down" });
          break;
        default:
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (!gameOver) {
      dispatch({ type: "SPAWN_FOOD" });
      window.addEventListener("keydown", handleKeyDown);
    } else {
      window.removeEventListener("keydown", handleKeyDown);

      if (score > highestScore) {
        dispatch({ type: "SET_HIGHEST_SCORE" });
      }
    }
  }, [gameOver, score, highestScore, handleKeyDown]);

  const handleReset = () => {
    dispatch({ type: "RESET_GAME" });
  };

  const handlePause = () => {
    dispatch({ type: "PAUSE_GAME" });
  };

  const handleShowGrid = (e) => {
    dispatch({ type: "TOGGLE_GRID", payload: e.target.checked });
  };

  return (
    <Container>
      <ScoreBar>
        <h4>Score: {score}</h4>
        <h4>Highest Score: {highestScore}</h4>
      </ScoreBar>
      <Canvas
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        borderColor={!gameOver ? "black" : gameOver === "win" ? "green" : "red"}
      >
        <Board pixels={pixels} showGrid={showGrid} />
        <Snake positions={snake} />
        <Food position={food} />
      </Canvas>
      <ControlBar>
        <div>
          <input type="checkbox" id="showGrid" onChange={handleShowGrid} />
          <label htmlFor="showGrid">Show grid</label>
        </div>
        <div>
          <button onClick={handleReset}>Play again</button>
          {!gameOver && (
            <button onClick={handlePause}>{paused ? "Resume" : "Pause"}</button>
          )}
        </div>
      </ControlBar>
    </Container>
  );
};

export default App;
