# Contributing to Chess Game

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/chessgame.git
   cd chessgame
   ```
3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Start the dev server**:
   ```bash
   npm run dev
   ```

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow existing code patterns and conventions
- Use meaningful variable and function names
- Add comments for complex logic

### Commit Messages
- Use clear, descriptive commit messages
- Start with a verb: "Add", "Fix", "Update", "Remove", etc.
- Example: `Add en passant move validation`

### Testing
Before submitting:
- Test your changes thoroughly
- Verify the build compiles without errors: `npm run build`
- Check that no TypeScript errors appear
- Test across different board sizes (responsive design)

## Making Changes

### Chess Engine Changes
If modifying [src/lib/chess-engine.ts](src/lib/chess-engine.ts):
- Ensure all standard chess rules are still enforced
- Test move validation with edge cases (castling, en passant, promotion)
- Verify check/checkmate/stalemate detection
- Run through a complete game to ensure stability

### AI Bot Changes
If modifying [src/lib/bot-engine.ts](src/lib/bot-engine.ts):
- Test all difficulty levels (Beginner through Master)
- Ensure the bot still makes reasonable moves
- Verify performance (bot shouldn't think for more than a second)
- Check for blunder frequency on lower difficulties

### UI Changes
If modifying components in `src/components/`:
- Test responsiveness on tablet and desktop
- Ensure animations are smooth
- Check accessibility (piece visibility, contrast)
- Maintain consistent styling with Tailwind CSS

## Submitting Changes

1. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
2. **Create a Pull Request** on GitHub with:
   - Clear title describing your changes
   - Description of what was changed and why
   - Reference any related issues: "Fixes #123"
3. **Respond to feedback** from reviewers
4. **Ensure CI passes** (all checks must be green)

## Types of Contributions

### Bug Fixes
- Report bugs via [Issues](https://github.com/yourusername/chessgame/issues)
- Include steps to reproduce
- Include browser/OS information

### Features
- Check if a feature request already exists
- Discuss larger features before implementing
- Keep features focused and scoped

### Documentation
- Improve README or comments
- Add examples or explanations
- Fix typos or clarity issues

## Project Structure Reference

```
src/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── Chessboard.tsx      # Board rendering and interaction
│   ├── GameInfo.tsx        # Game status display
│   ├── GameControls.tsx    # Control buttons
│   └── SetupDialog.tsx     # Game setup modal
└── lib/
    ├── chess-engine.ts     # Chess rules and validation
    └── bot-engine.ts       # AI opponent logic
```

## Common Tasks

### Adding a New Difficulty Level
1. Update `BotDifficulty` type in [src/lib/bot-engine.ts](src/lib/bot-engine.ts)
2. Add depth mapping in `getDepth()` method
3. Add new option to SetupDialog.tsx
4. Test thoroughly at different skill levels

### Modifying Piece Values
1. Edit `PIECE_VALUES` constant in [src/lib/bot-engine.ts](src/lib/bot-engine.ts)
2. Test bot play quality
3. Ensure values are reasonable (Pawn ≈ 100 points)

### Changing Board Colors
1. Update `getSquareClass()` in [src/components/Chessboard.tsx](src/components/Chessboard.tsx)
2. Verify piece visibility against both light and dark squares
3. Test with different lighting conditions

## Questions?

- Check the [README](README.md) for project overview
- Look at existing code for patterns
- Open an Issue for discussion
- Review commit history for context

## Code of Conduct

- Be respectful and inclusive
- Focus on the code, not the person
- Help others learn and improve
- Report concerns to maintainers

---

Happy coding! ♟️
