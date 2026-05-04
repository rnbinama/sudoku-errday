import { useState, useEffect } from "react";


const initialGrid = [
  [5, 3, null, null, 7, null, null, null, null],
  [6, null, null, 1, 9, 5, null, null, null],
  [null, 9, 8, null, null, null, null, 6, null],
  [8, null, null, null, 6, null, null, null, 3],
  [4, null, null, 8, null, 3, null, null, 1],
  [7, null, null, null, 2, null, null, null, 6],
  [null, 6, null, null, null, null, 2, 8, null],
  [null, null, null, 4, 1, 9, null, null, 5],
  [null, null, null, null, 8, null, null, 7, 9],
];

const originalCells = initialGrid.map(row =>
  row.map(cell => cell !== null)
);

export default function Sudoku() {
  const [grid, setGrid] = useState(initialGrid);
  const [selected, setSelected] = useState({ row: 0, col: 0 });
  const [won, setWon] = useState(false);
  const [history, setHistory] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
      if (!gameOver && checkWin(grid)) {
        setWon(true);
        setGameOver(true);
      }
    }, [grid, gameOver]);

  function handleChange(row, col, value) {
  if (gameOver) return;
  if (originalCells[row][col]) return;

  if (value === "" || /^[1-9]$/.test(value)) {
    const copy = grid.map(r => [...r]);
    copy[row][col] = value === "" ? null : Number(value);
    setGrid(copy);
  }
}



  function handleKeyDown(e) {
  if (gameOver) return;
  let { row, col } = selected;

  setHistory(prev => [...prev, JSON.parse(JSON.stringify(grid))]);

  if (e.key === "ArrowUp") row = Math.max(0, row - 1);
  else if (e.key === "ArrowDown") row = Math.min(8, row + 1);
  else if (e.key === "ArrowLeft") col = Math.max(0, col - 1);
  else if (e.key === "ArrowRight") col = Math.min(8, col + 1);
  else if (/^[1-9]$/.test(e.key)) {
    if (!originalCells[row][col]) {
      const copy = grid.map(r => [...r]);
      copy[row][col] = Number(e.key);
      setGrid(copy);
      checkGameState(copy);
    }
  }
  else if (e.key === "Backspace" || e.key === "Delete") {
    if (!originalCells[row][col]) {
      const copy = grid.map(r => [...r]);
      copy[row][col] = null;
      setGrid(copy);
      checkGameState(copy);
    }
  }

  setSelected({ row, col });
}



  function isValid(grid, row, col) {
  const value = grid[row][col];
  if (!value) return true;

  for (let i = 0; i < 9; i++) {
    if (i !== col && grid[row][i] === value) return false;
    if (i !== row && grid[i][col] === value) return false;
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let i = boxRow; i < boxRow + 3; i++) {
    for (let j = boxCol; j < boxCol + 3; j++) {
      if ((i !== row || j !== col) && grid[i][j] === value) {
        return false;
      }
    }
  }

  return true;
}

function isRelatedCell(i, j) {
  const sameRow = i === selected.row;
  const sameCol = j === selected.col;

  const boxRow = Math.floor(i / 3);
  const boxCol = Math.floor(j / 3);
  const selectedBoxRow = Math.floor(selected.row / 3);
  const selectedBoxCol = Math.floor(selected.col / 3);

  const sameBox = boxRow === selectedBoxRow && boxCol === selectedBoxCol;

  return sameRow || sameCol || sameBox;
}

function enterNumber(value) {
  if (gameOver) return;

  const { row, col } = selected;
  if (originalCells[row][col]) return;

  setHistory(prev => [...prev, JSON.parse(JSON.stringify(grid))]);

  const copy = grid.map(r => [...r]);
  copy[row][col] = value;
  setGrid(copy);

  checkGameState(copy);
}

function checkWin(grid) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (!grid[i][j] || !isValid(grid, i, j)) {
        return false;
      }
    }
  }
  return true;
}

function undo() {
  if (history.length === 0) return;

  const previous = history[history.length - 1];
  setGrid(previous);
  setHistory(history.slice(0, -1));
}

function checkGameState(updatedGrid) {
  if (checkWin(updatedGrid)) {
    setWon(true);
    setGameOver(true);
  }
}

function deleteCell() {
  if (gameOver) return;

  const { row, col } = selected;

  if (originalCells[row][col]) return;

  const copy = grid.map(r => [...r]);
  copy[row][col] = null;

  setGrid(copy);
}



  return (
    <div className="app">
    <div style={{ textAlign: "center" }}>
      {won && ( <div className="win-screen">
                  <h1>🎉 Hooray! 🎉</h1>
                  <p>You solved today’s puzzle.</p>
                  <p>Come back tomorrow for a new challenge 🧩</p>
                </div>
        )}

    <div className={won ? "game blurred" : "game"}>

      <div className="sudoku" tabIndex="0" onKeyDown={handleKeyDown}>
        {grid.map((row, i) =>
          row.map((cell, j) => (
            <input
              key={`${i}-${j}`}
              readOnly
              value={cell ?? ""}
              onClick={() => setSelected({ row: i, col: j })}
              className={`cell
                ${originalCells[i][j] ? "original" : ""}
                ${i === selected.row && j === selected.col ? "selected" : ""}
                ${isRelatedCell(i, j) ? "related" : ""}
                ${!isValid(grid, i, j) ? "invalid" : ""}
                ${j % 3 === 2 && j !== 8 ? "border-right" : ""}
                ${i % 3 === 2 && i !== 8 ? "border-bottom" : ""}
              `}
            />
          ))
        )}
      </div>

      <div className="number-panel">
        {[1, 2, 3, 4, 5].map(num => (
          <button key={num} onClick={() => enterNumber(num)}>
            {num}
          </button>
        ))}

        {[6, 7, 8, 9].map(num => (
          <button key={num} onClick={() => enterNumber(num)}>
            {num}
          </button>
      ))}
      <button className="delete-btn" onClick={deleteCell}>
        ⌫
      </button>
    </div>
  </div>
</div>
</div>

  );
}