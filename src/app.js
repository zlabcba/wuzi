import {
  BOARD_SIZE,
  createGameState,
  placeStone,
  restartGame,
  undoMove,
} from "./game.js";
import { BOARD_PADDING, CELL_SIZE, drawGame } from "./render.js";

const WIN_ANIMATION_DURATION = 1100;

export function getBoardPositionFromClick(event, canvasNode) {
  const rect = canvasNode.getBoundingClientRect();
  const scaleX = rect.width ? canvasNode.width / rect.width : 1;
  const scaleY = rect.height ? canvasNode.height / rect.height : 1;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  const col = Math.round((x - BOARD_PADDING) / CELL_SIZE);
  const row = Math.round((y - BOARD_PADDING) / CELL_SIZE);

  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
    return null;
  }

  const centerX = BOARD_PADDING + col * CELL_SIZE;
  const centerY = BOARD_PADDING + row * CELL_SIZE;
  const distance = Math.hypot(x - centerX, y - centerY);

  return distance <= CELL_SIZE * 0.45 ? { row, col } : null;
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

function getNow() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function mountApp() {
  const canvas = document.querySelector("#board");
  const boardShell = document.querySelector("#board-shell");
  const winnerOverlay = document.querySelector("#winner-overlay");
  const statusNode = document.querySelector("#status");
  const statusCard = document.querySelector("#status-card");
  const undoButton = document.querySelector("#undo-button");
  const restartButton = document.querySelector("#restart-button");

  if (
    !canvas ||
    !boardShell ||
    !winnerOverlay ||
    !statusNode ||
    !statusCard ||
    !undoButton ||
    !restartButton
  ) {
    return;
  }

  let state = createGameState();
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
    state = restartGame();
    resetWinnerAnimation();
    render();
  });

  render();
}

if (typeof document !== "undefined") {
  mountApp();
}
