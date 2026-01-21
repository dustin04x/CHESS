# ♟️ Chess - Play Against AI

A modern, web-based chess platform featuring a complete rule-accurate chess engine and intelligent AI opponents. Challenge yourself against four difficulty levels, from beginner to master, with smooth animations and an intuitive interface.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Play_Now-blue?style=for-the-badge)](https://dustin04x.github.io/CHESS/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Tech Stack](https://img.shields.io/badge/Tech-Next.js_16_TypeScript-black?style=for-the-badge)](https://nextjs.org/)

---

## ✨ Features

### Complete Chess Engine
Every aspect of standard chess rules has been meticulously implemented to provide an authentic gameplay experience. The engine handles all legal move validation, ensuring that only valid chess moves are accepted. Players can experience the full depth of chess strategy with proper detection of check, checkmate, and stalemate conditions. Advanced moves including castling, en passant captures, and automatic pawn promotion to queen are all supported. The move history tracking system allows players to review their games and use the undo functionality when needed.

### Four-Tier AI System
The artificial intelligence offers four distinct difficulty levels designed to challenge players of all skill levels. The Beginner bot introduces occasional blunders with approximately 30% random moves, making it ideal for learning the basics. Intermediate provides solid competitive play with moments of suboptimal decision-making that create interesting game dynamics. Advanced mode delivers strategic depth with good positional awareness and tactical sensitivity. The Master difficulty represents the strongest opponent, utilizing deep search analysis to find strong moves and punish errors.

### Intuitive Interface
The visual design features a classic tan and brown color scheme that evokes the feel of traditional chess sets while maintaining a modern aesthetic. Legal move indicators appear as green dots on valid destination squares, helping new players learn piece movement patterns. The last move is subtly highlighted to track game progression, while check conditions are clearly indicated with a red ring around the threatened king. Captured pieces are displayed to show material advantage, and smooth piece animations make the board feel responsive and alive.

### Responsive Design
The game interface adapts seamlessly to different screen sizes, providing an optimal experience on desktop computers, tablets, and larger mobile devices. The chess board maintains proper proportions and readability across all viewport sizes, ensuring that players can enjoy games anywhere.

---

## 🎮 How to Play

### Getting Started
Begin by clicking the "New Game" button to open the game setup dialog. Here you can customize your gaming experience before the first move is made. Select whether you want to play as the white pieces or the black pieces, then choose your preferred AI difficulty level. Once you've made your selections, click "Start Game" to begin your match.

### Making Moves
To move a piece, simply click on it to select it. Valid destination squares will be highlighted with green dots, showing you where that piece can legally move. Click the destination square to complete your move. The interface provides visual feedback throughout the game, highlighting the last move made and indicating when your king is under attack.

### Game Controls
Throughout the game, you have access to several control options. The undo button allows you to take back your last move, useful when you've made a mistake or want to explore alternative lines. If you're facing a lost position, you can resign to end the game and start fresh. The new game button returns you to the setup dialog where you can adjust your settings and play again.

### Understanding Notation
Moves are displayed in standard algebraic notation in the game history panel, following conventional chess recording practices. Captures are clearly indicated with an "x" symbol between the piece letter and destination square. Castling is recorded using the traditional notation of "O-O" for kingside castling and "O-O-O" for queenside castling. When a pawn reaches the opposite side of the board, promotion to queen occurs automatically.

---

## 🏗️ Technical Architecture

### Core Technologies
The application is built on a modern technology stack that ensures performance, type safety, and maintainability. Next.js 16 provides the React framework with server-side rendering capabilities and optimized build processes. TypeScript adds static type checking throughout the codebase, catching errors before they reach production. Tailwind CSS enables rapid UI development with utility-first styling that keeps stylesheets minimal and performant. Framer Motion powers smooth animations and transitions that enhance the user experience. The Lucide React icon library provides consistent, scalable vector icons throughout the interface.

### Chess Logic
The chess.js library serves as the foundation for all game logic, providing robust move generation and validation. This proven library handles the complex rules of chess, including special moves like castling and en passant, while ensuring that only legal moves are permitted. The library also manages game state tracking, detecting check, checkmate, and stalemate conditions automatically.

### AI Implementation
The custom bot engine implements the minimax algorithm with alpha-beta pruning optimization for efficient move searching. Each piece has standard point values assigned: pawns are worth 1 point, knights and bishops are valued at 3 points, rooks carry 5 points, and queens are worth 9 points. Beyond simple material evaluation, the engine considers positional factors including piece placement, mobility, pawn structure integrity, and check threats. The search depth varies by difficulty level, with more capable opponents analyzing deeper into the game tree.

### Project Structure
The codebase is organized following Next.js 16 App Router conventions for clear separation of concerns:

```
src/
├── app/
│   ├── page.tsx              # Main game page with comprehensive state management
│   └── layout.tsx            # Root layout configuration and page metadata
├── components/
│   ├── Chessboard.tsx        # Interactive board component with move handling
│   ├── GameInfo.tsx          # Status display and captured pieces panel
│   ├── GameControls.tsx      # Undo, resign, and new game buttons
│   └── SetupDialog.tsx       # Pre-game configuration modal
└── lib/
    ├── chess-engine.ts       # Core chess rules and game state logic
    └── bot-engine.ts         # AI decision-making and move selection
```

---

## 🚀 Quick Start

### Prerequisites
Ensure you have Node.js version 18 or higher installed on your system, along with the npm package manager.

### Installation
Clone the repository to your local machine using Git, then navigate into the project directory:

```bash
git clone https://github.com/dustin04x/CHESS.git
cd CHESS
```

Install all project dependencies with npm:

```bash
npm install
```

### Development
Start the development server to begin working with the project:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000` to play the game while developing.

### Production Build
When you're ready to deploy, create an optimized production build:

```bash
npm run build
npm start
```

The production server will start on port 3000, serving your fully optimized chess application.

---

## 🤖 AI Algorithm Deep Dive

### Minimax with Alpha-Beta Pruning
The artificial intelligence employs the minimax decision-making algorithm, a cornerstone of game AI development. This algorithm works by recursively evaluating all possible move sequences, assuming optimal play from both sides. The "minimax" name comes from one player trying to maximize their advantage while the opponent tries to minimize it. Alpha-beta pruning significantly improves performance by eliminating branches that cannot yield better results than already examined alternatives, allowing deeper search within time constraints.

### Positional Evaluation Function
Beyond simple material counting, the evaluation function considers numerous positional factors that distinguish strong chess play from mechanical point accumulation. Piece mobility is rewarded, as pieces with more mobility generally control more squares and offer greater tactical options. Pawn structure receives careful attention, with isolated pawns and doubled pawns penalized. The king safety evaluation ensures the AI understands the importance of protecting its monarch, especially in the middlegame when castling should have occurred.

### Difficulty Scaling
Each difficulty level applies different parameters to create varied opponent personalities. Search depth directly correlates with difficulty, with deeper analysis yielding stronger moves at the cost of computation time. The beginner level introduces controlled randomness, intentionally occasionally selecting suboptimal moves to simulate human error patterns. Intermediate and advanced levels reduce randomness while increasing search depth and evaluation sophistication.

---

## 📋 Feature Checklist

- Full legal move validation according to standard chess rules
- Complete move history tracking throughout the game
- Undo functionality limited to one move per game
- Visual display of captured pieces for both players
- Clear game state indicators showing whose turn it is
- Automatic check and checkmate detection
- Visual indication when king is in check
- Smooth piece movement animations
- Responsive board sizing for different screen dimensions
- Support for castling, en passant, and pawn promotion
- Four AI difficulty levels with distinct playing styles
- Color selection for player pieces
- Professional visual design with classic chess aesthetic

---

## 🔮 Roadmap

The project continues to evolve with planned enhancements that will expand gameplay possibilities. Time controls are planned for future implementation, supporting blitz, rapid, and classical time formats for competitive play. A comprehensive move history and game replay system will allow players to review their games move by move after completion. An opening book integration would provide stronger and more varied early-game play, avoiding repetitive positions. Endgame tablebase connectivity would provide perfect play in common endgame scenarios. A puzzle and training mode could help players improve their tactical skills. Game statistics and an Elo rating system would track improvement over time. Online multiplayer support would enable human versus human matches. PGN import and export functionality would allow saving games for later analysis.

---

## 📚 Learning Resources

For developers interested in understanding the technologies behind this project, several resources provide valuable context. The chess.js documentation explains the extensive capabilities of the chess logic library. The Wikipedia articles on the minimax algorithm and alpha-beta pruning provide mathematical and theoretical foundations for game AI. These resources offer excellent starting points for anyone looking to build similar games or understand the algorithms at work.

---

## 🤝 Contributing

Contributions are welcomed and appreciated! Whether you want to fix bugs, add new features, improve documentation, or suggest enhancements, your involvement makes this project better. Feel free to submit issues describing bugs or feature requests, and submit pull requests with your improvements. All contributors are expected to follow the project's code of conduct and maintain coding standards.

---

## 📄 License

This project is licensed under the MIT License, permitting free use, modification, and distribution with appropriate attribution. See the LICENSE file for complete details.

---

**Enjoy your game of chess! ♟️♞♗♖♕♔**

Live Demo: [https://dustin04x.github.io/CHESS/](https://dustin04x.github.io/CHESS/)
