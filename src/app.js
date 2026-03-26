import { chooseComputerMove } from "./computer.js";
import {
  BOARD_SIZE,
  SUPPORTED_BOARD_SIZES,
  SUPPORTED_GAME_MODES,
  createGameState,
  placeStone,
  restartGame,
  undoMove,
} from "./game.js";
import { BOARD_PADDING, CANVAS_SIZE, getBoardMetrics, drawGame } from "./render.js";

const WIN_ANIMATION_DURATION = 1100;
const MOBILE_BREAKPOINT = 700;
const COMPUTER_MOVE_DELAY = 220;

export function getDefaultBoardSize(viewportWidth) {
  return viewportWidth < MOBILE_BREAKPOINT ? 15 : BOARD_SIZE;
}

export function getBoardSizeOptions(activeBoardSize) {
  return SUPPORTED_BOARD_SIZES.map((boardSize) => ({
    boardSize,
    label: `${boardSize}x${boardSize}`,
    isActive: boardSize === activeBoardSize,
  }));
}

export function getModeOptions(activeMode) {
  return [
    { value: "local", label: "Two Players", isActive: activeMode === "local" },
    { value: "computer", label: "Vs Computer", isActive: activeMode === "computer" },
  ];
}

export function getUndoStepCount(gameMode, moveCount) {
  if (gameMode !== "computer") {
    return 1;
  }

  return moveCount >= 2 ? 2 : 1;
}

export function getBoardPositionFromClick(event, canvasNode) {
  const rect = canvasNode.getBoundingClientRect();
  const boardSize = Number.parseInt(canvasNode.dataset.boardSize ?? `${BOARD_SIZE}`, 10);
  const metrics = getBoardMetrics(boardSize);
  const scaleX = rect.width ? canvasNode.width / rect.width : 1;
  const scaleY = rect.height ? canvasNode.height / rect.height : 1;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  const col = Math.round((x - BOARD_PADDING) / metrics.cellSize);
  const row = Math.round((y - BOARD_PADDING) / metrics.cellSize);

  if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
    return null;
  }

  const centerX = BOARD_PADDING + col * metrics.cellSize;
  const centerY = BOARD_PADDING + row * metrics.cellSize;
  const distance = Math.hypot(x - centerX, y - centerY);

  return distance <= metrics.cellSize * 0.45 ? { row, col } : null;
}

export function getStatusViewModel(state, isComputerTurnPending = false) {
  if (state.winner) {
    return {
      text: state.winner === "black" ? "Black wins" : "White wins",
      tone: "winner",
      overlayText: state.winner === "black" ? "Black Wins" : "White Wins",
    };
  }

  if (state.gameMode === "computer") {
    return {
      text: isComputerTurnPending ? "Computer is thinking" : "Your turn",
      tone: isComputerTurnPending ? "thinking" : "playing",
      overlayText: "",
    };
  }

  return {
    text: state.currentPlayer === "black" ? "Black to move" : "White to move",
    tone: "playing",
    overlayText: "",
  };
}

function getSubtitleText(state) {
  const base = `${state.boardSize}x${state.boardSize} board`;
  return state.gameMode === "computer"
    ? `Human vs Computer, ${base}`
    : `Local two-player, ${base}`;
}

function getNow() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function mountApp() {
  const canvas = document.querySelector("#board");
  const boardShell = document.querySelector("#board-shell");
  const winnerOverlay = document.querySelector("#winner-overlay");
  const subtitleNode = document.querySelector("#subtitle");
  const statusNode = document.querySelector("#status");
  const statusCard = document.querySelector("#status-card");
  const boardSizeControls = document.querySelector("#board-size-controls");
  const modeControls = document.querySelector("#mode-controls");
  const undoButton = document.querySelector("#undo-button");
  const restartButton = document.querySelector("#restart-button");

  if (
    !canvas ||
    !boardShell ||
    !winnerOverlay ||
    !subtitleNode ||
    !statusNode ||
    !statusCard ||
    !boardSizeControls ||
    !modeControls ||
    !undoButton ||
    !restartButton
  ) {
    return;
  }

  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  let state = createGameState(getDefaultBoardSize(window.innerWidth), "local");
  let winnerAnimationStart = null;
  let animationFrameId = null;
  let computerTurnTimeoutId = null;
  let isComputerTurnPending = false;

  function stopWinnerAnimation() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  function clearComputerTurn() {
    isComputerTurnPending = false;

    if (computerTurnTimeoutId !== null) {
      clearTimeout(computerTurnTimeoutId);
      computerTurnTimeoutId = null;
    }
  }

  function resetWinnerAnimation() {
    winnerAnimationStart = null;
    stopWinnerAnimation();
  }

  function getAnimationProgress() {
    if (!state.winner || winnerAnimationStart === null) {
      return 1;
    }

    const elapsed = getNow() - winnerAnimationStart;
    return Math.max(0, Math.min(1, elapsed / WIN_ANIMATION_DURATION));
  }

  function queueAnimationFrameIfNeeded(progress) {
    if (!state.winner || progress >= 1 || animationFrameId !== null) {
      return;
    }

    animationFrameId = requestAnimationFrame(() => {
      animationFrameId = null;
      render();
    });
  }

  function render() {
    const viewModel = getStatusViewModel(state, isComputerTurnPending);
    const animationProgress = getAnimationProgress();
    const boardSizeOptions = getBoardSizeOptions(state.boardSize);
    const modeOptions = getModeOptions(state.gameMode);

    canvas.dataset.boardSize = `${state.boardSize}`;
    subtitleNode.textContent = getSubtitleText(state);
    boardSizeControls.innerHTML = boardSizeOptions
      .map(
        (option) => `
          <button
            class="board-size-button${option.isActive ? " is-active" : ""}"
            type="button"
            data-board-size="${option.boardSize}"
            aria-pressed="${option.isActive ? "true" : "false"}"
          >
            ${option.label}
          </button>
        `
      )
      .join("");
    modeControls.innerHTML = modeOptions
      .map(
        (option) => `
          <button
            class="mode-button${option.isActive ? " is-active" : ""}"
            type="button"
            data-mode="${option.value}"
            aria-pressed="${option.isActive ? "true" : "false"}"
          >
            ${option.label}
          </button>
        `
      )
      .join("");
    drawGame(canvas, state, animationProgress);
    statusNode.textContent = viewModel.text;
    statusCard.classList.toggle("is-winner", viewModel.tone === "winner");
    statusCard.classList.toggle("is-thinking", viewModel.tone === "thinking");
    boardShell.classList.toggle("has-winner", viewModel.tone === "winner");
    winnerOverlay.classList.toggle("is-visible", viewModel.tone === "winner");
    winnerOverlay.textContent = viewModel.overlayText;
    undoButton.disabled = state.moveHistory.length === 0 || isComputerTurnPending;
    boardSizeControls.toggleAttribute("disabled", isComputerTurnPending);
    modeControls.toggleAttribute("disabled", isComputerTurnPending);
    canvas.setAttribute("data-ready", "true");
    queueAnimationFrameIfNeeded(animationProgress);
  }

  function applyFreshGame(boardSize, gameMode) {
    state = restartGame(state, boardSize, gameMode);
    clearComputerTurn();
    resetWinnerAnimation();
    render();
  }

  function commitState(nextState) {
    if (!state.winner && nextState.winner) {
      winnerAnimationStart = getNow();
      stopWinnerAnimation();
    }

    state = nextState;
    render();
  }

  function scheduleComputerTurn() {
    if (state.gameMode !== "computer" || state.winner || state.currentPlayer !== "white") {
      return;
    }

    clearComputerTurn();
    isComputerTurnPending = true;
    render();

    computerTurnTimeoutId = setTimeout(() => {
      computerTurnTimeoutId = null;
      const move = chooseComputerMove(state);
      const nextState = placeStone(state, move.row, move.col);
      isComputerTurnPending = false;
      commitState(nextState);
    }, COMPUTER_MOVE_DELAY);
  }

  canvas.addEventListener("click", (event) => {
    if (isComputerTurnPending) {
      return;
    }

    const point = getBoardPositionFromClick(event, canvas);

    if (!point) {
      return;
    }

    const nextState = placeStone(state, point.row, point.col);

    if (nextState !== state) {
      commitState(nextState);
      scheduleComputerTurn();
    }
  });

  undoButton.addEventListener("click", () => {
    clearComputerTurn();

    const nextState = undoMove(state, getUndoStepCount(state.gameMode, state.moveHistory.length));

    if (nextState !== state) {
      state = nextState;
      resetWinnerAnimation();
      render();
    }
  });

  restartButton.addEventListener("click", () => {
    applyFreshGame(state.boardSize, state.gameMode);
  });

  boardSizeControls.addEventListener("click", (event) => {
    if (isComputerTurnPending) {
      return;
    }

    const control = event.target.closest("[data-board-size]");

    if (!control) {
      return;
    }

    const nextBoardSize = Number.parseInt(control.dataset.boardSize, 10);

    if (SUPPORTED_BOARD_SIZES.includes(nextBoardSize) && nextBoardSize !== state.boardSize) {
      applyFreshGame(nextBoardSize, state.gameMode);
    }
  });

  modeControls.addEventListener("click", (event) => {
    if (isComputerTurnPending) {
      return;
    }

    const control = event.target.closest("[data-mode]");

    if (!control) {
      return;
    }

    const nextMode = control.dataset.mode;

    if (SUPPORTED_GAME_MODES.includes(nextMode) && nextMode !== state.gameMode) {
      applyFreshGame(state.boardSize, nextMode);
    }
  });

  render();
}

if (typeof document !== "undefined") {
  mountApp();
}
