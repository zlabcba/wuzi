# Human Vs Computer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a switchable human-vs-computer Gomoku mode with a lightweight heuristic computer opponent while preserving local two-player play and the current responsive board behavior.

**Architecture:** Keep pure gameplay and computer move selection in testable modules, and extend the app layer to coordinate mode changes, computer turn scheduling, and mode-specific undo behavior. Reuse the current canvas renderer and status UI rather than introducing a framework or build step.

**Tech Stack:** HTML, CSS, JavaScript ES modules, Canvas API, browser-native test runner

---

### Task 1: Add pure game-mode and computer helpers

**Files:**
- Create: `src/computer.js`
- Modify: `src/game.js`
- Modify: `tests/game.test.js`
- Create: `tests/computer.test.js`
- Modify: `tests/all.test.js`

- [ ] Write failing tests for computer opening choice, immediate win choice, immediate block choice, and computer-mode undo depth.
- [ ] Run `node tests/all.test.js` to verify the new tests fail.
- [ ] Implement deterministic computer helper functions and any pure game-state helpers they need.
- [ ] Re-run `node tests/all.test.js` to verify the pure tests pass.

### Task 2: Add mode switching and computer turn flow in the app

**Files:**
- Modify: `src/app.js`
- Modify: `tests/app.test.js`

- [ ] Add failing tests for mode options and computer-mode helper behavior.
- [ ] Run `node tests/all.test.js` to verify the new tests fail.
- [ ] Implement mode state, computer turn scheduling, computer-mode undo semantics, and updated status text.
- [ ] Re-run `node tests/all.test.js` to verify the app-layer tests pass.

### Task 3: Extend the UI for computer mode

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `README.md`

- [ ] Add a mode switch control next to the existing board-size controls.
- [ ] Update styles so the extra controls still work on mobile and desktop.
- [ ] Update README feature descriptions and usage notes for computer mode.

### Task 4: Verify and preview

**Files:**
- Verify only

- [ ] Run `node tests/all.test.js`.
- [ ] Launch the local preview and manually verify local mode, computer mode, restart, board-size changes, and computer-mode undo.
