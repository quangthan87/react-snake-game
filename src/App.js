import React, { useState, useEffect, useCallback } from "react";
import { useInterval } from "./hooks/useInterval";

import styled from "styled-components";

import Canvas from "./components/Canvas";
import Board from "./components/Board";
import Snake from "./components/Snake";
import Food from "./components/Food";

import { CANVAS_WIDTH, CANVAS_HEIGHT, ROWS, COLS } from "./constants";
import { areSamePos, areOpposite } from "./utils";

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

const initialSnakePos = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 0 }
];

const App = () => {
  const [direction, setDirection] = useState("right");
  const [dirQueue, setDirQueue] = useState([]);
  const [snakePos, setSnakePos] = useState(initialSnakePos);
  const [foodPos, setFoodPos] = useState({ x: COLS / 2, y: ROWS / 2 });
  const [gameOver, setGameOver] = useState(null);
  const [paused, setPaused] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [score, setScore] = useState(0);
  const [highestScore, setHighestScore] = useState(0);

  useInterval(
    () => {
      moveSnake();
    },
    gameOver || paused ? null : 50
  );

  const moveSnake = () => {
    let currentDir = direction;
    const queue = [...dirQueue];

    // Get current direction from queue
    while (queue.length > 0) {
      let candidateDir = queue.shift();

      if (!areOpposite(candidateDir, currentDir)) {
        currentDir = candidateDir;
        setDirQueue(queue);
        setDirection(currentDir);
        break;
      }
    }

    const currSnakePos = [...snakePos];
    const head = currSnakePos[currSnakePos.length - 1];

    // Snake hit wall
    if (head.y >= ROWS || head.y < 0 || head.x < 0 || head.x >= COLS) {
      setGameOver("lose");
      return;
    }

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

    // Snake hit its own body
    if (currSnakePos.some((p) => areSamePos(p, nextHead))) {
      setGameOver("lose");
      return;
    }

    // Eat food
    if (areSamePos(nextHead, foodPos)) {
      setSnakePos([...currSnakePos, nextHead]);
      setScore((s) => s + 1);
    } else {
      setSnakePos([...currSnakePos.splice(1), nextHead]);
    }
  };

  const spawnFood = () => {
    // Filter out snake positions
    const availPixels = pixels.filter(
      (pixel) =>
        !snakePos.some((p) => areSamePos(p, pixel.position)) &&
        !areSamePos(foodPos, pixel.position)
    );

    if (availPixels.length === 0) {
      setGameOver("win");
      return;
    }

    const idx = Math.floor(Math.random() * availPixels.length);

    setFoodPos(availPixels[idx].position);
  };

  useEffect(() => {
    if (!gameOver) {
      spawnFood();
    } else {
      if (score > highestScore) {
        setHighestScore(score);
      }
    }
  }, [gameOver, score, highestScore]);

  const handleKeyDown = useCallback((e) => {
    setDirQueue((prevQueue) => {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          return [...prevQueue, "left"];
        case "ArrowRight":
        case "d":
        case "D":
          return [...prevQueue, "right"];
        case "ArrowUp":
        case "w":
        case "W":
          return [...prevQueue, "up"];
        case "ArrowDown":
        case "s":
        case "S":
          return [...prevQueue, "down"];
        default:
          return prevQueue;
      }
    });
  }, []);

  useEffect(() => {
    if (!gameOver) {
      window.addEventListener("keydown", handleKeyDown);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
    }
  }, [gameOver, handleKeyDown]);

  useEffect(() => {
    // Filter out snake positions
    const availPixels = pixels.filter(
      (pixel) =>
        !snakePos.some((p) => areSamePos(p, pixel.position)) &&
        !areSamePos(foodPos, pixel.position)
    );

    if (availPixels.length === 0) {
      setGameOver("win");
      return;
    }
  }, [snakePos, foodPos]);

  const handleReset = () => {
    setSnakePos(initialSnakePos);
    setGameOver(null);
    setDirection("right");
    setDirQueue([]);
    setScore(0);
  };

  const handlePause = () => {
    setPaused((prevState) => !prevState);
  };

  const handleShowGrid = (e) => {
    setShowGrid(e.target.checked);
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
        <Snake positions={snakePos} />
        <Food position={foodPos} />
      </Canvas>
      <ControlBar>
        <div>
          <input type="checkbox" id="showGrid" onChange={handleShowGrid} />
          <label htmlFor="showGrid">Show grid</label>
        </div>
        <div>
          {gameOver && <button onClick={handleReset}>Play again</button>}
          {!gameOver && (
            <button onClick={handlePause}>{paused ? "Resume" : "Pause"}</button>
          )}
        </div>
      </ControlBar>
    </Container>
  );
};

export default App;
