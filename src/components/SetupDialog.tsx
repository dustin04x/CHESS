'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import type { BotDifficulty } from '@/lib/bot-engine';

interface SetupDialogProps {
  onStart: (playerColor: 'w' | 'b', botDifficulty: BotDifficulty) => void;
  isOpen: boolean;
}

export function SetupDialog({ onStart, isOpen }: SetupDialogProps) {
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [difficulty, setDifficulty] = useState<BotDifficulty>('intermediate');

  const handleStart = () => {
    onStart(playerColor, difficulty);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Chess</h1>
        <p className="text-gray-600 mb-6">Play Against AI</p>

        <div className="space-y-6">
          {/* Player Color Selection */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Choose Your Color</h2>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPlayerColor('w')}
                className={`
                  flex-1 py-3 px-4 rounded-lg font-semibold transition-all
                  ${playerColor === 'w'
                    ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-400 text-gray-800'
                    : 'bg-gray-100 border-2 border-gray-300 text-gray-600 hover:border-gray-400'
                  }
                `}
              >
                ♙ White
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPlayerColor('b')}
                className={`
                  flex-1 py-3 px-4 rounded-lg font-semibold transition-all
                  ${playerColor === 'b'
                    ? 'bg-gradient-to-r from-gray-700 to-gray-800 border-2 border-gray-500 text-white'
                    : 'bg-gray-100 border-2 border-gray-300 text-gray-600 hover:border-gray-400'
                  }
                `}
              >
                ♟ Black
              </motion.button>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Bot Difficulty</h2>
            <div className="space-y-2">
              {(['beginner', 'intermediate', 'advanced', 'master'] as const).map((level) => (
                <motion.button
                  key={level}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDifficulty(level)}
                  className={`
                    w-full py-3 px-4 rounded-lg font-semibold transition-all text-left
                    ${difficulty === level
                      ? 'bg-blue-500 text-white border-2 border-blue-600'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  <span className="capitalize">{level}</span>
                  <span className="text-sm opacity-75 ml-2">
                    {level === 'beginner' && '(Makes mistakes often)'}
                    {level === 'intermediate' && '(Competitive player)'}
                    {level === 'advanced' && '(Strong player)'}
                    {level === 'master' && '(Expert level)'}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="
              w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600
              hover:from-green-600 hover:to-green-700 text-white font-bold text-lg
              rounded-lg flex items-center justify-center gap-2 transition-all
            "
          >
            <Play className="w-5 h-5" />
            Start Game
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default SetupDialog;
