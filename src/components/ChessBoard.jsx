import React, { useEffect, useState } from "react";
import "./ChessBoard.css";

const initialBoard = [
  ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
  ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
  ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
];

export default function ChessBoard() {
  const [wasm, setWasm] = useState(null);
  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch("/chess.js")
      .then((res) => res.text())
      .then((scriptText) => {
        const Module = new Function(scriptText + "; return ChessModule;")();
        Module().then((mod) => {
          const isMoveValid = mod.cwrap("is_move_valid", "boolean", ["number", "number", "number", "number"]);
          setWasm({ isMoveValid });
        });
      });
  }, []);

  const handleCellClick = (row, col) => {
    if (!wasm) return;

    if (selected) {
      const [fromRow, fromCol] = selected;
      if (wasm.isMoveValid(fromRow, fromCol, row, col)) {
        const newBoard = board.map((r) => r.slice());
        newBoard[row][col] = newBoard[fromRow][fromCol];
        newBoard[fromRow][fromCol] = "";
        setBoard(newBoard);
      }
      setSelected(null);
    } else {
      if (board[row][col] !== "") {
        setSelected([row, col]);
      }
    }
  };

  return (
    <div className="left-panel">
      <h2>React + WASM (C++) Chess</h2>
      <div className="chess-board">
        {board.map((rowArr, row) =>
          rowArr.map((cell, col) => (
            <div
              key={`${row}-${col}`}
              className={`chess-cell ${(row + col) % 2 === 0 ? "white" : "black"} ${
                selected && selected[0] === row && selected[1] === col ? "selected" : ""
              }`}
              onClick={() => handleCellClick(row, col)}
            >
              {cell}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
