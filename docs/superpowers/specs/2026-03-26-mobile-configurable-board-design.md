# Mobile Configurable Board Design

## Overview

This change extends the existing browser Gomoku game so it remains easy to use
on phones while preserving the current desktop experience. The game will keep
the same zero-build stack and reuse the current rule, rendering, and animation
structure.

## Goals

- Make the game playable on mobile screens without horizontal overflow.
- Keep desktop play centered around the current 19x19 experience.
- Allow users to switch between 13x13, 15x15, and 19x19 boards.

## User Experience

- Desktop defaults to a 19x19 board.
- Narrow screens default to a 15x15 board.
- A board size control lets players switch to 13x13, 15x15, or 19x19 at any time.
- Changing the board size immediately starts a fresh game on the new board.
- The board scales to the available width while preserving accurate click-to-grid mapping.

## State Model

The runtime state keeps the current board size as part of the game state:

- `boardSize`: the active board dimension
- `board`: a square 2D array sized by `boardSize`
- `currentPlayer`, `moveHistory`, `winner`, `winningLine`, and `lastMove`

## Rendering

- The canvas keeps a fixed internal drawing size for visual consistency.
- Grid spacing, stone size, star points, and click mapping are recalculated from `boardSize`.
- Star points adapt to board size:
  - 19x19 uses 3/9/15
  - 15x15 uses 3/7/11
  - 13x13 uses 3/6/9

## Layout

- Desktop keeps the two-column layout.
- Mobile switches to a single-column layout with controls below the board.
- The board uses fluid width with a max size instead of a fixed displayed width.

## Interaction Design

- `Undo` and `Restart` continue to work unchanged.
- Board-size changes reset the game and update the subtitle/status UI.
- Winner overlays and animations remain enabled across all supported sizes.

## Testing Strategy

- Add logic tests for alternate board sizes and reset behavior.
- Add app tests for mobile default size selection and size-switch status text.
- Add render/helper tests for dynamic grid metrics where possible.

## Risks and Mitigations

- Dynamic board sizing can break win detection if the size is only updated in rendering.
  Mitigation: store `boardSize` in game state and derive everything else from it.
- Scaled canvas layouts can make taps inaccurate.
  Mitigation: keep click mapping based on current metrics and DOM rect scaling.
- Mobile layouts can crowd controls.
  Mitigation: move to a single-column layout on small screens and keep controls compact.
