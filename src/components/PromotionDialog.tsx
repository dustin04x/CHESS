'use client';

import React from 'react';
import type { Color, PromotionPiece } from '@/lib/chess-engine';

interface PromotionDialogProps {
  color: Color;
  isOpen: boolean;
  onSelect: (piece: PromotionPiece) => void;
  onCancel: () => void;
}

const PIECES: PromotionPiece[] = ['q', 'r', 'b', 'n'];

const LABELS: Record<PromotionPiece, string> = {
  q: 'Queen',
  r: 'Rook',
  b: 'Bishop',
  n: 'Knight',
};

const SYMBOLS: Record<string, string> = {
  'w-q': '\u2655',
  'w-r': '\u2656',
  'w-b': '\u2657',
  'w-n': '\u2658',
  'b-q': '\u265B',
  'b-r': '\u265C',
  'b-b': '\u265D',
  'b-n': '\u265E',
};

export function PromotionDialog({ color, isOpen, onSelect, onCancel }: PromotionDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-[#f7f2e8] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
        <h2 className="text-xl font-semibold text-[#2f2a24]">Choose Promotion</h2>
        <p className="mt-1 text-sm text-[#62584c]">Your pawn reached the last rank. Pick the piece to continue.</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {PIECES.map((piece) => (
            <button
              key={piece}
              type="button"
              onClick={() => onSelect(piece)}
              className="rounded-2xl border border-[#d5c4aa] bg-white px-4 py-5 text-left transition hover:border-[#9e7a4c] hover:bg-[#fff9ef]"
            >
              <div
                className={`text-4xl ${color === 'w' ? 'text-[#f7f4ed]' : 'text-[#2f2924]'}`}
                style={{
                  fontFamily: '"Times New Roman", serif',
                  textShadow:
                    color === 'w'
                      ? '0 1px 0 #756c61, 0 4px 8px rgba(0, 0, 0, 0.18)'
                      : '0 1px 0 rgba(255,255,255,0.2), 0 4px 8px rgba(0, 0, 0, 0.16)',
                }}
              >
                {SYMBOLS[`${color}-${piece}`]}
              </div>
              <div className="mt-2 text-sm font-medium text-[#2f2a24]">{LABELS[piece]}</div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="mt-4 w-full rounded-xl border border-[#d1c4b2] px-4 py-2 text-sm font-medium text-[#5f564b] transition hover:bg-[#efe8db]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default PromotionDialog;
