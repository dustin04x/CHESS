'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Move, Piece, Square } from '@/lib/chess-engine';

interface ChessboardProps {
  board: (Piece | null)[][];
  onSquareClick: (square: Square) => void;
  selectedSquare: Square | null;
  legalMoves: Square[];
  lastMove: Move | null;
  isCheck: boolean;
  checkSquare: Square | null;
  disabled?: boolean;
  perspective: 'white' | 'black';
}

type AnnotationColor = 'green' | 'red' | 'blue' | 'yellow';

interface ArrowAnnotation {
  kind: 'arrow';
  from: Square;
  to: Square;
  color: AnnotationColor;
}

interface SquareAnnotation {
  kind: 'square';
  square: Square;
  color: AnnotationColor;
}

type Annotation = ArrowAnnotation | SquareAnnotation;

const PIECE_SYMBOLS: Record<string, string> = {
  'w-k': '\u2654',
  'w-q': '\u2655',
  'w-r': '\u2656',
  'w-b': '\u2657',
  'w-n': '\u2658',
  'w-p': '\u2659',
  'b-k': '\u265A',
  'b-q': '\u265B',
  'b-r': '\u265C',
  'b-b': '\u265D',
  'b-n': '\u265E',
  'b-p': '\u265F',
};

const ANNOTATION_COLORS: Record<AnnotationColor, { fill: string; stroke: string; glow: string }> = {
  green: { fill: 'rgba(132, 187, 77, 0.35)', stroke: '#84bb4d', glow: 'rgba(132, 187, 77, 0.65)' },
  red: { fill: 'rgba(227, 73, 73, 0.35)', stroke: '#e34949', glow: 'rgba(227, 73, 73, 0.6)' },
  blue: { fill: 'rgba(69, 133, 219, 0.35)', stroke: '#4585db', glow: 'rgba(69, 133, 219, 0.6)' },
  yellow: { fill: 'rgba(242, 198, 74, 0.35)', stroke: '#f2c64a', glow: 'rgba(242, 198, 74, 0.6)' },
};

const BOARD_DIMENSION = 100;
const SQUARE_SIZE = BOARD_DIMENSION / 8;

const getSquareColorFromEvent = (event: React.MouseEvent): AnnotationColor => {
  if (event.shiftKey) return 'red';
  if (event.altKey) return 'blue';
  if (event.ctrlKey || event.metaKey) return 'yellow';
  return 'green';
};

const squareToCoords = (square: Square, perspective: 'white' | 'black') => {
  const file = square.charCodeAt(0) - 97;
  const rank = Number.parseInt(square[1], 10);
  const row = 8 - rank;
  const col = file;
  const displayRow = perspective === 'white' ? row : 7 - row;
  const displayCol = perspective === 'white' ? col : 7 - col;

  return {
    x: displayCol * SQUARE_SIZE + SQUARE_SIZE / 2,
    y: displayRow * SQUARE_SIZE + SQUARE_SIZE / 2,
  };
};

export function Chessboard({
  board,
  onSquareClick,
  selectedSquare,
  legalMoves,
  lastMove,
  isCheck,
  checkSquare,
  disabled = false,
  perspective = 'white',
}: ChessboardProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [dragAnnotation, setDragAnnotation] = useState<ArrowAnnotation | null>(null);

  useEffect(() => {
    const stopDragging = () => setDragAnnotation(null);

    window.addEventListener('mouseup', stopDragging);
    return () => window.removeEventListener('mouseup', stopDragging);
  }, []);

  const annotationLookup = useMemo(() => {
    const lookup = new Map<string, SquareAnnotation>();

    annotations.forEach((annotation) => {
      if (annotation.kind === 'square') {
        lookup.set(annotation.square, annotation);
      }
    });

    return lookup;
  }, [annotations]);

  const toggleSquareAnnotation = (square: Square, color: AnnotationColor) => {
    setAnnotations((current) => {
      const existing = current.find(
        (annotation) => annotation.kind === 'square' && annotation.square === square && annotation.color === color,
      );

      if (existing) {
        return current.filter((annotation) => annotation !== existing);
      }

      return [
        ...current.filter((annotation) => !(annotation.kind === 'square' && annotation.square === square)),
        { kind: 'square', square, color },
      ];
    });
  };

  const toggleArrowAnnotation = (from: Square, to: Square, color: AnnotationColor) => {
    setAnnotations((current) => {
      const existing = current.find(
        (annotation) =>
          annotation.kind === 'arrow' && annotation.from === from && annotation.to === to && annotation.color === color,
      );

      if (existing) {
        return current.filter((annotation) => annotation !== existing);
      }

      return [
        ...current.filter(
          (annotation) => !(annotation.kind === 'arrow' && annotation.from === from && annotation.to === to),
        ),
        { kind: 'arrow', from, to, color },
      ];
    });
  };

  const finalizeAnnotation = (square: Square, color: AnnotationColor) => {
    if (!dragAnnotation) {
      toggleSquareAnnotation(square, color);
      return;
    }

    if (dragAnnotation.from === square) {
      toggleSquareAnnotation(square, color);
      setDragAnnotation(null);
      return;
    }

    toggleArrowAnnotation(dragAnnotation.from, square, color);
    setDragAnnotation(null);
  };

  const renderedArrows = useMemo(() => {
    const arrows = annotations.filter((annotation): annotation is ArrowAnnotation => annotation.kind === 'arrow');
    return dragAnnotation ? [...arrows, dragAnnotation] : arrows;
  }, [annotations, dragAnnotation]);

  const renderArrow = (arrow: ArrowAnnotation, index: number) => {
    const from = squareToCoords(arrow.from, perspective);
    const to = squareToCoords(arrow.to, perspective);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy) || 1;
    const trim = 4.2;
    const endX = to.x - (dx / length) * trim;
    const endY = to.y - (dy / length) * trim;
    const color = ANNOTATION_COLORS[arrow.color];
    const markerId = `arrowhead-${arrow.color}`;

    return (
      <line
        key={`${arrow.from}-${arrow.to}-${index}`}
        x1={from.x}
        y1={from.y}
        x2={endX}
        y2={endY}
        stroke={color.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        markerEnd={`url(#${markerId})`}
        opacity={dragAnnotation && arrow === dragAnnotation ? 0.65 : 0.85}
        style={{ filter: `drop-shadow(0 0 0.8px ${color.glow})` }}
      />
    );
  };

  const squares = [];

  for (let displayRow = 0; displayRow < 8; displayRow += 1) {
    for (let displayCol = 0; displayCol < 8; displayCol += 1) {
      const row = perspective === 'white' ? displayRow : 7 - displayRow;
      const col = perspective === 'white' ? displayCol : 7 - displayCol;
      const square = `${String.fromCharCode(97 + col)}${8 - row}` as Square;
      const piece = board[row][col];
      const isLightSquare = (row + col) % 2 === 1;
      const isSelected = square === selectedSquare;
      const isLegalMove = legalMoves.includes(square);
      const isLastMoveSquare = lastMove ? square === lastMove.from || square === lastMove.to : false;
      const isCheckSquare = isCheck && checkSquare === square;
      const squareAnnotation = annotationLookup.get(square);
      const fileLabel = String.fromCharCode(97 + col);
      const rankLabel = String(8 - row);

      squares.push(
        <button
          key={square}
          type="button"
          aria-label={`Square ${square}${piece ? ` with ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ''}`}
          disabled={disabled}
          onClick={() => !disabled && onSquareClick(square)}
          onContextMenu={(event) => event.preventDefault()}
          onMouseDown={(event) => {
            if (event.button !== 2) return;
            event.preventDefault();
            const color = getSquareColorFromEvent(event);
            setDragAnnotation({ kind: 'arrow', from: square, to: square, color });
          }}
          onMouseEnter={() => {
            setDragAnnotation((current) => (current ? { ...current, to: square } : null));
          }}
          onMouseUp={(event) => {
            if (event.button !== 2) return;
            event.preventDefault();
            finalizeAnnotation(square, getSquareColorFromEvent(event));
          }}
          className={[
            'group relative aspect-square w-full touch-none select-none overflow-hidden transition-transform duration-100',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer',
            isLightSquare ? 'bg-[#f0d9b5]' : 'bg-[#b58863]',
            isLastMoveSquare ? (isLightSquare ? 'bg-[#f7ec74]' : 'bg-[#dac34d]') : '',
            isSelected ? 'ring-4 ring-inset ring-[#2f8fdf]' : '',
            isCheckSquare ? 'ring-4 ring-inset ring-[#d9534f]' : '',
          ].join(' ')}
        >
          {squareAnnotation && (
            <span
              className="absolute inset-[8%] rounded-[18%]"
              style={{ backgroundColor: ANNOTATION_COLORS[squareAnnotation.color].fill }}
            />
          )}

          {isLegalMove && (
            <span
              className={[
                'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
                piece ? 'h-[78%] w-[78%] border-[5px]' : 'h-[22%] w-[22%]',
              ].join(' ')}
              style={{
                backgroundColor: piece ? 'transparent' : 'rgba(37, 36, 33, 0.18)',
                borderColor: piece ? 'rgba(37, 36, 33, 0.18)' : 'transparent',
              }}
            />
          )}

          {displayCol === 0 && (
            <span className={`pointer-events-none absolute left-1.5 top-1 text-[10px] font-semibold ${isLightSquare ? 'text-[#7a5a3a]' : 'text-[#f8f1e7]'}`}>
              {rankLabel}
            </span>
          )}

          {displayRow === 7 && (
            <span className={`pointer-events-none absolute bottom-1 right-1.5 text-[10px] font-semibold ${isLightSquare ? 'text-[#7a5a3a]' : 'text-[#f8f1e7]'}`}>
              {fileLabel}
            </span>
          )}

          {piece && (
            <span
              className={[
                'relative z-10 flex h-full items-center justify-center text-[2.15rem] leading-none md:text-[3.15rem]',
                piece.color === 'w' ? 'text-[#fffdf8]' : 'text-[#2c241d]',
              ].join(' ')}
              style={{
                fontFamily: '"Times New Roman", serif',
                textShadow:
                  piece.color === 'w'
                    ? '0 1px 0 #6f6a64, 0 4px 10px rgba(0, 0, 0, 0.22)'
                    : '0 1px 0 rgba(255, 255, 255, 0.25), 0 4px 10px rgba(0, 0, 0, 0.18)',
              }}
            >
              {PIECE_SYMBOLS[`${piece.color}-${piece.type}`]}
            </span>
          )}
        </button>,
      );
    }
  }

  return (
    <div className="w-full max-w-[680px]">
      <div className="rounded-[28px] bg-[linear-gradient(145deg,#4c433b,#2e2723)] p-3 shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
        <div className="relative overflow-hidden rounded-[20px] border border-black/15 bg-[#262522] p-2 shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_bottom,rgba(0,0,0,0.22),transparent_45%)]" />

          <div className="relative aspect-square w-full">
            <div className="grid h-full grid-cols-8 overflow-hidden rounded-[12px] border border-black/10">
              {squares}
            </div>

            <svg
              viewBox={`0 0 ${BOARD_DIMENSION} ${BOARD_DIMENSION}`}
              className="pointer-events-none absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              <defs>
                {(Object.keys(ANNOTATION_COLORS) as AnnotationColor[]).map((colorKey) => (
                  <marker
                    key={colorKey}
                    id={`arrowhead-${colorKey}`}
                    markerWidth="5"
                    markerHeight="5"
                    refX="4"
                    refY="2.5"
                    orient="auto"
                  >
                    <path d="M0,0 L5,2.5 L0,5 z" fill={ANNOTATION_COLORS[colorKey].stroke} opacity="0.95" />
                  </marker>
                ))}
              </defs>
              {renderedArrows.map(renderArrow)}
            </svg>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-[#d7d2cb]">
        Right-click to highlight. Right-drag to draw arrows. Hold Shift, Alt, or Ctrl/Cmd for alternate colors.
      </p>
    </div>
  );
}

export default Chessboard;
