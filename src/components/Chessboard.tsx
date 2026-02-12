'use client';

import React from 'react';
import type { Move, Piece, Square } from '@/lib/chess-engine';

interface ChessboardProps {
  board: (Piece | null)[][];
  onSquareClick: (square: Square) => void;
  selectedSquare: Square | null;
  legalMoves: Square[];
  lastMove: Move | null;
  isCheck: boolean;
  checkSquare: Square | null;
  disabled?: boolean;
  perspective: 'white' | 'black';
}

export function Chessboard({
  board,
  onSquareClick,
  selectedSquare,
  legalMoves,
  lastMove,
  isCheck,
  checkSquare,
  disabled = false,
  perspective = 'white',
}: ChessboardProps) {
  const PIECE_SYMBOLS: { [key: string]: string } = {
    'w-k': '♔',
    'w-q': '♕',
    'w-r': '♖',
    'w-b': '♗',
    'w-n': '♘',
    'w-p': '♙',
    'b-k': '♚',
    'b-q': '♛',
    'b-r': '♜',
    'b-b': '♝',
    'b-n': '♞',
    'b-p': '♟',
  };

  const getSquareCoords = (row: number, col: number): { rank: number; file: string } => {
    if (perspective === 'black') return { rank: row + 1, file: String.fromCharCode(104 - col) };
    return { rank: 8 - row, file: String.fromCharCode(97 + col) };
  };

  const getSquareLabel = (row: number, col: number): Square => {
    const { rank, file } = getSquareCoords(row, col);
    return `${file}${rank}` as Square;
  };

  const isLightSquare = (row: number, col: number): boolean => {
    const file = (perspective === 'black' ? 7 - col : col) % 2;
    const rank = row % 2;
    return (file + rank) % 2 === 1;
  };

  const isLastMoveSquare = (square: Square): boolean => {
    if (!lastMove) return false;
    return square === lastMove.from || square === lastMove.to;
  };

  const boardOrder = perspective === 'black' ? [...board].reverse() : board;

  return (
    <div className="inline-grid grid-cols-8 gap-0 bg-[#4b7399] p-2 rounded-md shadow-xl" role="grid" aria-label="Chess board">
      {Array.from({ length: 8 }).map((_, row) => {
        const rowOrder = perspective === 'black' ? boardOrder[row].slice().reverse() : boardOrder[row];

        return rowOrder.map((piece, col) => {
          const adjustedRow = perspective === 'black' ? 7 - row : row;
          const adjustedCol = perspective === 'black' ? 7 - col : col;

          const square = getSquareLabel(adjustedRow, adjustedCol);
          const isLight = isLightSquare(adjustedRow, adjustedCol);
          const isSelected = square === selectedSquare;
          const isLegal = legalMoves.includes(square);
          const isLastMove = isLastMoveSquare(square);
          const isCheckSquare = isCheck && checkSquare === square;

          return (
            <button
              key={square}
              type="button"
              onClick={() => !disabled && onSquareClick(square)}
              disabled={disabled}
              aria-label={`Square ${square}${piece ? ` with ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ''}`}
              className={`
                w-12 h-12 md:w-[72px] md:h-[72px] flex items-center justify-center text-4xl md:text-5xl
                relative font-bold select-none transition-colors
                ${isLight ? 'bg-[#f0d9b5]' : 'bg-[#b58863]'}
                ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                ${isSelected ? 'ring-4 ring-[#4caf50] ring-inset z-10' : ''}
                ${isLastMove ? (isLight ? 'bg-[#f7ec74]' : 'bg-[#d8b640]') : ''}
                ${isCheckSquare ? 'ring-4 ring-red-600 ring-inset' : ''}
              `}
            >
              {isLegal && (
                <span
                  className={`absolute rounded-full ${piece ? 'w-8 h-8 border-4 border-[#2e7d32]/70' : 'w-4 h-4 bg-[#2e7d32]/70'}`}
                  aria-hidden
                />
              )}

              {piece && (
                <span
                  style={{
                    textShadow:
                      piece.color === 'w'
                        ? '1.2px 1.2px 0 #333, -1.2px -1.2px 0 #333, 1.2px -1.2px 0 #333, -1.2px 1.2px 0 #333'
                        : '0.6px 0.6px 1.5px rgba(255,255,255,0.7)',
                  }}
                  className={piece.color === 'w' ? 'text-white drop-shadow-sm' : 'text-[#1f1f1f]'}
                >
                  {PIECE_SYMBOLS[`${piece.color}-${piece.type}`]}
                </span>
              )}
            </button>
          );
        });
      })}
    </div>
  );
}

export default Chessboard;
