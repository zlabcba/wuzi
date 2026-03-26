import { BOARD_SIZE } from "./game.js";

export const BOARD_PADDING = 40;
export const CELL_SIZE = (760 - BOARD_PADDING * 2) / (BOARD_SIZE - 1);
export const STONE_RADIUS = CELL_SIZE * 0.38;

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

export function getWinningLineAnimationState(progress) {
  const clampedProgress = clamp01(progress);

  return {
    progress: clampedProgress,
    alpha: clampedProgress,
  };
}

export function getWinningStoneScale(progress, index) {
  const clampedProgress = clamp01(progress);
  const stagger = index * 0.08;
  const pulseStart = 0.18 + stagger;
  const pulsePeak = 0.32 + stagger;
  const pulseEnd = 0.54 + stagger;

  if (clampedProgress <= pulseStart || clampedProgress >= pulseEnd) {
    return 1;
  }

  if (clampedProgress <= pulsePeak) {
    const riseProgress = (clampedProgress - pulseStart) / (pulsePeak - pulseStart);
    return 1 + riseProgress * 0.22;
  }

  const fallProgress = (clampedProgress - pulsePeak) / (pulseEnd - pulsePeak);
  return 1.22 - fallProgress * 0.22;
}

function drawBoardSurface(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const boardGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  boardGradient.addColorStop(0, "#ddb47b");
  boardGradient.addColorStop(1, "#b57d48");

  ctx.fillStyle = boardGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrid(ctx) {
  ctx.strokeStyle = "rgba(58, 38, 20, 0.75)";
  ctx.lineWidth = 1;

  for (let index = 0; index < BOARD_SIZE; index += 1) {
    const offset = BOARD_PADDING + index * CELL_SIZE;
    const end = BOARD_PADDING + CELL_SIZE * (BOARD_SIZE - 1);

    ctx.beginPath();
    ctx.moveTo(BOARD_PADDING, offset);
    ctx.lineTo(end, offset);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(offset, BOARD_PADDING);
    ctx.lineTo(offset, end);
    ctx.stroke();
  }
}

function drawStarPoints(ctx) {
  const starPointIndexes = [3, 9, 15];

  ctx.fillStyle = "rgba(50, 32, 19, 0.92)";

  for (const row of starPointIndexes) {
    for (const col of starPointIndexes) {
      ctx.beginPath();
      ctx.arc(
        BOARD_PADDING + col * CELL_SIZE,
        BOARD_PADDING + row * CELL_SIZE,
        3.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
}

function drawStone(ctx, row, col, stone, scale = 1) {
  const x = BOARD_PADDING + col * CELL_SIZE;
  const y = BOARD_PADDING + row * CELL_SIZE;
  const radius = STONE_RADIUS * scale;
  const gradient = ctx.createRadialGradient(
    x - radius * 0.35,
    y - radius * 0.35,
    radius * 0.1,
    x,
    y,
    radius
  );

  if (stone === "black") {
    gradient.addColorStop(0, "#666666");
    gradient.addColorStop(1, "#111111");
  } else {
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#d7d7d7");
  }

  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawWinningLine(ctx, winningLine, animationProgress) {
  if (!winningLine || winningLine.length < 2) {
    return;
  }

  const animationState = getWinningLineAnimationState(animationProgress);
  const first = winningLine[0];
  const last = winningLine[winningLine.length - 1];
  const startX = BOARD_PADDING + first.col * CELL_SIZE;
  const startY = BOARD_PADDING + first.row * CELL_SIZE;
  const finalX = BOARD_PADDING + last.col * CELL_SIZE;
  const finalY = BOARD_PADDING + last.row * CELL_SIZE;
  const endX = startX + (finalX - startX) * animationState.progress;
  const endY = startY + (finalY - startY) * animationState.progress;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.strokeStyle = `rgba(220, 38, 38, ${animationState.alpha * 0.9})`;
  ctx.shadowColor = "rgba(255, 244, 180, 0.75)";
  ctx.shadowBlur = 18 + animationState.progress * 6;
  ctx.stroke();
  ctx.restore();
}

function drawLastMoveMarker(ctx, lastMove) {
  if (!lastMove) {
    return;
  }

  const x = BOARD_PADDING + lastMove.col * CELL_SIZE;
  const y = BOARD_PADDING + lastMove.row * CELL_SIZE;

  ctx.beginPath();
  ctx.strokeStyle = lastMove.player === "black" ? "#f8fafc" : "#1f2937";
  ctx.lineWidth = 2;
  ctx.arc(x, y, STONE_RADIUS * 0.32, 0, Math.PI * 2);
  ctx.stroke();
}

export function drawGame(canvas, state, animationProgress = 1) {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  drawBoardSurface(ctx, canvas);
  drawGrid(ctx);
  drawStarPoints(ctx);

  const winningLineSet = new Set(
    (state.winningLine ?? []).map((point) => `${point.row}:${point.col}`)
  );

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const stone = state.board[row][col];

      if (stone) {
        const key = `${row}:${col}`;
        const winningIndex = state.winningLine
          ? state.winningLine.findIndex((point) => point.row === row && point.col === col)
          : -1;
        const scale = winningLineSet.has(key)
          ? getWinningStoneScale(animationProgress, winningIndex)
          : 1;

        drawStone(ctx, row, col, stone, scale);
      }
    }
  }

  drawWinningLine(ctx, state.winningLine, animationProgress);
  drawLastMoveMarker(ctx, state.lastMove);
}
