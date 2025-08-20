import React from 'react';

export default function SudokuGrid({ board, onInput }) {
  return (
    <div className="grid">
      {board.map((val, i) => (
        <input
          key={i}
          maxLength="1"
          value={val || ''}
          onChange={(e) => onInput(i, parseInt(e.target.value) || 0)}
        />
      ))}
    </div>
  );
}
