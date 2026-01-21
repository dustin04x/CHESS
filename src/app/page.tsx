'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ChessEngine from '@/lib/chess-engine';
import BotEngine from '@/lib/bot-engine';
import { Chessboard, GameInfo, GameControls, SetupDialog } from '@/components';
import type { Move, Square } from '@/lib/chess-engine';
import type { BotDifficulty } from '@/lib/bot-engine';

export default function Home() {
  // Game state
  const [gameEngine, setGameEngine] = useState<ChessEngine | null>(null);
  const [botEngine, setBotEngine] = useState<BotEngine | null>(null);
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('intermediate');
  const [showSetup, setShowSetup] = useState(true);

  // Board state
  const [board, setBoard] = useState<(any[] | null)[][]>([]);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);

  // Game status
  const [gameState, setGameState] = useState<any>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'w' | 'b' | 'draw' | null>(null);
  const [botThinking, setBotThinking] = useState(false);

  // Initialize game
  const initializeGame = useCallback((pColor: 'w' | 'b', difficulty: BotDifficulty) => {
    const engine = new ChessEngine();
    const bot = new BotEngine(difficulty);

    setGameEngine(engine);
    setBotEngine(bot);
    setPlayerColor(pColor);
    setBotDifficulty(difficulty);
    setShowSetup(false);
    setGameOver(false);
    setWinner(null);
    setSelectedSquare(null);
    setLastMove(null);

    updateBoard(engine);
  }, []);

  // Update board display
  const updateBoard = useCallback((engine: ChessEngine) => {
    const boardArray: any[][] = [];

    for (let row = 0; row < 8; row++) {
      const boardRow: any[] = [];
      for (let col = 0; col < 8; col++) {
        const square = String.fromCharCode(97 + col) + (8 - row);
        const piece = engine.getPieceAt(square as Square);
        boardRow.push(piece);
      }
      boardArray.push(boardRow);
    }

    setBoard(boardArray);

    const state = engine.getGameState();
    setGameState(state);

    // Check game over conditions
    if (state.isCheckmate) {
      setGameOver(true);
      setWinner(state.turnColor === 'w' ? 'b' : 'w');
    } else if (state.isStalemate || state.isDraw) {
      setGameOver(true);
      setWinner('draw');
    }
  }, []);

  // Handle player move
  const handleSquareClick = useCallback(
    async (square: Square) => {
      if (!gameEngine || !botEngine || gameOver || botThinking) return;
      if (gameState?.turnColor !== playerColor) return;

      if (selectedSquare === null) {
        // Select piece
        const moves = gameEngine.getLegalMovesFromSquare(square);
        if (moves.length > 0) {
          setSelectedSquare(square);
          setLegalMoves(moves);
        }
      } else if (selectedSquare === square) {
        // Deselect
        setSelectedSquare(null);
        setLegalMoves([]);
      } else if (legalMoves.includes(square)) {
        // Make move
        const move: Move = { from: selectedSquare, to: square };
        if (gameEngine.makeMove(move)) {
          setLastMove(move);
          setSelectedSquare(null);
          setLegalMoves([]);
          updateBoard(gameEngine);

          // Bot's turn
          setTimeout(() => {
            const gameState = gameEngine.getGameState();
            if (!gameState.isCheckmate && !gameState.isStalemate && !gameState.isDraw) {
              makeBotMove(gameEngine, botEngine);
            }
          }, 300);
        }
      }
    },
    [gameEngine, botEngine, selectedSquare, legalMoves, playerColor, gameState, gameOver, botThinking, updateBoard],
  );

  // Bot makes a move
  const makeBotMove = useCallback(
    (engine: ChessEngine, bot: BotEngine) => {
      setBotThinking(true);

      setTimeout(() => {
        const fen = engine.getFen();
        const move = bot.getBestMove(fen);

        if (move) {
          engine.makeMove(move);
          setLastMove(move);
          updateBoard(engine);
        }

        setBotThinking(false);
      }, 300);
    },
    [updateBoard],
  );

  // Handle undo
  const handleUndo = useCallback(() => {
    if (!gameEngine || gameState?.history.length === 0) return;

    gameEngine.undoMove();
    if (gameState?.history.length > 1) {
      gameEngine.undoMove();
    }

    setLastMove(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setGameOver(false);
    setWinner(null);
    updateBoard(gameEngine);
  }, [gameEngine, gameState?.history.length, updateBoard]);

  // Handle resign
  const handleResign = useCallback(() => {
    setGameOver(true);
    setWinner(playerColor === 'w' ? 'b' : 'w');
  }, [playerColor]);

  // Handle restart
  const handleRestart = () => {
    setShowSetup(true);
  };

  // Get captured pieces
  const getCapturedPieces = useCallback(() => {
    if (!gameEngine) return { white: [], black: [] };

    const captured = gameEngine.getCapturedPieces();
    return {
      white: captured.white,
      black: captured.black,
    };
  }, [gameEngine]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <SetupDialog isOpen={showSetup} onStart={initializeGame} />

      {!showSetup && gameEngine && gameState && (
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Chessboard */}
            <div className="lg:col-span-2 flex justify-center">
              <Chessboard
                board={board}
                onSquareClick={handleSquareClick}
                selectedSquare={selectedSquare}
                legalMoves={legalMoves}
                lastMove={lastMove}
                isCheck={gameState.isCheck}
                checkSquare={gameState.isCheck ? gameState.turnColor === 'w' ? gameState.turnColor : null : null}
                disabled={gameOver || botThinking || gameState.turnColor !== playerColor}
                perspective={playerColor === 'w' ? 'white' : 'black'}
              />
            </div>

            {/* Game Info & Controls */}
            <div className="flex flex-col gap-6">
              <GameInfo
                turn={gameState.turnColor}
                isCheck={gameState.isCheck}
                isCheckmate={gameState.isCheckmate}
                isStalemate={gameState.isStalemate}
                isDraw={gameState.isDraw}
                whiteCaptures={getCapturedPieces().white}
                blackCaptures={getCapturedPieces().black}
                playerColor={playerColor}
              />

              <GameControls
                onRestart={handleRestart}
                onUndo={handleUndo}
                onResign={handleResign}
                canUndo={gameState.history.length >= 2}
                gameOver={gameOver}
              />

              {/* Game Over Message */}
              {gameOver && (
                <div className="bg-slate-700 rounded-lg p-4 text-white text-center">
                  {winner === 'draw' && <p className="text-lg font-bold">Draw!</p>}
                  {winner === 'w' && (
                    <p className="text-lg font-bold">{playerColor === 'w' ? '🎉 You won!' : 'Bot won!'}</p>
                  )}
                  {winner === 'b' && (
                    <p className="text-lg font-bold">{playerColor === 'b' ? '🎉 You won!' : 'Bot won!'}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

