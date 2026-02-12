'use client';

import React, { useCallback, useMemo, useState } from 'react';
import ChessEngine from '@/lib/chess-engine';
import type { GameState, Move, Piece, Square } from '@/lib/chess-engine';
import BotEngine from '@/lib/bot-engine';
import type { BotDifficulty } from '@/lib/bot-engine';
import { Chessboard, GameControls, GameInfo, SetupDialog } from '@/components';

const DEFAULT_BOARD: (Piece | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));

const formatMove = (move: Move) => `${move.from}-${move.to}${move.promotion ? `=${move.promotion.toUpperCase()}` : ''}`;

interface PendingPromotion {
  from: Square;
  to: Square;
  color: 'w' | 'b';
}

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
      }, 200);
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
      setPendingPromotion(null);

      updateBoard(engine);

      if (pColor === 'b') {
        makeBotMove(engine, bot);
      }
    },
    [makeBotMove, updateBoard],
  );

  const maybeRequestPromotion = useCallback(
    (from: Square, to: Square): boolean => {
      if (!gameEngine) return false;
      const movingPiece = gameEngine.getPieceAt(from);
      if (!movingPiece || movingPiece.type !== 'p') return false;

      const targetRank = Number(to[1]);
      const reachesLastRank = (movingPiece.color === 'w' && targetRank === 8) || (movingPiece.color === 'b' && targetRank === 1);

      if (!reachesLastRank) return false;

      setPendingPromotion({ from, to, color: movingPiece.color });
      return true;
    },
    [gameEngine],
  );

  const scheduleBotTurn = useCallback(
    (engine: ChessEngine, bot: BotEngine) => {
      setTimeout(() => {
        const state = engine.getGameState();
        if (!state.isCheckmate && !state.isStalemate && !state.isDraw) {
          makeBotMove(engine, bot);
        }
      }, 180);
    },
    [makeBotMove],
  );

  const applyPlayerMove = useCallback(
    (move: Move) => {
      if (!gameEngine || !botEngine) return;

      if (gameEngine.makeMove(move)) {
        setLastMove(move);
        setSelectedSquare(null);
        setLegalMoves([]);
        setPendingPromotion(null);
        updateBoard(gameEngine);
        scheduleBotTurn(gameEngine, botEngine);
      }
    },
    [botEngine, gameEngine, scheduleBotTurn, updateBoard],
  );

  const handleSquareClick = useCallback(
    (square: Square) => {
      if (!gameEngine || !botEngine || !gameState || gameOver || botThinking || pendingPromotion) return;
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

      if (maybeRequestPromotion(selectedSquare, square)) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      applyPlayerMove({ from: selectedSquare, to: square });
    },
    [applyPlayerMove, botEngine, botThinking, gameEngine, gameOver, gameState, legalMoves, maybeRequestPromotion, pendingPromotion, playerColor, selectedSquare],
  );

  const handlePromotionChoice = useCallback(
    (promotion: 'q' | 'r' | 'b' | 'n') => {
      if (!pendingPromotion) return;
      applyPlayerMove({ from: pendingPromotion.from, to: pendingPromotion.to, promotion });
    },
    [applyPlayerMove, pendingPromotion],
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
    setPendingPromotion(null);
    updateBoard(gameEngine);
  }, [botThinking, gameEngine, gameState, updateBoard]);

  const handleResign = useCallback(() => {
    setGameOver(true);
    setWinner(playerColor === 'w' ? 'b' : 'w');
  }, [playerColor]);

  const handleRestart = useCallback(() => {
    setShowSetup(true);
    setPendingPromotion(null);
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

  const promotionOptions: Array<'q' | 'r' | 'b' | 'n'> = ['q', 'r', 'b', 'n'];
  const pieceLabels: Record<'q' | 'r' | 'b' | 'n', string> = { q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight' };
  const pieceSymbols: Record<'q' | 'r' | 'b' | 'n', { w: string; b: string }> = {
    q: { w: '♕', b: '♛' },
    r: { w: '♖', b: '♜' },
    b: { w: '♗', b: '♝' },
    n: { w: '♘', b: '♞' },
  };

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
                disabled={gameOver || botThinking || gameState.turnColor !== playerColor || Boolean(pendingPromotion)}
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

              {botThinking && <p className="text-amber-300 text-sm">🤖 Bot is calculating the best move...</p>}

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

      {pendingPromotion && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-xl p-4 w-[320px]">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Choose promotion piece</h3>
            <div className="grid grid-cols-4 gap-2">
              {promotionOptions.map(piece => (
                <button
                  key={piece}
                  type="button"
                  onClick={() => handlePromotionChoice(piece)}
                  className="h-16 rounded border border-gray-300 hover:bg-gray-100 text-4xl"
                  aria-label={pieceLabels[piece]}
                >
                  {pieceSymbols[piece][pendingPromotion.color]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
