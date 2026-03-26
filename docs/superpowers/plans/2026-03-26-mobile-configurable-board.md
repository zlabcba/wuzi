# Mobile Configurable Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add responsive mobile support with a configurable 13x13, 15x15, or 19x19 board while keeping desktop defaults and existing gameplay features intact.

**Architecture:** Move board size from a fixed constant into game state and derive render metrics from helper functions. Keep the current single-page structure, but extend the app shell with a board-size control and responsive layout rules.

**Tech Stack:** HTML, CSS, JavaScript ES modules, Canvas API, browser-native test runner

---

### Task 1: Make game state board size configurable

**Files:**
- Modify: `src/game.js`
- Modify: `tests/game.test.js`

- [ ] Add failing tests for `createGameState(15)` and `restartGame(state, 13)`.
- [ ] Run `node tests/all.test.js` and confirm the new tests fail.
- [ ] Implement configurable `boardSize`, board creation, bounds checks, and restart behavior.
- [ ] Re-run `node tests/all.test.js` and confirm those tests pass.

### Task 2: Make render and click mapping derive metrics from board size

**Files:**
- Modify: `src/render.js`
- Modify: `src/app.js`
- Modify: `tests/app.test.js`
- Modify: `tests/render.test.js`

- [ ] Add failing tests for dynamic metrics and click mapping on a non-19 board.
- [ ] Run `node tests/all.test.js` and confirm the new tests fail.
- [ ] Replace fixed board constants with helpers derived from `boardSize`.
- [ ] Re-run `node tests/all.test.js` and confirm those tests pass.

### Task 3: Add board-size controls and mobile-responsive layout

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `src/app.js`
- Modify: `README.md`

- [ ] Add the board-size selector UI and wire it to restart on size change.
- [ ] Update the subtitle/status text to reflect the active board size.
- [ ] Add responsive layout rules for narrow screens and fluid board sizing.
- [ ] Update README run/feature notes to mention mobile support and size switching.

### Task 4: Final verification

**Files:**
- Verify only

- [ ] Run `node tests/all.test.js`.
- [ ] Confirm the worktree git status is clean except for intended changes.
- [ ] Manually verify `13x13`, `15x15`, and `19x19` through the local server in a desktop-width and phone-width viewport.
