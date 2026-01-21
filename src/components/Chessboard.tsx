'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Move, Square } from '@/lib/chess-engine';

interface ChessPiece {
  type: string;
  color: 'w' | 'b';
}

interface ChessboardProps {
  board: any[][];
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
    if (perspective === 'black') {
      return { rank: row + 1, file: String.fromCharCode(104 - col) };
    }
    return { rank: 8 - row, file: String.fromCharCode(97 + col) };
  };

  const getSquareLabel = (row: number, col: number): Square => {
    const { rank, file } = getSquareCoords(row, col);
    return `${file}${rank}` as Square;
  };

  const getSquareColor = (row: number, col: number): boolean => {
    const file = (perspective === 'black' ? 7 - col : col) % 2;
    const rank = row % 2;
    return (file + rank) % 2 === 1;
  };

  const getSquareClass = (isLight: boolean): string => {
    return isLight 
      ? 'bg-yellow-100 hover:bg-yellow-150' 
      : 'bg-yellow-800 hover:bg-yellow-900';
  };

  const isLastMoveSquare = (square: Square): boolean => {
    if (!lastMove) return false;
    return square === lastMove.from || square === lastMove.to;
  };

  const renderSquares = () => {
    const squares = [];
    const boardOrder = perspective === 'black' ? [...board].reverse() : board;

    for (let row = 0; row < 8; row++) {
      const rowOrder = perspective === 'black' ? boardOrder[row].slice().reverse() : boardOrder[row];

      for (let col = 0; col < 8; col++) {
        const piece = rowOrder[col];
        const square = getSquareLabel(perspective === 'black' ? 7 - row : row, perspective === 'black' ? 7 - col : col);
        const isLight = getSquareColor(perspective === 'black' ? 7 - row : row, perspective === 'black' ? 7 - col : col);
        const isSelected = square === selectedSquare;
        const isLegal = legalMoves.includes(square);
        const isLastMove = isLastMoveSquare(square);
        const isCheckSquare = isCheck && checkSquare === square;
        const squareClass = getSquareClass(isLight);

        squares.push(
          <motion.div
            key={square}
            onClick={() => !disabled && onSquareClick(square)}
            className={`
              w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-5xl md:text-6xl
              cursor-pointer transition-colors relative font-bold
              ${squareClass}
              ${isSelected ? 'ring-4 ring-yellow-400 ring-inset' : ''}
              ${isLastMove ? (isLight ? 'bg-yellow-200' : 'bg-yellow-600') : ''}
              ${isCheckSquare ? 'ring-4 ring-red-500 ring-inset' : ''}
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Legal move indicator */}
            {isLegal && (
              <div className={`absolute w-3 h-3 rounded-full ${piece ? 'ring-2 ring-green-500' : 'bg-green-500 opacity-70'}`} />
            )}

            {/* Piece */}
            {piece && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                style={{
                  textShadow: piece.color === 'w' 
                    ? '1.5px 1.5px 0 #333, -1.5px -1.5px 0 #333, 1.5px -1.5px 0 #333, -1.5px 1.5px 0 #333, 0 1.5px 0 #333, 0 -1.5px 0 #333, 1.5px 0 0 #333, -1.5px 0 0 #333'
                    : '1px 1px 2px rgba(255,255,255,0.8)'
                }}
                className={piece.color === 'w' 
                  ? 'text-white drop-shadow-lg' 
                  : 'text-yellow-950 drop-shadow-md'}
              >
                {PIECE_SYMBOLS[`${piece.color}-${piece.type}`]}
              </motion.div>
            )}
          </motion.div>,
        );
      }
    }

    return squares;
  };

  return (
    <div className="inline-grid grid-cols-8 gap-0 bg-gray-800 p-2 rounded-lg shadow-2xl border-8 border-yellow-900">
      {renderSquares()}
    </div>
  );
};

export default Chessboard;
