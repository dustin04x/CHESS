import { Chess } from 'chess.js';
import type { Square as ChessSquare } from 'chess.js';

export type Square = string;
export type Color = 'w' | 'b';

export interface Move {
  from: Square;
  to: Square;
  promotion?: 'q' | 'r' | 'b' | 'n';
}

export interface Piece {
  type: string;
  color: Color;
}

export interface GameState {
  fen: string;
  legalMoves: Move[];
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isCheck: boolean;
  turnColor: Color;
  history: Move[];
}

export class ChessEngine {
  private game: Chess;
  private moveHistory: Move[] = [];

  constructor(fen?: string) {
    this.game = new Chess(fen);
  }

  getGameState(): GameState {
    const moves = this.game.moves({ verbose: true }).map(m => ({
      from: m.from,
      to: m.to,
      promotion: m.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
    }));

    return {
      fen: this.game.fen(),
      legalMoves: moves,
      isCheckmate: this.game.isCheckmate(),
      isStalemate: this.game.isStalemate(),
      isDraw: this.game.isDraw(),
      isCheck: this.game.inCheck(),
      turnColor: this.game.turn(),
      history: this.moveHistory,
    };
  }

  makeMove(move: Move): boolean {
    try {
      const result = this.game.move({ from: move.from, to: move.to, promotion: move.promotion });
      if (!result) return false;
      this.moveHistory.push(move);
      return true;
    } catch {
      return false;
    }
  }

  undoMove(): Move | null {
    const result = this.game.undo();
    if (!result) return null;
    return this.moveHistory.pop() || null;
  }

  getLegalMovesFromSquare(square: Square): Square[] {
    return this.game.moves({ square: square as ChessSquare, verbose: true }).map(m => m.to);
  }

  getFen(): string {
    return this.game.fen();
  }

  getAscii(): string {
    return this.game.ascii();
  }

  reset(): void {
    this.game.reset();
    this.moveHistory = [];
  }

  loadFen(fen: string): boolean {
    try {
      this.game.load(fen);
      this.moveHistory = [];
      return true;
    } catch {
      return false;
    }
  }

  getPieceAt(square: Square): Piece | null {
    const piece = this.game.get(square as ChessSquare);
    return piece ? { type: piece.type, color: piece.color as Color } : null;
  }

  getKingSquare(color: Color): Square | null {
    const board = this.game.board();

    for (let rank = 0; rank < board.length; rank++) {
      for (let file = 0; file < board[rank].length; file++) {
        const piece = board[rank][file];
        if (piece && piece.type === 'k' && piece.color === color) {
          return `${String.fromCharCode(97 + file)}${8 - rank}`;
        }
      }
    }

    return null;
  }

  getPgn(): string {
    return this.game.pgn();
  }

  getAllPieces(): Record<string, Piece> {
    return this.game.board().reduce<Record<string, Piece>>((acc, row, rank) => {
      row.forEach((piece, file) => {
        if (!piece) return;
        const square = `${String.fromCharCode(97 + file)}${8 - rank}`;
        acc[square] = { type: piece.type, color: piece.color as Color };
      });
      return acc;
    }, {});
  }

  getMoveNotation(move: Move): string {
    const piece = this.getPieceAt(move.from);
    const typeMap: Record<string, string> = { k: 'K', q: 'Q', r: 'R', b: 'B', n: 'N', p: '' };
    const typeStr = typeMap[piece?.type || 'p'] || '';
    const promStr = move.promotion ? `=${move.promotion.toUpperCase()}` : '';
    return `${typeStr}${move.from}${move.to}${promStr}`;
  }

  getCapturedPieces(): { white: string[]; black: string[] } {
    const allPieces = {
      white: ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'n', 'n', 'b', 'b', 'r', 'r', 'q'],
      black: ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'n', 'n', 'b', 'b', 'r', 'r', 'q'],
    };

    const currentPieces = this.getAllPieces();
    const onBoard: { white: string[]; black: string[] } = { white: [], black: [] };

    Object.values(currentPieces).forEach(piece => {
      const color = piece.color === 'w' ? 'white' : 'black';
      onBoard[color].push(piece.type);
    });

    return {
      white: allPieces.black.filter(p => {
        const index = onBoard.black.indexOf(p);
        if (index !== -1) {
          onBoard.black.splice(index, 1);
          return false;
        }
        return true;
      }),
      black: allPieces.white.filter(p => {
        const index = onBoard.white.indexOf(p);
        if (index !== -1) {
          onBoard.white.splice(index, 1);
          return false;
        }
        return true;
      }),
    };
  }
}

export default ChessEngine;
