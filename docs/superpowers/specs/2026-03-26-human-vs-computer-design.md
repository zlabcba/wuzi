# Human Vs Computer Design

## Overview

This feature adds a simple single-player mode to the existing browser Gomoku
game while preserving the current local two-player experience. The first
computer-opponent version will use a deterministic heuristic move picker
instead of deep search so it stays lightweight, readable, and responsive in
the browser.

## Goals

- Add a mode switch between local two-player play and human-vs-computer play.
- Keep the computer opponent strong enough to block obvious threats and build
  its own lines.
- Preserve the current board-size switching, mobile layout, undo, restart, and
  winner animations.

## User Experience

- Players can choose between `Two Players` and `Vs Computer`.
- In `Vs Computer`, the human plays black and moves first.
- After a valid human move, the board briefly locks and the computer places a
  white stone automatically.
- Status text should clearly indicate when the computer is thinking or when it
  is the human player's turn.
- Undo in `Vs Computer` removes the computer move and the preceding human move
  together so the player gets back to their previous decision point.

## State Model

The game state should carry enough information to support both modes:

- `gameMode`: `"local"` or `"computer"`
- `boardSize`, `board`, `currentPlayer`, `moveHistory`, `winner`,
  `winningLine`, and `lastMove`
- `isComputerTurnPending`: UI-only state in the app layer to prevent duplicate
  input while the computer is about to move

## Computer Strategy

The computer uses a heuristic move picker with this priority order:

1. Play a winning move if one exists.
2. Block the opponent's immediate winning move if one exists.
3. Score candidate moves near existing stones using:
   - line extension potential for the computer
   - threat blocking value against the opponent
   - center preference as a tie-breaker
4. Fall back to the center or nearest open point if the board is empty.

This keeps the implementation small while making the computer feel
intentional.

## Interaction Design

- Mode changes restart the game to a fresh board.
- Board-size changes keep working in both modes and also restart the game.
- Restart starts a fresh game using the current mode and board size.
- Undo behaves differently by mode:
  - local mode: remove one move
  - computer mode: remove two plies when available

## Testing Strategy

- Add pure tests for computer helper functions so the move picker is
  deterministic.
- Test immediate win selection, immediate block selection, and center/opening
  behavior.
- Test app helper logic for mode switch defaults and undo depth.

## Risks and Mitigations

- Non-deterministic computer behavior would make tests flaky.
  Mitigation: use stable scoring and stable tie-breaking.
- UI races could allow the player to click while the computer is moving.
  Mitigation: gate input on an explicit pending-computer-turn flag.
- Undo semantics in computer mode could feel wrong.
  Mitigation: make undo consistently remove the last computer response and the
  human move that triggered it.
