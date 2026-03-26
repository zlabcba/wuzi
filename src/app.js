import {
  BOARD_SIZE,
  SUPPORTED_BOARD_SIZES,
  createGameState,
  placeStone,
  restartGame,
  undoMove,
} from "./game.js";
import { BOARD_PADDING, CANVAS_SIZE, getBoardMetrics, drawGame } from "./render.js";

const WIN_ANIMATION_DURATION = 1100;
const MOBILE_BREAKPOINT = 700;

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

export function getStatusViewModel(state) {
  if (state.winner) {
    return {
      text: state.winner === "black" ? "Black wins" : "White wins",
      tone: "winner",
      overlayText: state.winner === "black" ? "Black Wins" : "White Wins",
    };
  }

  return {
    text: state.currentPlayer === "black" ? "Black to move" : "White to move",
    tone: "playing",
    overlayText: "",
  };
}

function getSubtitleText(boardSize) {
  return `Local two-player, ${boardSize}x${boardSize} board`;
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
    !undoButton ||
    !restartButton
  ) {
    return;
  }

  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  let state = createGameState(getDefaultBoardSize(window.innerWidth));
  let winnerAnimationStart = null;
  let animationFrameId = null;

  function stopWinnerAnimation() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
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
    const viewModel = getStatusViewModel(state);
    const animationProgress = getAnimationProgress();
    const boardSizeOptions = getBoardSizeOptions(state.boardSize);

    canvas.dataset.boardSize = `${state.boardSize}`;
    subtitleNode.textContent = getSubtitleText(state.boardSize);
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
    drawGame(canvas, state, animationProgress);
    statusNode.textContent = viewModel.text;
    statusCard.classList.toggle("is-winner", viewModel.tone === "winner");
    boardShell.classList.toggle("has-winner", viewModel.tone === "winner");
    winnerOverlay.classList.toggle("is-visible", viewModel.tone === "winner");
    winnerOverlay.textContent = viewModel.overlayText;
    undoButton.disabled = state.moveHistory.length === 0;
    canvas.setAttribute("data-ready", "true");
    queueAnimationFrameIfNeeded(animationProgress);
  }

  function applyBoardSize(boardSize) {
    state = restartGame(state, boardSize);
    resetWinnerAnimation();
    render();
  }

  canvas.addEventListener("click", (event) => {
    const point = getBoardPositionFromClick(event, canvas);

    if (!point) {
      return;
    }

    const nextState = placeStone(state, point.row, point.col);

    if (nextState !== state) {
      if (!state.winner && nextState.winner) {
        winnerAnimationStart = getNow();
        stopWinnerAnimation();
      }

      state = nextState;
      render();
    }
  });

  undoButton.addEventListener("click", () => {
    const nextState = undoMove(state);

    if (nextState !== state) {
      state = nextState;

      if (!state.winner) {
        resetWinnerAnimation();
      }

      render();
    }
  });

  restartButton.addEventListener("click", () => {
    state = restartGame(state);
    resetWinnerAnimation();
    render();
  });

  boardSizeControls.addEventListener("click", (event) => {
    const control = event.target.closest("[data-board-size]");

    if (!control) {
      return;
    }

    const nextBoardSize = Number.parseInt(control.dataset.boardSize, 10);

    if (SUPPORTED_BOARD_SIZES.includes(nextBoardSize) && nextBoardSize !== state.boardSize) {
      applyBoardSize(nextBoardSize);
    }
  });

  render();
}

if (typeof document !== "undefined") {
  mountApp();
}
