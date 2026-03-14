import { Chess } from 'chess.js';
import type { PieceSymbol, Square as ChessSquare } from 'chess.js';
import type { Move } from './chess-engine';

export type BotDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'master';

interface DifficultyConfig {
  depth: number;
  noise: number;
  blunderChance: number;
  maxBestMovesToMix: number;
  quiescenceDepth: number;
  label: string;
  description: string;
}

type CandidateMove = {
  from: string;
  to: string;
  san: string;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  flags: string;
};

const CHECKMATE_SCORE = 1_000_000;
const DRAW_SCORE = 0;

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20_000,
};

const PIECE_SQUARE_TABLES: Record<Exclude<PieceSymbol, 'k'>, number[]> = {
  p: [
    0, 0, 0, 0, 0, 0, 0, 0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5, 5, 10, 25, 25, 10, 5, 5,
    0, 0, 0, 20, 20, 0, 0, 0,
    5, -5, -10, 0, 0, -10, -5, 5,
    5, 10, 10, -20, -20, 10, 10, 5,
    0, 0, 0, 0, 0, 0, 0, 0,
  ],
  n: [
    -50, -40, -30, -30, -30, -30, -40, -50,
    -40, -20, 0, 5, 5, 0, -20, -40,
    -30, 5, 10, 15, 15, 10, 5, -30,
    -30, 0, 15, 20, 20, 15, 0, -30,
    -30, 5, 15, 20, 20, 15, 5, -30,
    -30, 0, 10, 15, 15, 10, 0, -30,
    -40, -20, 0, 0, 0, 0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  b: [
    -20, -10, -10, -10, -10, -10, -10, -20,
    -10, 5, 0, 0, 0, 0, 5, -10,
    -10, 10, 10, 10, 10, 10, 10, -10,
    -10, 0, 10, 10, 10, 10, 0, -10,
    -10, 5, 5, 10, 10, 5, 5, -10,
    -10, 0, 5, 10, 10, 5, 0, -10,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -20, -10, -10, -10, -10, -10, -10, -20,
  ],
  r: [
    0, 0, 0, 5, 5, 0, 0, 0,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    5, 10, 10, 10, 10, 10, 10, 5,
    0, 0, 0, 0, 0, 0, 0, 0,
  ],
  q: [
    -20, -10, -10, -5, -5, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 5, 5, 5, 0, -10,
    -5, 0, 5, 5, 5, 5, 0, -5,
    0, 0, 5, 5, 5, 5, 0, -5,
    -10, 5, 5, 5, 5, 5, 0, -10,
    -10, 0, 5, 0, 0, 0, 0, -10,
    -20, -10, -10, -5, -5, -10, -10, -20,
  ],
};

const KING_MIDGAME_TABLE = [
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -20, -30, -30, -40, -40, -30, -30, -20,
  -10, -20, -20, -20, -20, -20, -20, -10,
  20, 20, 0, 0, 0, 0, 20, 20,
  20, 30, 10, 0, 0, 10, 30, 20,
];

const KING_ENDGAME_TABLE = [
  -50, -40, -30, -20, -20, -30, -40, -50,
  -30, -20, -10, 0, 0, -10, -20, -30,
  -30, -10, 20, 30, 30, 20, -10, -30,
  -30, -10, 30, 40, 40, 30, -10, -30,
  -30, -10, 30, 40, 40, 30, -10, -30,
  -30, -10, 20, 30, 30, 20, -10, -30,
  -30, -30, 0, 0, 0, 0, -30, -30,
  -50, -30, -30, -30, -30, -30, -30, -50,
];

export const BOT_LEVELS: Record<BotDifficulty, DifficultyConfig> = {
  beginner: {
    depth: 1,
    noise: 120,
    blunderChance: 0.22,
    maxBestMovesToMix: 4,
    quiescenceDepth: 0,
    label: 'Beginner',
    description: 'Fast and friendly. Plays basic moves but misses many tactics.',
  },
  intermediate: {
    depth: 2,
    noise: 40,
    blunderChance: 0.08,
    maxBestMovesToMix: 3,
    quiescenceDepth: 2,
    label: 'Intermediate',
    description: 'Solid casual strength with simple tactics and fewer outright blunders.',
  },
  advanced: {
    depth: 3,
    noise: 8,
    blunderChance: 0.02,
    maxBestMovesToMix: 2,
    quiescenceDepth: 4,
    label: 'Advanced',
    description: 'Much sharper. Calculates combinations and converts advantages more reliably.',
  },
  master: {
    depth: 4,
    noise: 0,
    blunderChance: 0,
    maxBestMovesToMix: 1,
    quiescenceDepth: 6,
    label: 'Master',
    description: 'Strongest mode. Deepest search, cleanest tactics, and very few mistakes.',
  },
};

const mirrorIndex = (index: number) => {
  const rank = Math.floor(index / 8);
  const file = index % 8;
  return (7 - rank) * 8 + file;
};

const getTableValue = (piece: PieceSymbol, color: 'w' | 'b', index: number, endgame: boolean) => {
  const tableIndex = color === 'w' ? index : mirrorIndex(index);

  if (piece === 'k') {
    return (endgame ? KING_ENDGAME_TABLE : KING_MIDGAME_TABLE)[tableIndex];
  }

  return PIECE_SQUARE_TABLES[piece][tableIndex];
};

export class BotEngine {
  private difficulty: BotDifficulty;
  private config: DifficultyConfig;
  private lastBotMove: string | null = null;

  constructor(difficulty: BotDifficulty = 'intermediate') {
    this.difficulty = difficulty;
    this.config = BOT_LEVELS[difficulty];
  }

  getBestMove(fen: string): Move | null {
    const game = new Chess(fen);
    const moves = game.moves({ verbose: true }) as CandidateMove[];
    if (!moves.length) return null;

    if (Math.random() < this.config.blunderChance) {
      const fallback = moves[Math.floor(Math.random() * moves.length)];
      return this.moveToResult(fallback);
    }

    const orderedMoves = [...moves].sort((a, b) => this.getMovePriority(game, b) - this.getMovePriority(game, a));
    const scoredMoves = orderedMoves.map((move) => {
      game.move(move);
      const score = -this.search(game, this.config.depth - 1, -CHECKMATE_SCORE, CHECKMATE_SCORE, 1);
      game.undo();

      return { move, score: score + this.randomNoise() };
    });

    scoredMoves.sort((a, b) => b.score - a.score);

    const candidateCount = Math.min(this.config.maxBestMovesToMix, scoredMoves.length);
    const chosen = scoredMoves[Math.floor(Math.random() * candidateCount)];

    this.lastBotMove = `${chosen.move.from}${chosen.move.to}`;
    return this.moveToResult(chosen.move);
  }

  private search(game: Chess, depth: number, alpha: number, beta: number, ply: number): number {
    const moves = game.moves({ verbose: true }) as CandidateMove[];

    if (!moves.length) {
      if (game.isCheckmate()) return -CHECKMATE_SCORE + ply;
      return DRAW_SCORE;
    }

    if (depth <= 0) {
      return this.quiescence(game, alpha, beta, this.config.quiescenceDepth);
    }

    let orderedMoves = [...moves].sort((a, b) => this.getMovePriority(game, b) - this.getMovePriority(game, a));

    if (depth >= 2) {
      orderedMoves = this.prioritizeChecks(game, orderedMoves);
    }

    for (const move of orderedMoves) {
      game.move(move);
      const score = -this.search(game, depth - 1, -beta, -alpha, ply + 1);
      game.undo();

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  }

  private quiescence(game: Chess, alpha: number, beta: number, depth: number): number {
    const standPat = this.evaluate(game);
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
    if (depth <= 0) return alpha;

    const captureMoves = (game.moves({ verbose: true }) as CandidateMove[])
      .filter((move) => Boolean(move.captured) || Boolean(move.promotion))
      .sort((a, b) => this.getMovePriority(game, b) - this.getMovePriority(game, a));

    for (const move of captureMoves) {
      game.move(move);
      const score = -this.quiescence(game, -beta, -alpha, depth - 1);
      game.undo();

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  }

  private evaluate(game: Chess): number {
    if (game.isCheckmate()) {
      return game.turn() === 'w' ? -CHECKMATE_SCORE : CHECKMATE_SCORE;
    }

    if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition()) {
      return DRAW_SCORE;
    }

    const board = game.board();
    let score = 0;
    let materialWithoutKings = 0;
    let whiteBishops = 0;
    let blackBishops = 0;

    for (let rank = 0; rank < 8; rank += 1) {
      for (let file = 0; file < 8; file += 1) {
        const piece = board[rank][file];
        if (piece && piece.type !== 'k') {
          materialWithoutKings += PIECE_VALUES[piece.type];
        }
      }
    }

    const endgame = materialWithoutKings <= 2600;

    for (let rank = 0; rank < 8; rank += 1) {
      for (let file = 0; file < 8; file += 1) {
        const piece = board[rank][file];
        if (!piece) continue;

        const index = rank * 8 + file;
        const material = PIECE_VALUES[piece.type];
        const positional = getTableValue(piece.type, piece.color, index, endgame);
        const value = material + positional;

        if (piece.type === 'b') {
          if (piece.color === 'w') whiteBishops += 1;
          else blackBishops += 1;
        }

        score += piece.color === 'w' ? value : -value;

        if (piece.type === 'p') {
          score += piece.color === 'w' ? this.evaluatePawn(board, rank, file, 'w') : -this.evaluatePawn(board, rank, file, 'b');
        }
      }
    }

    if (whiteBishops >= 2) score += 35;
    if (blackBishops >= 2) score -= 35;

    score += this.evaluateMobility(game);
    score += this.evaluateKingSafety(board);

    return game.turn() === 'w' ? score : -score;
  }

  private evaluatePawn(board: ReturnType<Chess['board']>, rank: number, file: number, color: 'w' | 'b') {
    const direction = color === 'w' ? -1 : 1;
    const enemyColor = color === 'w' ? 'b' : 'w';
    let value = 0;
    let isPassed = true;
    let isIsolated = true;
    let friendlyPawnCountOnFile = 0;

    for (let r = 0; r < 8; r += 1) {
      const sameFilePiece = board[r][file];
      if (sameFilePiece?.type === 'p' && sameFilePiece.color === color) {
        friendlyPawnCountOnFile += 1;
      }
    }

    for (const sideFile of [file - 1, file + 1]) {
      if (sideFile < 0 || sideFile > 7) continue;

      for (let r = 0; r < 8; r += 1) {
        const adjacentPiece = board[r][sideFile];
        if (adjacentPiece?.type === 'p' && adjacentPiece.color === color) {
          isIsolated = false;
        }
      }
    }

    for (const sideFile of [file - 1, file, file + 1]) {
      if (sideFile < 0 || sideFile > 7) continue;

      for (let r = rank + direction; r >= 0 && r < 8; r += direction) {
        const piece = board[r][sideFile];
        if (piece?.type === 'p' && piece.color === enemyColor) {
          isPassed = false;
        }
      }
    }

    if (friendlyPawnCountOnFile > 1) value -= 18;
    if (isIsolated) value -= 14;
    if (isPassed) {
      const advance = color === 'w' ? 6 - rank : rank - 1;
      value += 20 + advance * 12;
    }

    return value;
  }

  private evaluateMobility(game: Chess) {
    const currentMobility = game.moves().length;
    const fenParts = game.fen().split(' ');
    fenParts[1] = fenParts[1] === 'w' ? 'b' : 'w';
    const opponentMobility = new Chess(fenParts.join(' ')).moves().length;

    return (currentMobility - opponentMobility) * 4;
  }

  private evaluateKingSafety(board: ReturnType<Chess['board']>) {
    let score = 0;

    for (let rank = 0; rank < 8; rank += 1) {
      for (let file = 0; file < 8; file += 1) {
        const piece = board[rank][file];
        if (!piece || piece.type !== 'k') continue;

        const shelterRank = piece.color === 'w' ? rank - 1 : rank + 1;
        let shelter = 0;

        for (const shieldFile of [file - 1, file, file + 1]) {
          if (shieldFile < 0 || shieldFile > 7 || shelterRank < 0 || shelterRank > 7) continue;
          const shieldPiece = board[shelterRank][shieldFile];
          if (shieldPiece?.type === 'p' && shieldPiece.color === piece.color) {
            shelter += 10;
          }
        }

        score += piece.color === 'w' ? shelter : -shelter;
      }
    }

    return score;
  }

  private prioritizeChecks(game: Chess, moves: CandidateMove[]) {
    return [...moves].sort((a, b) => {
      const aCheck = this.isCheckingMove(game, a) ? 1 : 0;
      const bCheck = this.isCheckingMove(game, b) ? 1 : 0;
      return bCheck - aCheck;
    });
  }

  private isCheckingMove(game: Chess, move: CandidateMove) {
    game.move(move);
    const isCheck = game.inCheck();
    game.undo();
    return isCheck;
  }

  private getMovePriority(game: Chess, move: CandidateMove): number {
    let priority = 0;

    if (move.captured) {
      const capturedValue = PIECE_VALUES[move.captured] || 0;
      const movingPiece = game.get(move.from as ChessSquare);
      const movingValue = movingPiece ? PIECE_VALUES[movingPiece.type] : 0;
      priority += capturedValue * 12 - movingValue;
    }

    if (move.promotion) {
      priority += PIECE_VALUES[move.promotion] || 0;
    }

    if (move.flags.includes('k') || move.flags.includes('q')) {
      priority += 45;
    }

    if (this.isCheckingMove(game, move)) {
      priority += 60;
    }

    if (this.lastBotMove && this.lastBotMove === `${move.to}${move.from}`) {
      priority -= 25;
    }

    return priority;
  }

  private randomNoise() {
    if (this.config.noise === 0) return 0;
    return (Math.random() * 2 - 1) * this.config.noise;
  }

  private moveToResult(move: CandidateMove): Move {
    return {
      from: move.from,
      to: move.to,
      promotion: move.promotion as Move['promotion'],
      san: move.san,
      piece: move.piece,
      captured: move.captured,
      flags: move.flags,
    };
  }

  setDifficulty(difficulty: BotDifficulty): void {
    this.difficulty = difficulty;
    this.config = BOT_LEVELS[difficulty];
  }

  getDifficulty(): BotDifficulty {
    return this.difficulty;
  }

  getDifficultyInfo(): DifficultyConfig {
    return this.config;
  }
}

export default BotEngine;
