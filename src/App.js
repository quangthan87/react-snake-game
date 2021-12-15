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
  const [snakePos, setSnakePos] = useState(initialSnakePos);
  const [foodPos, setFoodPos] = useState({ x: COLS / 2, y: ROWS / 2 });
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

  const move = (dir) => {
    setSnakePos((prevSnake) => {
      const head = prevSnake[prevSnake.length - 1];

      // Snake hit wall
      if (head.y >= ROWS || head.y < 0 || head.x < 0 || head.x >= COLS) {
        setGameOver(true);

        return prevSnake;
      }

      let nextHead;

      switch (dir) {
        case "right":
          nextHead = { x: head.x + 1, y: head.y };
          break;
        case "left":
          nextHead = { x: head.x - 1, y: head.y };
          break;
        case "up":
          nextHead = { x: head.x, y: head.y - 1 };
          break;
        case "down":
          nextHead = { x: head.x, y: head.y + 1 };
          break;
        default:
      }

      // Snake hit its own body
      if (prevSnake.some((p) => areSamePos(p, nextHead))) {
        setGameOver(true);

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

  const handleChangeDirection = useCallback((e) => {
    setDirection((prevDirection) => {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          if (prevDirection !== "right") {
            return "left";
          } else {
            return prevDirection;
          }
        case "ArrowRight":
        case "d":
        case "D":
          if (prevDirection !== "left") {
            return "right";
          } else {
            return prevDirection;
          }
        case "ArrowUp":
        case "w":
        case "W":
          if (prevDirection !== "down") {
            return "up";
          } else {
            return prevDirection;
          }
        case "ArrowDown":
        case "s":
        case "S":
          if (prevDirection !== "up") {
            return "down";
          } else {
            return prevDirection;
          }
        default:
          return prevDirection;
      }
    });
  }, []);

  const areSamePos = (pos1, pos2) => {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  };

  const spawnFood = () => {
    // Filter out snake positions
    const availPixels = pixels.filter(
      (pixel) =>
        !snakePos.some(
          (p) => areSamePos(p, pixel.position) && !areSamePos(pixel, foodPos)
        )
    );

    const idx = Math.floor(Math.random() * availPixels.length);

    setFoodPos(availPixels[idx].position);
  };

  const handleReset = () => {
    setGameOver(false);
    setDirection("right");
    setSnakePos(initialSnakePos);
    spawnFood();
  };

  const handlePause = () => {
    setPaused((prevState) => !prevState);
  };

  useEffect(() => {
    spawnFood();
  }, []);

  useEffect(() => {
    if (!gameOver) {
      window.addEventListener("keydown", handleChangeDirection);
    } else {
      window.removeEventListener("keydown", handleChangeDirection);
    }
  }, [gameOver, handleChangeDirection]);

  useInterval(
    () => {
      move(direction);
    },
    gameOver || paused ? null : 50
  );

  return (
    <React.Fragment>
      <Canvas
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        borderColor={!gameOver ? "black" : "red"}
      >
        <Board pixels={pixels} />
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
