import { Chess } from 'chess.js';
import type { Move } from './chess-engine';

export type BotDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'master';

const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };

export class BotEngine {
  private difficulty: BotDifficulty;
  private depth: number;
  private lastMoves = new Set<string>();

  constructor(difficulty: BotDifficulty = 'intermediate') {
    this.difficulty = difficulty;
    this.depth = this.getDepth(difficulty);
  }

  private getDepth(difficulty: BotDifficulty): number {
    return { beginner: 2, intermediate: 3, advanced: 4, master: 5 }[difficulty];
  }

  getBestMove(fen: string): Move | null {
    const game = new Chess(fen);
    const moves = game.moves({ verbose: true });
    if (!moves.length) return null;

    // Beginner blunders
    if (this.difficulty === 'beginner' && Math.random() < 0.3) {
      return this.moveToResult(moves[Math.floor(Math.random() * moves.length)]);
    }

    // Intermediate occasional suboptimal
    if (this.difficulty === 'intermediate' && Math.random() < 0.1) {
      return this.moveToResult(moves[Math.floor(Math.random() * moves.length)]);
    }

    let best: any = null;
    let bestScore = -Infinity;

    for (const move of moves) {
      const moveStr = move.from + move.to;
      game.move(move);
      const score = -this.search(game, this.depth - 1, -Infinity, Infinity);
      game.undo();

      if (score > bestScore) {
        bestScore = score;
        best = move;
      }
    }

    if (best) this.lastMoves.add(best.from + best.to);
    return best ? this.moveToResult(best) : null;
  }

  private search(game: Chess, depth: number, alpha: number, beta: number): number {
    if (depth === 0) return this.evaluate(game);

    const moves = game.moves({ verbose: true });
    if (!moves.length) return game.inCheck() ? -1000 : 0;

    for (const move of moves) {
      game.move(move);
      const score = -this.search(game, depth - 1, -beta, -alpha);
      game.undo();

      alpha = Math.max(alpha, score);
      if (alpha >= beta) break;
    }

    return alpha;
  }

  private evaluate(game: Chess): number {
    let score = 0;
    const board = game.board();

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          const val = PIECE_VALUES[piece.type as keyof typeof PIECE_VALUES] || 0;
          score += piece.color === 'w' ? val : -val;
        }
      }
    }

    // Center control bonus
    const center = [[3, 3], [3, 4], [4, 3], [4, 4], [2, 3], [2, 4], [3, 2], [3, 5], [4, 2], [4, 5], [5, 3], [5, 4]];
    for (const [r, c] of center) {
      const piece = board[r][c];
      if (piece) score += piece.color === 'w' ? 0.2 : -0.2;
    }

    // Mobility
    const legalMoves = game.moves().length;
    score += game.turn() === 'w' ? legalMoves * 0.1 : -legalMoves * 0.1;

    return score;
  }

  private moveToResult(move: any): Move {
    return { from: move.from, to: move.to, promotion: move.promotion };
  }

  setDifficulty(difficulty: BotDifficulty): void {
    this.difficulty = difficulty;
    this.depth = this.getDepth(difficulty);
  }
}

export default BotEngine;
