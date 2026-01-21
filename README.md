# ♟️ Chess - Play Against AI

A modern, web-based chess platform that allows you to play chess against AI opponents with multiple difficulty levels. Built with Next.js, TypeScript, and Tailwind CSS.

## 🎮 Features

- **Full Rule-Accurate Chess Engine** - Complete implementation of standard chess rules including:
  - Legal move validation
  - Check, checkmate, and stalemate detection
  - Castling, en passant, and pawn promotion
  - Move history and undo functionality

- **Four AI Difficulty Levels**:
  - **Beginner** - Makes occasional blunders (30% random moves)
  - **Intermediate** - Solid play with occasional suboptimal moves
  - **Advanced** - Strategic play with good positional awareness
  - **Master** - Strongest opponent with deep search analysis

- **Interactive Chess Board**:
  - Classic tan/brown square design for professional appearance
  - Legal move highlighting (green dots)
  - Last move highlighting
  - Check indication (red ring)
  - Captured pieces tracking
  - Smooth piece animations

- **Game Controls**:
  - Undo moves
  - Resign from game
  - Start new game
  - Choose play color (white/black)
  - Select difficulty level before each game

- **Responsive Design** - Works seamlessly on desktop and tablet devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/chessgame.git
cd chessgame

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to play.

### Build for Production

```bash
npm run build
npm start
```

## 📖 How to Play

1. **Start Game** - Click "New Game" to open the setup dialog
2. **Choose Settings** - Select your piece color and AI difficulty
3. **Make Moves** - Click a piece to see legal moves, then click the destination
4. **Game Controls** - Use buttons to undo, resign, or start a new game
5. **Win Conditions** - Checkmate the opponent to win, or they can resign

### Move Notation
- Moves are shown in algebraic notation in the game history
- Captures are indicated with the destination square
- Castling is supported for both kingside (O-O) and queenside (O-O-O)
- Pawn promotion is automatic to Queen

## 🏗️ Technical Stack

- **Framework**: Next.js 16 with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Chess Logic**: chess.js library
- **AI Engine**: Custom minimax algorithm with alpha-beta pruning

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main game page with state management
│   └── layout.tsx            # Root layout and metadata
├── components/
│   ├── Chessboard.tsx        # Interactive chess board
│   ├── GameInfo.tsx          # Game status and captured pieces
│   ├── GameControls.tsx      # Game action buttons
│   └── SetupDialog.tsx       # Game initialization dialog
└── lib/
    ├── chess-engine.ts       # Core chess logic and rules
    └── bot-engine.ts         # AI opponent with minimax algorithm
```

## 🤖 AI Algorithm

The bot uses **minimax algorithm with alpha-beta pruning** for move selection:

- **Piece Valuation**: Standard point values (Pawn=1, Knight/Bishop=3, Rook=5, Queen=9)
- **Positional Evaluation**: Considers piece placement, mobility, check threats, and pawn structure
- **Depth Limiting**: Search depths vary by difficulty (2-5 plies)
- **Random Blunders**: Lower difficulties include intentional suboptimal moves for human-like play

## 🎯 Game Features

- ✅ Full legal move validation
- ✅ Move history and undo (single undo per game)
- ✅ Captured pieces display
- ✅ Game state indicators (whose turn, check status)
- ✅ Piece animation effects
- ✅ Responsive board sizing
- ✅ Dark mode ready styling

## 🔄 Move Validation

The engine validates all chess rules:
- Pieces cannot move through other pieces (except knights)
- King cannot move into check
- Cannot castle if king has moved or squares are attacked
- Pawn promotion occurs automatically on reaching the back rank
- En passant is supported
- Stalemate and checkmate detection

## 🌟 Future Enhancements

- Time controls (blitz, rapid, classical)
- Move history and game replay
- Opening book for stronger early-game play
- Endgame tablebase integration
- Puzzle/training mode
- Game statistics and rating system
- Online multiplayer support
- PGN import/export

## 📝 License

This project is open source and available under the MIT License.

## 🙋 Contributing

Contributions are welcome! Feel free to submit issues and pull requests to improve the chess engine or add new features.

## 🎓 Learning Resources

- [Chess.js Documentation](https://github.com/jhlywa/chess.js)
- [Minimax Algorithm](https://en.wikipedia.org/wiki/Minimax)
- [Alpha-Beta Pruning](https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning)

---

**Enjoy your game! ♟️♞♗♖♕♔**
