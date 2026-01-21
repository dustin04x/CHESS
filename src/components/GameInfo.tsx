'use client';

import React from 'react';
import { Clock, Crown, AlertCircle } from 'lucide-react';

interface GameInfoProps {
  turn: 'w' | 'b';
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  whiteCaptures: string[];
  blackCaptures: string[];
  playerColor: 'w' | 'b';
}

export function GameInfo({
  turn,
  isCheck,
  isCheckmate,
  isStalemate,
  isDraw,
  whiteCaptures,
  blackCaptures,
  playerColor,
}: GameInfoProps) {
  const isPlayerTurn = turn === playerColor;
  const opponentColor = playerColor === 'w' ? 'b' : 'w';

  const getPieceSymbol = (type: string, color: 'w' | 'b'): string => {
    const symbols: { [key: string]: string } = {
      'w-p': '♙',
      'w-n': '♘',
      'w-b': '♗',
      'w-r': '♖',
      'w-q': '♕',
      'b-p': '♟',
      'b-n': '♞',
      'b-b': '♝',
      'b-r': '♜',
      'b-q': '♛',
    };
    return symbols[`${color}-${type}`] || '';
  };

  return (
    <div className="space-y-4 w-full max-w-sm">
      {/* Status */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5" />
          <span className="font-semibold">Game Status</span>
        </div>

        {isCheckmate && (
          <div className="text-green-400 font-bold mb-2">♔ Checkmate!</div>
        )}

        {isStalemate && (
          <div className="text-yellow-400 font-bold mb-2">Stalemate - Draw</div>
        )}

        {isDraw && (
          <div className="text-yellow-400 font-bold mb-2">Draw</div>
        )}

        {isCheck && !isCheckmate && (
          <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
            <AlertCircle className="w-4 h-4" />
            Check!
          </div>
        )}

        <div className={`text-sm ${isPlayerTurn ? 'text-green-300' : 'text-gray-300'}`}>
          {isPlayerTurn ? '👤 Your turn' : '🤖 Opponent thinking...'}
        </div>
      </div>

      {/* Captured pieces - Black */}
      {blackCaptures.length > 0 && (
        <div className="bg-slate-100 rounded-lg p-3">
          <div className="text-xs font-semibold text-gray-600 mb-2">Opponent Captured</div>
          <div className="flex flex-wrap gap-2">
            {blackCaptures.map((piece, idx) => (
              <div key={idx} className="text-2xl">
                {getPieceSymbol(piece, 'w')}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Captured pieces - White */}
      {whiteCaptures.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="text-xs font-semibold text-gray-300 mb-2">You Captured</div>
          <div className="flex flex-wrap gap-2">
            {whiteCaptures.map((piece, idx) => (
              <div key={idx} className="text-2xl text-white drop-shadow-lg">
                {getPieceSymbol(piece, 'b')}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GameInfo;
