# Gomoku Design

## Overview

This project is a small desktop browser Gomoku game for Chrome on macOS.
It is a local two-player game with a 19x19 board and a minimal static web
stack: HTML, CSS, and JavaScript without any build tools.

## Goals

- Provide a playable local two-player Gomoku game in the browser.
- Keep the implementation small, readable, and easy to run.
- Optimize for desktop Chrome on macOS.

## Out of Scope

- Computer opponent
- Online multiplayer
- Mobile support
- Advanced tournament rules such as forbidden moves
- Build tooling or framework setup

## User Experience

The game opens as a single page with:

- A title showing the game name, `Gomoku`
- A large 19x19 board at the center of the experience
- A status area showing the current player or the winner
- Two controls: `Undo` and `Restart`

The visual style should feel clean and focused, with a wood-like board,
high-contrast stones, and restrained UI chrome so the board remains the
main focal point.

## Architecture

The project uses a zero-build static layout:

- `index.html`: page structure and UI regions
- `style.css`: board page styling and desktop layout
- `app.js`: game state, interaction handling, rules, and rendering
- `README.md`: how to run the project locally

The board itself is rendered with a single `canvas` element. The game redraws
the full board after each state change instead of using partial incremental
updates. This keeps the rendering path simple and reliable for a small game.

## Game Rules

- The game uses a 19x19 board.
- Black moves first, then players alternate turns.
- A player wins immediately after placing five consecutive stones in any of
  the four line directions.
- No forbidden move rules are applied.
- Once a winner is decided, the board is locked until the player restarts the
  game or undoes moves.

## State Model

The runtime state is intentionally small:

- `board`: a 19x19 2D array storing empty, black, or white for each point
- `currentPlayer`: the next player to move
- `moveHistory`: an ordered list of placed stones for undo support
- `winner`: the current winner, if any
- `lastMove`: the most recent move for lightweight visual highlighting

## Interaction Design

### Placing Stones

- A click on the canvas is converted to the nearest board intersection.
- If the selected point is already occupied, the click is ignored.
- If the game has already been won, placement clicks are ignored.
- A valid move updates state, checks for victory, advances the turn when
  applicable, and triggers a full redraw.

### Undo

- `Undo` removes the most recent move from `moveHistory`.
- The board, winner state, current player, and last move are recalculated
  from the updated history.
- If there are no moves, the button should be disabled.

### Restart

- `Restart` clears the board and resets all game state to a new match.

## Win Detection

After each valid move, the game checks only the newly placed stone in four
directions:

- horizontal
- vertical
- diagonal from top-left to bottom-right
- diagonal from top-right to bottom-left

The algorithm counts consecutive stones of the same color in both directions
for each axis and declares victory when the total reaches at least five.

## Rendering

The canvas renderer should draw:

- the board background
- grid lines for the 19x19 layout
- star points if desired, as a small optional visual enhancement
- all stones from the current board state
- a subtle last-move highlight

The renderer should avoid unnecessary visual complexity. Lightweight shadows
or shading for stones are acceptable, but the project should stay simple and
maintainable.

## Error Handling

The app does not need heavyweight error states. Invalid user actions are
handled by ignoring the input and preserving the current state:

- clicking outside usable board intersections
- clicking an occupied position
- clicking after the game has ended
- pressing `Undo` with no available move

## Testing Strategy

Because this is a small no-build project, testing should focus on lightweight
manual verification in Chrome:

- confirm alternating turns
- confirm invalid moves are ignored
- confirm five-in-a-row wins in all four directions
- confirm `Undo` rolls the game state back correctly
- confirm `Restart` clears the full state
- confirm last-move highlighting updates correctly

If the implementation naturally separates pure rule functions from rendering,
those functions can also be structured to be easy to test in isolation later.

## Implementation Notes

- The project should favor simple function boundaries over abstractions.
- Comments, if used, should stay brief and explain non-obvious logic only.
- All code and code comments should be written in English.
- User-facing communication during development should remain in Chinese.

## Risks and Mitigations

- Coordinate mapping errors on the canvas can make placement feel inaccurate.
  Mitigation: use a consistent board margin and spacing model and clamp click
  calculations carefully.
- Undo logic can desynchronize state if history is not treated as the source
  of truth.
  Mitigation: ensure undo updates all dependent state consistently.
- Win detection bugs can hide until diagonal cases are tested.
  Mitigation: explicitly verify all four directions during manual testing.
