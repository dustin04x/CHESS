'use client';

import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';

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

const PIECE_SYMBOLS: Record<string, string> = {
  'w-p': '\u2659',
  'w-n': '\u2658',
  'w-b': '\u2657',
  'w-r': '\u2656',
  'w-q': '\u2655',
  'b-p': '\u265F',
  'b-n': '\u265E',
  'b-b': '\u265D',
  'b-r': '\u265C',
  'b-q': '\u265B',
};

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

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(49,44,40,0.95),rgba(33,30,27,0.98))] p-5 text-white shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span className="font-semibold">Game Status</span>
        </div>

        {isCheckmate && <div className="mb-2 font-bold text-emerald-300">Checkmate</div>}
        {isStalemate && <div className="mb-2 font-bold text-amber-300">Stalemate</div>}
        {isDraw && <div className="mb-2 font-bold text-amber-300">Draw</div>}

        {isCheck && !isCheckmate && (
          <div className="mb-2 flex items-center gap-2 font-bold text-red-400">
            <AlertCircle className="h-4 w-4" />
            Check
          </div>
        )}

        <div className={`text-sm ${isPlayerTurn ? 'text-emerald-300' : 'text-stone-300'}`}>
          {isPlayerTurn ? 'Your move' : 'Bot to move'}
        </div>
      </div>

      {blackCaptures.length > 0 && (
        <div className="rounded-2xl bg-[#f4ecdf] p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#7f6b52]">Opponent Captured</div>
          <div className="flex flex-wrap gap-2">
            {blackCaptures.map((piece, index) => (
              <div key={`${piece}-${index}`} className="text-2xl text-[#2f2924]">
                {PIECE_SYMBOLS[`w-${piece}`]}
              </div>
            ))}
          </div>
        </div>
      )}

      {whiteCaptures.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#2c2925] p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#c5b9a4]">You Captured</div>
          <div className="flex flex-wrap gap-2">
            {whiteCaptures.map((piece, index) => (
              <div key={`${piece}-${index}`} className="text-2xl text-[#f8f5ee]">
                {PIECE_SYMBOLS[`b-${piece}`]}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GameInfo;
