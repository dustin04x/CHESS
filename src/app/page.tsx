'use client';

import React, { useCallback, useMemo, useState } from 'react';
import ChessEngine from '@/lib/chess-engine';
import type { GameState, Move, Piece, Square } from '@/lib/chess-engine';
import BotEngine from '@/lib/bot-engine';
import type { BotDifficulty } from '@/lib/bot-engine';
import { Chessboard, GameControls, GameInfo, SetupDialog } from '@/components';

const DEFAULT_BOARD: (Piece | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));

const formatMove = (move: Move) => `${move.from}-${move.to}${move.promotion ? `=${move.promotion.toUpperCase()}` : ''}`;

export default function Home() {
  const [gameEngine, setGameEngine] = useState<ChessEngine | null>(null);
  const [botEngine, setBotEngine] = useState<BotEngine | null>(null);
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [showSetup, setShowSetup] = useState(true);

  const [board, setBoard] = useState<(Piece | null)[][]>(DEFAULT_BOARD);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'w' | 'b' | 'draw' | null>(null);
  const [botThinking, setBotThinking] = useState(false);
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);

  const updateBoard = useCallback((engine: ChessEngine) => {
    const boardArray: (Piece | null)[][] = [];

    for (let row = 0; row < 8; row++) {
      const boardRow: (Piece | null)[] = [];
      for (let col = 0; col < 8; col++) {
        const square = `${String.fromCharCode(97 + col)}${8 - row}` as Square;
        boardRow.push(engine.getPieceAt(square));
      }
      boardArray.push(boardRow);
    }

    setBoard(boardArray);

    const state = engine.getGameState();
    setGameState(state);

    if (state.isCheckmate) {
      setGameOver(true);
      setWinner(state.turnColor === 'w' ? 'b' : 'w');
      return;
    }

    if (state.isStalemate || state.isDraw) {
      setGameOver(true);
      setWinner('draw');
      return;
    }

    setGameOver(false);
    setWinner(null);
  }, []);

  const makeBotMove = useCallback(
    (engine: ChessEngine, bot: BotEngine) => {
      setBotThinking(true);

      setTimeout(() => {
        const move = bot.getBestMove(engine.getFen());
        if (move) {
          engine.makeMove(move);
          setLastMove(move);
          updateBoard(engine);
        }

        setBotThinking(false);
      }, 250);
    },
    [updateBoard],
  );

  const initializeGame = useCallback(
    (pColor: 'w' | 'b', difficulty: BotDifficulty) => {
      const engine = new ChessEngine();
      const bot = new BotEngine(difficulty);

      setGameEngine(engine);
      setBotEngine(bot);
      setPlayerColor(pColor);
      setShowSetup(false);
      setSelectedSquare(null);
      setLegalMoves([]);
      setLastMove(null);
      setBotThinking(false);

      updateBoard(engine);

      if (pColor === 'b') {
        makeBotMove(engine, bot);
      }
    },
    [makeBotMove, updateBoard],
  );

  const handleSquareClick = useCallback(
    (square: Square) => {
      if (!gameEngine || !botEngine || !gameState || gameOver || botThinking) return;
      if (gameState.turnColor !== playerColor) return;

      if (selectedSquare === null) {
        const moves = gameEngine.getLegalMovesFromSquare(square);
        if (moves.length > 0) {
          setSelectedSquare(square);
          setLegalMoves(moves);
        }
        return;
      }

      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      if (!legalMoves.includes(square)) {
        const moves = gameEngine.getLegalMovesFromSquare(square);
        if (moves.length > 0) {
          setSelectedSquare(square);
          setLegalMoves(moves);
        }
        return;
      }

      const move: Move = { from: selectedSquare, to: square };
      if (gameEngine.makeMove(move)) {
        setLastMove(move);
        setSelectedSquare(null);
        setLegalMoves([]);
        updateBoard(gameEngine);

        setTimeout(() => {
          const state = gameEngine.getGameState();
          if (!state.isCheckmate && !state.isStalemate && !state.isDraw) {
            makeBotMove(gameEngine, botEngine);
          }
        }, 250);
      }
    },
    [botEngine, botThinking, gameEngine, gameOver, gameState, legalMoves, makeBotMove, playerColor, selectedSquare, updateBoard],
  );

  const handleUndo = useCallback(() => {
    if (!gameEngine || !gameState || gameState.history.length === 0 || botThinking) return;

    gameEngine.undoMove();
    if (gameState.history.length > 1) {
      gameEngine.undoMove();
    }

    setLastMove(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    updateBoard(gameEngine);
  }, [botThinking, gameEngine, gameState, updateBoard]);

  const handleResign = useCallback(() => {
    setGameOver(true);
    setWinner(playerColor === 'w' ? 'b' : 'w');
  }, [playerColor]);

  const handleRestart = useCallback(() => {
    setShowSetup(true);
  }, []);

  const capturedPieces = gameEngine ? gameEngine.getCapturedPieces() : { white: [], black: [] };

  const checkSquare = useMemo(() => {
    if (!gameEngine || !gameState?.isCheck) return null;
    return gameEngine.getKingSquare(gameState.turnColor);
  }, [gameEngine, gameState]);

  const pgnText = gameEngine ? gameEngine.getPgn() : '';

  const handleCopyPgn = useCallback(async () => {
    if (!pgnText) return;
    await navigator.clipboard.writeText(pgnText);
  }, [pgnText]);

  return (
    <main className="min-h-screen bg-[#312e2b] flex items-center justify-center p-4">
      <SetupDialog isOpen={showSetup} onStart={initializeGame} />

      {!showSetup && gameEngine && gameState && (
        <div className="w-full max-w-7xl">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
            <div className="xl:col-span-2 flex justify-center">
              <Chessboard
                board={board}
                onSquareClick={handleSquareClick}
                selectedSquare={selectedSquare}
                legalMoves={legalMoves}
                lastMove={lastMove}
                isCheck={gameState.isCheck}
                checkSquare={checkSquare}
                disabled={gameOver || botThinking || gameState.turnColor !== playerColor}
                perspective={playerColor === 'w' ? 'white' : 'black'}
              />
            </div>

            <div className="flex flex-col gap-5">
              <GameInfo
                turn={gameState.turnColor}
                isCheck={gameState.isCheck}
                isCheckmate={gameState.isCheckmate}
                isStalemate={gameState.isStalemate}
                isDraw={gameState.isDraw}
                whiteCaptures={capturedPieces.white}
                blackCaptures={capturedPieces.black}
                playerColor={playerColor}
              />

              <GameControls
                onRestart={handleRestart}
                onUndo={handleUndo}
                onResign={handleResign}
                canUndo={gameState.history.length >= 2 && !botThinking}
                gameOver={gameOver}
              />

              {gameOver && (
                <div className="bg-slate-700 rounded-lg p-4 text-white text-center">
                  {winner === 'draw' && <p className="text-lg font-bold">Draw!</p>}
                  {winner === 'w' && <p className="text-lg font-bold">{playerColor === 'w' ? '🎉 You won!' : 'Bot won!'}</p>}
                  {winner === 'b' && <p className="text-lg font-bold">{playerColor === 'b' ? '🎉 You won!' : 'Bot won!'}</p>}
                </div>
              )}
            </div>

            <aside className="bg-slate-800/80 rounded-lg p-4 text-white space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Move History</h2>
                <button
                  type="button"
                  onClick={handleCopyPgn}
                  disabled={!pgnText}
                  className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Copy PGN
                </button>
              </div>

              {botThinking && (
                <p className="text-amber-300 text-sm animate-pulse">🤖 Bot is calculating the best move...</p>
              )}

              <ol className="max-h-[420px] overflow-auto text-sm space-y-1 pr-1">
                {gameState.history.length === 0 && <li className="text-slate-300">No moves yet.</li>}
                {gameState.history.map((move, index) => (
                  <li key={`${move.from}-${move.to}-${index}`} className="font-mono">
                    <span className="text-slate-300 mr-2">{index + 1}.</span>
                    {formatMove(move)}
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </div>
      )}
    </main>
  );
}
