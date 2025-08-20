import React, { useEffect, useState } from "react";
import "./App.css";
import ChessBoard from "./components/ChessBoard";

const emptyBoard = Array(81).fill("");

const presets = {
  easy: [
    "", "", "", "2", "6", "", "7", "", "1",
    "6", "8", "", "", "7", "", "", "9", "",
    "1", "9", "", "", "", "4", "5", "", "",
    "8", "2", "", "1", "", "", "", "4", "",
    "", "", "4", "6", "", "2", "9", "", "",
    "", "5", "", "", "", "3", "", "2", "8",
    "", "", "9", "3", "", "", "", "7", "4",
    "", "4", "", "", "5", "", "", "3", "6",
    "7", "", "3", "", "1", "8", "", "", ""
  ],
  medium: [
    "", "", "", "", "", "", "", "", "",
    "", "", "3", "", "2", "", "6", "", "",
    "", "9", "", "3", "", "5", "", "", "1",
    "", "", "1", "8", "", "6", "4", "", "",
    "", "", "8", "1", "", "2", "9", "", "",
    "", "", "2", "9", "", "4", "7", "", "",
    "5", "", "", "", "", "", "", "7", "3",
    "", "", "7", "", "4", "", "2", "", "",
    "", "", "", "5", "", "9", "", "", ""
  ],
  hard: [
    "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "3", "", "8", "5",
    "", "", "1", "", "2", "", "", "", "",
    "", "", "", "5", "", "7", "", "", "",
    "", "", "4", "", "", "", "1", "", "",
    "", "9", "", "", "", "", "", "", "",
    "5", "", "", "", "", "", "", "7", "3",
    "", "", "2", "", "1", "", "", "", "",
    "", "", "", "", "4", "", "", "", "9"
  ]
};


function App() {
  const [wasm, setWasm] = useState(null);
  const [board, setBoard] = useState([...emptyBoard]);
  const [userInputIndexes, setUserInputIndexes] = useState([]);
  const [invalidIndexes, setInvalidIndexes] = useState([]);
  const [solvedIndexes, setSolvedIndexes] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetch("/sudoku.js")
      .then((res) => res.text())
      .then((scriptText) => {
        const Module = new Function(scriptText + "; return SudokuModule;")();
        Module().then((mod) => {
          const solve = mod.cwrap("solve", "number", ["array"]);
          setWasm({ solve, HEAP32: mod.HEAP32, buffer: mod.HEAP8.buffer });
        });
      });
  }, []);

  const handleInputChange = (index, value) => {
    const newBoard = [...board];
    if (/^[1-9]?$/.test(value)) {
      newBoard[index] = value;
      if (!userInputIndexes.includes(index)) {
        setUserInputIndexes((prev) => [...prev, index]);
      }
    }
    setBoard(newBoard);
    validateBoard(newBoard);
    setSolvedIndexes([]);
    setShowSuccess(false);
  };

  const validateBoard = (board) => {
    const indexesWithIssues = new Set();
    const getRow = (i) => Math.floor(i / 9);
    const getCol = (i) => i % 9;

    for (let i = 0; i < 81; i++) {
      if (!board[i]) continue;
      const value = board[i];
      const row = getRow(i);
      const col = getCol(i);

      for (let j = 0; j < 9; j++) {
        if (row * 9 + j !== i && board[row * 9 + j] === value)
          indexesWithIssues.add(i);
        if (j * 9 + col !== i && board[j * 9 + col] === value)
          indexesWithIssues.add(i);
      }
      const blockRow = Math.floor(row / 3) * 3;
      const blockCol = Math.floor(col / 3) * 3;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const idx = (blockRow + r) * 9 + (blockCol + c);
          if (idx !== i && board[idx] === value) indexesWithIssues.add(i);
        }
      }
    }
    setInvalidIndexes(Array.from(indexesWithIssues));
  };

  const handleSolve = () => {
    if (!wasm || invalidIndexes.length > 0) {
      alert("Fix invalid cells before solving.");
      return;
    }
    const inputArray = new Int32Array(board.map((v) => (v === "" ? 0 : parseInt(v))));
    const ptr = wasm.solve(inputArray);
    const solved = new Int32Array(wasm.buffer, ptr, 81);
    const solvedArray = Array.from(solved).map((v) => (v === 0 ? "" : v.toString()));
    const newlySolved = solvedArray.map((v, i) => (board[i] === "" && v !== "" ? i : null)).filter((i) => i !== null);

    setBoard(solvedArray);
    setSolvedIndexes(newlySolved);
    setInvalidIndexes([]);
    setShowSuccess(true);
  };

  const handleReset = () => {
    setBoard([...emptyBoard]);
    setUserInputIndexes([]);
    setInvalidIndexes([]);
    setSolvedIndexes([]);
    setShowSuccess(false);
  };

  const loadPreset = (level) => {
    setBoard([...presets[level]]);
    setUserInputIndexes(
      presets[level]
        .map((v, i) => (v !== "" ? i : null))
        .filter((i) => i !== null)
    );
    setInvalidIndexes([]);
    setSolvedIndexes([]);
    setShowSuccess(false);
  };

  return (
    <div className="app-container">
      <div className="left-panel">
        <h1>React + WASM (C++) Sudoku</h1>
        <div className="preset-buttons">
          <button onClick={() => loadPreset("easy")}>Load Easy</button>
          <button onClick={() => loadPreset("medium")}>Load Medium</button>
          <button onClick={() => loadPreset("hard")}>Load Hard</button>
        </div>

        <div className="sudoku-grid">
          {board.map((value, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              className={`sudoku-cell ${userInputIndexes.includes(index) ? "user-input" : ""} 
                ${invalidIndexes.includes(index) ? "invalid-cell" : ""} 
                ${solvedIndexes.includes(index) ? "solved-cell" : ""}`}
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
            />
          ))}
        </div>

        <div className="buttons">
          <button onClick={handleSolve} disabled={!wasm}>Solve Sudoku</button>
          <button onClick={handleReset}>Reset Board</button>
        </div>

        {showSuccess && <div className="success-message">🎉 Sudoku Solved!</div>}
      </div>

      <div className="right-panel">
        <ChessBoard />
      </div>
    </div>
  );
}

export default App;
