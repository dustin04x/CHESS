import { Chess } from 'chess.js';
import type { Square as ChessSquare } from 'chess.js';

export type Square = string;
export type Color = 'w' | 'b';
export type PromotionPiece = 'q' | 'r' | 'b' | 'n';

export interface Move {
  from: Square;
  to: Square;
  promotion?: PromotionPiece;
  san?: string;
  piece?: string;
  captured?: string;
  flags?: string;
  color?: Color;
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

  constructor(fen?: string) {
    this.game = new Chess(fen);
  }

  getGameState(): GameState {
    const history = this.game.history({ verbose: true }).map((move) => ({
      from: move.from,
      to: move.to,
      promotion: move.promotion as PromotionPiece | undefined,
      san: move.san,
      piece: move.piece,
      captured: move.captured,
      flags: move.flags,
      color: move.color as Color,
    }));

    const moves = this.game.moves({ verbose: true }).map(m => ({
      from: m.from,
      to: m.to,
      promotion: m.promotion as PromotionPiece | undefined,
      san: m.san,
      piece: m.piece,
      captured: m.captured,
      flags: m.flags,
      color: m.color as Color,
    }));

    return {
      fen: this.game.fen(),
      legalMoves: moves,
      isCheckmate: this.game.isCheckmate(),
      isStalemate: this.game.isStalemate(),
      isDraw: this.game.isDraw(),
      isCheck: this.game.inCheck(),
      turnColor: this.game.turn(),
      history,
    };
  }

  makeMove(move: Move): boolean {
    try {
      const result = this.game.move({ from: move.from, to: move.to, promotion: move.promotion });
      if (!result) return false;
      return true;
    } catch {
      return false;
    }
  }

  undoMove(): Move | null {
    const result = this.game.undo();
    if (!result) return null;
    return {
      from: result.from,
      to: result.to,
      promotion: result.promotion as PromotionPiece | undefined,
      san: result.san,
      piece: result.piece,
      captured: result.captured,
      flags: result.flags,
      color: result.color as Color,
    };
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
  }

  loadFen(fen: string): boolean {
    try {
      this.game.load(fen);
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
    if (move.san) return move.san;
    const piece = this.getPieceAt(move.from);
    const typeMap: Record<string, string> = { k: 'K', q: 'Q', r: 'R', b: 'B', n: 'N', p: '' };
    const typeStr = typeMap[piece?.type || 'p'] || '';
    const promStr = move.promotion ? `=${move.promotion.toUpperCase()}` : '';
    return `${typeStr}${move.from}${move.to}${promStr}`;
  }

  getCapturedPieces(): { white: string[]; black: string[] } {
    return this.game.history({ verbose: true }).reduce(
      (captured, move) => {
        if (!move.captured) return captured;

        if (move.color === 'w') {
          captured.white.push(move.captured);
        } else {
          captured.black.push(move.captured);
        }

        return captured;
      },
      { white: [] as string[], black: [] as string[] },
    );
  }
}

export default ChessEngine;
