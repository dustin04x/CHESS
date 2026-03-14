'use client';

import React, { useCallback, useMemo, useState } from 'react';
import BotEngine, { BOT_LEVELS } from '@/lib/bot-engine';
import type { BotDifficulty } from '@/lib/bot-engine';
import ChessEngine from '@/lib/chess-engine';
import type { GameState, Move, Piece, PromotionPiece, Square } from '@/lib/chess-engine';
import { Chessboard, GameControls, GameInfo, PromotionDialog, SetupDialog } from '@/components';

const DEFAULT_BOARD: (Piece | null)[][] = Array.from({ length: 8 }, () => Array<Piece | null>(8).fill(null));

interface PendingPromotion {
  from: Square;
  to: Square;
  color: 'w' | 'b';
}

const buildBoard = (engine: ChessEngine) =>
  Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 8 }, (_, col) => {
      const square = `${String.fromCharCode(97 + col)}${8 - row}` as Square;
      return engine.getPieceAt(square);
    }),
  );

const groupMoves = (history: Move[]) => {
  const pairs: Array<{ moveNumber: number; white: Move; black?: Move }> = [];

  for (let index = 0; index < history.length; index += 2) {
    pairs.push({
      moveNumber: index / 2 + 1,
      white: history[index],
      black: history[index + 1],
    });
  }

  return pairs;
};

export default function Home() {
  const [gameEngine, setGameEngine] = useState<ChessEngine | null>(null);
  const [botEngine, setBotEngine] = useState<BotEngine | null>(null);
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [showSetup, setShowSetup] = useState(true);
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('intermediate');

  const [board, setBoard] = useState<(Piece | null)[][]>(DEFAULT_BOARD);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'w' | 'b' | 'draw' | null>(null);
  const [botThinking, setBotThinking] = useState(false);

  const clearSelection = useCallback(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, []);

  const updateBoard = useCallback((engine: ChessEngine) => {
    setBoard(buildBoard(engine));

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

      window.setTimeout(() => {
        const move = bot.getBestMove(engine.getFen());

        if (move && engine.makeMove(move)) {
          setLastMove(move);
          updateBoard(engine);
        }

        setBotThinking(false);
      }, 250);
    },
    [updateBoard],
  );

  const finishPlayerMove = useCallback(
    (move: Move) => {
      if (!gameEngine || !botEngine) return;
      if (!gameEngine.makeMove(move)) return;

      setLastMove(move);
      setPendingPromotion(null);
      clearSelection();
      updateBoard(gameEngine);

      window.setTimeout(() => {
        const state = gameEngine.getGameState();
        if (!state.isCheckmate && !state.isStalemate && !state.isDraw) {
          makeBotMove(gameEngine, botEngine);
        }
      }, 250);
    },
    [botEngine, clearSelection, gameEngine, makeBotMove, updateBoard],
  );

  const initializeGame = useCallback(
    (pColor: 'w' | 'b', difficulty: BotDifficulty) => {
      const engine = new ChessEngine();
      const bot = new BotEngine(difficulty);

      setGameEngine(engine);
      setBotEngine(bot);
      setPlayerColor(pColor);
      setBotDifficulty(difficulty);
      setShowSetup(false);
      setBoard(buildBoard(engine));
      setLastMove(null);
      setPendingPromotion(null);
      setBotThinking(false);
      clearSelection();

      updateBoard(engine);

      if (pColor === 'b') {
        makeBotMove(engine, bot);
      }
    },
    [clearSelection, makeBotMove, updateBoard],
  );

  const handleSquareClick = useCallback(
    (square: Square) => {
      if (!gameEngine || !botEngine || !gameState || gameOver || botThinking || pendingPromotion) return;
      if (gameState.turnColor !== playerColor) return;

      if (!selectedSquare) {
        const moves = gameEngine.getLegalMovesFromSquare(square);
        if (moves.length > 0) {
          setSelectedSquare(square);
          setLegalMoves(moves);
        }
        return;
      }

      if (selectedSquare === square) {
        clearSelection();
        return;
      }

      if (!legalMoves.includes(square)) {
        const moves = gameEngine.getLegalMovesFromSquare(square);
        if (moves.length > 0) {
          setSelectedSquare(square);
          setLegalMoves(moves);
        } else {
          clearSelection();
        }
        return;
      }

      const matchingMoves = gameState.legalMoves.filter((move) => move.from === selectedSquare && move.to === square);
      const promotionMoves = matchingMoves.filter((move) => move.promotion);

      if (promotionMoves.length > 0) {
        setPendingPromotion({ from: selectedSquare, to: square, color: playerColor });
        return;
      }

      finishPlayerMove({ from: selectedSquare, to: square });
    },
    [
      botEngine,
      botThinking,
      clearSelection,
      finishPlayerMove,
      gameEngine,
      gameOver,
      gameState,
      legalMoves,
      pendingPromotion,
      playerColor,
      selectedSquare,
    ],
  );

  const handlePromotionSelect = useCallback(
    (promotion: PromotionPiece) => {
      if (!pendingPromotion) return;

      finishPlayerMove({
        from: pendingPromotion.from,
        to: pendingPromotion.to,
        promotion,
      });
    },
    [finishPlayerMove, pendingPromotion],
  );

  const handleUndo = useCallback(() => {
    if (!gameEngine || !gameState || gameState.history.length === 0 || botThinking) return;

    gameEngine.undoMove();
    if (gameState.history.length > 1) {
      gameEngine.undoMove();
    }

    setLastMove(null);
    setPendingPromotion(null);
    clearSelection();
    updateBoard(gameEngine);
  }, [botThinking, clearSelection, gameEngine, gameState, updateBoard]);

  const handleResign = useCallback(() => {
    setGameOver(true);
    setWinner(playerColor === 'w' ? 'b' : 'w');
    setPendingPromotion(null);
  }, [playerColor]);

  const handleRestart = useCallback(() => {
    setPendingPromotion(null);
    setShowSetup(true);
  }, []);

  const capturedPieces = gameEngine ? gameEngine.getCapturedPieces() : { white: [], black: [] };

  const checkSquare = useMemo(() => {
    if (!gameEngine || !gameState?.isCheck) return null;
    return gameEngine.getKingSquare(gameState.turnColor);
  }, [gameEngine, gameState]);

  const movePairs = useMemo(() => groupMoves(gameState?.history ?? []), [gameState?.history]);
  const pgnText = gameEngine ? gameEngine.getPgn() : '';

  const handleCopyPgn = useCallback(async () => {
    if (!pgnText) return;

    try {
      await navigator.clipboard.writeText(pgnText);
    } catch {
      // Ignore clipboard errors in unsupported environments.
    }
  }, [pgnText]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#5a5147_0%,#312e2b_30%,#1f1c19_100%)] px-4 py-6 text-white">
      <SetupDialog isOpen={showSetup} onStart={initializeGame} />

      <PromotionDialog
        isOpen={pendingPromotion !== null}
        color={pendingPromotion?.color ?? playerColor}
        onSelect={handlePromotionSelect}
        onCancel={() => setPendingPromotion(null)}
      />

      {!showSetup && gameEngine && gameState && (
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-6 flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#f5f1e8]">Chess</h1>
            <p className="max-w-2xl text-sm text-[#d9d1c5]">
              Full rules are enabled through the engine, including castling, en passant, checkmate detection, and pawn promotion.
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-[#bfb2a0]">
              Level: {BOT_LEVELS[botDifficulty].label}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.7fr)_minmax(280px,0.8fr)] xl:items-start">
            <div className="flex justify-center xl:justify-start">
              <Chessboard
                board={board}
                onSquareClick={handleSquareClick}
                selectedSquare={selectedSquare}
                legalMoves={legalMoves}
                lastMove={lastMove}
                isCheck={gameState.isCheck}
                checkSquare={checkSquare}
                disabled={gameOver || botThinking || gameState.turnColor !== playerColor || pendingPromotion !== null}
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
                <div className="rounded-3xl border border-white/10 bg-[#2c2925] p-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
                  {winner === 'draw' && <p className="text-lg font-bold text-amber-300">Draw</p>}
                  {winner === 'w' && <p className="text-lg font-bold text-emerald-300">{playerColor === 'w' ? 'You won' : 'Bot won'}</p>}
                  {winner === 'b' && <p className="text-lg font-bold text-emerald-300">{playerColor === 'b' ? 'You won' : 'Bot won'}</p>}
                </div>
              )}
            </div>

            <aside className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(33,30,27,0.95),rgba(24,22,20,0.98))] p-5 text-white shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Move History</h2>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#bfb2a0]">SAN notation</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPgn}
                  disabled={!pgnText}
                  className="rounded-xl bg-[#4b443d] px-3 py-2 text-xs font-semibold transition hover:bg-[#5a5249] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Copy PGN
                </button>
              </div>

              {botThinking && <p className="mt-3 text-sm text-amber-300">Bot is calculating...</p>}

              <div className="mt-4 max-h-[480px] overflow-auto rounded-2xl bg-black/10 p-2">
                {movePairs.length === 0 ? (
                  <p className="px-2 py-3 text-sm text-stone-300">No moves yet.</p>
                ) : (
                  <ol className="space-y-1 text-sm">
                    {movePairs.map((pair) => (
                      <li
                        key={pair.moveNumber}
                        className="grid grid-cols-[44px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 rounded-xl px-2 py-2 font-mono hover:bg-white/5"
                      >
                        <span className="text-stone-400">{pair.moveNumber}.</span>
                        <span>{pair.white.san ?? gameEngine.getMoveNotation(pair.white)}</span>
                        <span className="text-stone-200">{pair.black ? pair.black.san ?? gameEngine.getMoveNotation(pair.black) : ''}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </aside>
          </div>
        </div>
      )}
    </main>
  );
}
