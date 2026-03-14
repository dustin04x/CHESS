'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { BOT_LEVELS } from '@/lib/bot-engine';
import type { BotDifficulty } from '@/lib/bot-engine';

interface SetupDialogProps {
  onStart: (playerColor: 'w' | 'b', botDifficulty: BotDifficulty) => void;
  isOpen: boolean;
}

const COLOR_OPTIONS = [
  { value: 'w' as const, label: 'White', symbol: '\u2659', classes: 'bg-[#f8f0dd] text-[#3b3128] border-[#d8b46a]' },
  { value: 'b' as const, label: 'Black', symbol: '\u265F', classes: 'bg-[#312b28] text-white border-[#5e544a]' },
];

const DIFFICULTIES: BotDifficulty[] = ['beginner', 'intermediate', 'advanced', 'master'];

export function SetupDialog({ onStart, isOpen }: SetupDialogProps) {
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [difficulty, setDifficulty] = useState<BotDifficulty>('intermediate');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="w-full max-w-md rounded-[32px] bg-[linear-gradient(180deg,#f7f0e1,#efe2cc)] p-8 shadow-[0_32px_80px_rgba(0,0,0,0.35)]"
      >
        <h1 className="text-3xl font-bold text-[#2d261f]">Play Chess</h1>
        <p className="mt-2 text-sm text-[#6a5f54]">Pick a side and difficulty, then start a full game against the engine.</p>

        <div className="mt-6 space-y-6">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-[#2d261f]">Choose Your Color</h2>
            <div className="grid grid-cols-2 gap-3">
              {COLOR_OPTIONS.map((option) => {
                const isActive = playerColor === option.value;
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPlayerColor(option.value)}
                    className={[
                      'rounded-2xl border-2 px-4 py-4 text-left transition',
                      option.classes,
                      isActive ? 'ring-2 ring-[#6c9c3c] ring-offset-2 ring-offset-transparent' : 'opacity-80 hover:opacity-100',
                    ].join(' ')}
                  >
                    <div className="text-3xl" style={{ fontFamily: '"Times New Roman", serif' }}>
                      {option.symbol}
                    </div>
                    <div className="mt-2 font-semibold">{option.label}</div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-[#2d261f]">Bot Difficulty</h2>
            <div className="space-y-2">
              {DIFFICULTIES.map((level) => (
                <motion.button
                  key={level}
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setDifficulty(level)}
                  className={[
                    'w-full rounded-2xl border px-4 py-3 text-left transition',
                    difficulty === level
                      ? 'border-[#7ca648] bg-[#7ca648] text-white'
                      : 'border-[#d5c5ac] bg-white/70 text-[#4d4339] hover:bg-white',
                  ].join(' ')}
                >
                  <div className="font-semibold">{BOT_LEVELS[level].label}</div>
                  <div className={`mt-1 text-sm ${difficulty === level ? 'text-white/85' : 'text-[#6e6255]'}`}>
                    {BOT_LEVELS[level].description}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStart(playerColor, difficulty)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(180deg,#7bb048,#6b993d)] px-6 py-4 text-lg font-bold text-white shadow-[0_14px_30px_rgba(107,153,61,0.35)]"
          >
            <Play className="h-5 w-5" />
            Start Game
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default SetupDialog;
