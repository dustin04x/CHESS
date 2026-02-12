import { Chess } from 'chess.js';
import type { Square as ChessSquare } from 'chess.js';
import type { Move } from './chess-engine';

export type BotDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'master';

const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
const CHECKMATE_SCORE = 100000;

const CENTER_BONUS: Record<string, number> = {
  d4: 20,
  e4: 20,
  d5: 20,
  e5: 20,
  c3: 10,
  d3: 10,
  e3: 10,
  f3: 10,
  c4: 10,
  f4: 10,
  c5: 10,
  f5: 10,
  c6: 10,
  d6: 10,
  e6: 10,
  f6: 10,
};

type CandidateMove = { from: string; to: string; captured?: string; promotion?: string };

export class BotEngine {
  private difficulty: BotDifficulty;
  private depth: number;
  private lastBotMove: string | null = null;

  constructor(difficulty: BotDifficulty = 'intermediate') {
    this.difficulty = difficulty;
    this.depth = this.getDepth(difficulty);
  }

  private getDepth(difficulty: BotDifficulty): number {
    return { beginner: 2, intermediate: 3, advanced: 4, master: 5 }[difficulty];
  }

  getBestMove(fen: string): Move | null {
    const game = new Chess(fen);
    const moves = game.moves({ verbose: true }) as CandidateMove[];
    if (!moves.length) return null;

    if (this.difficulty === 'beginner' && Math.random() < 0.35) {
      return this.moveToResult(moves[Math.floor(Math.random() * moves.length)]);
    }

    if (this.difficulty === 'intermediate' && Math.random() < 0.12) {
      return this.moveToResult(moves[Math.floor(Math.random() * moves.length)]);
    }

    const orderedMoves = [...moves].sort((a, b) => this.getMovePriority(game, b) - this.getMovePriority(game, a));

    let best: CandidateMove | null = null;
    let bestScore = -Infinity;

    for (const move of orderedMoves) {
      game.move(move);
      const score = -this.search(game, this.depth - 1, -Infinity, Infinity, 1);
      game.undo();

      if (score > bestScore) {
        bestScore = score;
        best = move;
      }
    }

    if (!best) return this.moveToResult(orderedMoves[0]);

    this.lastBotMove = `${best.from}${best.to}`;
    return this.moveToResult(best);
  }

  private search(game: Chess, depth: number, alpha: number, beta: number, ply: number): number {
    if (depth === 0) return this.evaluate(game);

    const moves = game.moves({ verbose: true }) as CandidateMove[];
    if (!moves.length) return game.inCheck() ? -CHECKMATE_SCORE + ply : 0;

    const orderedMoves = [...moves].sort((a, b) => this.getMovePriority(game, b) - this.getMovePriority(game, a));

    for (const move of orderedMoves) {
      game.move(move);
      const score = -this.search(game, depth - 1, -beta, -alpha, ply + 1);
      game.undo();

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  }

  private evaluate(game: Chess): number {
    let score = 0;
    const board = game.board();

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (!piece) continue;

        const material = PIECE_VALUES[piece.type as keyof typeof PIECE_VALUES] || 0;
        const square = `${String.fromCharCode(97 + file)}${8 - rank}`;

        let positional = CENTER_BONUS[square] || 0;
        if (piece.type === 'p') {
          positional += piece.color === 'w' ? (6 - rank) * 4 : (rank - 1) * 4;
        }

        const pieceScore = material + positional;
        score += piece.color === 'w' ? pieceScore : -pieceScore;
      }
    }

    const turnMultiplier = game.turn() === 'w' ? 1 : -1;
    score += game.moves().length * 3 * turnMultiplier;

    return score;
  }

  private getMovePriority(game: Chess, move: CandidateMove): number {
    let priority = 0;

    if (move.captured) {
      const capturedValue = PIECE_VALUES[move.captured as keyof typeof PIECE_VALUES] || 0;
      const movingPiece = game.get(move.from as ChessSquare);
      const movingValue = movingPiece ? PIECE_VALUES[movingPiece.type as keyof typeof PIECE_VALUES] : 0;
      priority += capturedValue * 10 - movingValue;
    }

    if (move.promotion) {
      priority += PIECE_VALUES[move.promotion as keyof typeof PIECE_VALUES] || 0;
    }

    if (this.lastBotMove && this.lastBotMove === `${move.to}${move.from}`) {
      priority -= 40;
    }

    return priority;
  }

  private moveToResult(move: CandidateMove): Move {
    return { from: move.from, to: move.to, promotion: move.promotion as Move['promotion'] };
  }

  setDifficulty(difficulty: BotDifficulty): void {
    this.difficulty = difficulty;
    this.depth = this.getDepth(difficulty);
  }
}

export default BotEngine;
