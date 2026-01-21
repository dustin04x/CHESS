import { Chess } from 'chess.js';

export type Square = string; // e.g., 'e4', 'a1'
export type Color = 'w' | 'b';

export interface Move {
  from: Square;
  to: Square;
  promotion?: 'q' | 'r' | 'b' | 'n';
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

  /**
   * Get the current game state
   */
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

  /**
   * Make a move on the board
   */
  makeMove(move: Move): boolean {
    try {
      const result = this.game.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      });

      if (result) {
        this.moveHistory.push(move);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Undo the last move
   */
  undoMove(): Move | null {
    const result = this.game.undo();
    if (result) {
      return this.moveHistory.pop() || null;
    }
    return null;
  }

  /**
   * Get legal moves for a square
   */
  getLegalMovesFromSquare(square: Square): Square[] {
    return this.game
      .moves({ square: square as any, verbose: true })
      .map(m => m.to);
  }

  /**
   * Get the current FEN
   */
  getFen(): string {
    return this.game.fen();
  }

  /**
   * Get ASCII representation (for debugging)
   */
  getAscii(): string {
    return this.game.ascii();
  }

  /**
   * Reset the game
   */
  reset(): void {
    this.game.reset();
    this.moveHistory = [];
  }

  /**
   * Load a FEN position
   */
  loadFen(fen: string): boolean {
    try {
      this.game.load(fen);
      this.moveHistory = [];
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get piece at square
   */
  getPieceAt(square: Square): { type: string; color: Color } | null {
    return this.game.get(square as any) as any;
  }

  /**
   * Get all pieces on the board
   */
  getAllPieces(): { [key: string]: { type: string; color: Color } } {
    return this.game.board().reduce((acc: any, row) => {
      row.forEach((piece: any) => {
        if (piece) {
          acc[piece.square] = piece;
        }
      });
      return acc;
    }, {});
  }

  /**
   * Get move in long algebraic notation
   */
  getMoveNotation(move: Move): string {
    const piece = this.getPieceAt(move.from);
    const typeMap: { [key: string]: string } = {
      k: 'K',
      q: 'Q',
      r: 'R',
      b: 'B',
      n: 'N',
      p: '',
    };

    const typeStr = typeMap[piece?.type || 'p'] || '';
    const promStr = move.promotion ? `=${move.promotion.toUpperCase()}` : '';

    return `${typeStr}${move.from}${move.to}${promStr}`;
  }

  /**
   * Get captured pieces
   */
  getCapturedPieces(): { white: string[]; black: string[] } {
    const allPieces = {
      white: ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'n', 'n', 'b', 'b', 'r', 'r', 'q'],
      black: ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'n', 'n', 'b', 'b', 'r', 'r', 'q'],
    };

    const currentPieces = this.getAllPieces();
    const onBoard: { white: string[]; black: string[] } = {
      white: [],
      black: [],
    };

    Object.values(currentPieces).forEach(piece => {
      const color = piece.color === 'w' ? 'white' : 'black';
      onBoard[color].push(piece.type);
    });

    const captured = {
      white: allPieces.black.filter((p, i) => {
        const index = onBoard.black.indexOf(p);
        if (index !== -1) {
          onBoard.black.splice(index, 1);
          return false;
        }
        return true;
      }),
      black: allPieces.white.filter((p, i) => {
        const index = onBoard.white.indexOf(p);
        if (index !== -1) {
          onBoard.white.splice(index, 1);
          return false;
        }
        return true;
      }),
    };

    return captured;
  }
}

export default ChessEngine;
