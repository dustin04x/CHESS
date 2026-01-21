'use client';

import React from 'react';
import { RotateCcw, Undo2, Flag } from 'lucide-react';
import { motion } from 'framer-motion';

interface GameControlsProps {
  onRestart: () => void;
  onUndo: () => void;
  onResign: () => void;
  canUndo: boolean;
  gameOver: boolean;
}

export function GameControls({
  onRestart,
  onUndo,
  onResign,
  canUndo,
  gameOver,
}: GameControlsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onUndo}
        disabled={!canUndo}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all
          ${canUndo
            ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
            : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
          }
        `}
      >
        <Undo2 className="w-4 h-4" />
        Undo
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onResign}
        disabled={gameOver}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all
          ${!gameOver
            ? 'bg-red-500 hover:bg-red-600 text-white cursor-pointer'
            : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
          }
        `}
      >
        <Flag className="w-4 h-4" />
        Resign
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRestart}
        className="
          flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 
          text-white rounded-lg font-semibold transition-all cursor-pointer
        "
      >
        <RotateCcw className="w-4 h-4" />
        New Game
      </motion.button>
    </div>
  );
}

export default GameControls;
