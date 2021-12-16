import React, { useState, useEffect, useCallback } from "react";
import { useInterval } from "./hooks/useInterval";

import Canvas from "./components/Canvas";
import Board from "./components/Board";
import Snake from "./components/Snake";
import Food from "./components/Food";

import { CANVAS_WIDTH, CANVAS_HEIGHT, ROWS, COLS } from "./constants";

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

    setSnakePos((prevSnake) => {
      const head = prevSnake[prevSnake.length - 1];

      // Snake hit wall
      if (head.y >= ROWS || head.y < 0 || head.x < 0 || head.x >= COLS) {
        setGameOver("lose");

        return prevSnake;
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
      if (prevSnake.some((p) => areSamePos(p, nextHead))) {
        setGameOver("lose");

        return prevSnake;
      }

      // Eat food
      if (areSamePos(nextHead, foodPos)) {
        spawnFood();
        return [...prevSnake, nextHead];
      } else {
        return [...prevSnake.slice(1), nextHead];
      }
    });
  };

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

  const areSamePos = (pos1, pos2) => {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  };

  const areOpposite = (dir1, dir2) => {
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

  const handleReset = () => {
    setSnakePos(initialSnakePos);
    setGameOver(null);
    setDirection("right");
    setDirQueue([]);
  };

  const handlePause = () => {
    setPaused((prevState) => !prevState);
  };

  useEffect(() => {
    if (!gameOver) {
      spawnFood();
    }
  }, [gameOver]);

  useEffect(() => {
    if (!gameOver) {
      window.addEventListener("keydown", handleKeyDown);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
    }
  }, [gameOver, handleKeyDown]);

  useInterval(
    () => {
      moveSnake();
    },
    gameOver || paused ? null : 50
  );

  const handleShowGrid = (e) => {
    setShowGrid(e.target.checked);
  };

  return (
    <React.Fragment>
      <input type="checkbox" id="showGrid" onChange={handleShowGrid} />
      <label htmlFor="showGrid">Show grid</label>
      <Canvas
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        borderColor={!gameOver ? "black" : gameOver === "win" ? "green" : "red"}
      >
        <Board pixels={pixels} showGrid={showGrid} />
        <Snake positions={snakePos} />
        <Food position={foodPos} />
      </Canvas>
      {gameOver && <button onClick={handleReset}>Play again</button>}
      {!gameOver && (
        <button onClick={handlePause}>{paused ? "Resume" : "Pause"}</button>
      )}
    </React.Fragment>
  );
};

export default App;
