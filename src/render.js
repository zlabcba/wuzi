export const CANVAS_SIZE = 760;
export const BOARD_PADDING = 40;

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function getStarPointIndexes(boardSize) {
  if (boardSize === 19) {
    return [3, 9, 15];
  }

  if (boardSize === 15) {
    return [3, 7, 11];
  }

  return [3, 6, 9];
}

export function getBoardMetrics(boardSize) {
  const cellSize = (CANVAS_SIZE - BOARD_PADDING * 2) / (boardSize - 1);

  return {
    boardSize,
    boardEnd: BOARD_PADDING + cellSize * (boardSize - 1),
    cellSize,
    starPointIndexes: getStarPointIndexes(boardSize),
    stoneRadius: cellSize * 0.38,
  };
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

function drawGrid(ctx, metrics) {
  ctx.strokeStyle = "rgba(58, 38, 20, 0.75)";
  ctx.lineWidth = 1;

  for (let index = 0; index < metrics.boardSize; index += 1) {
    const offset = BOARD_PADDING + index * metrics.cellSize;

    ctx.beginPath();
    ctx.moveTo(BOARD_PADDING, offset);
    ctx.lineTo(metrics.boardEnd, offset);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(offset, BOARD_PADDING);
    ctx.lineTo(offset, metrics.boardEnd);
    ctx.stroke();
  }
}

function drawStarPoints(ctx, metrics) {
  ctx.fillStyle = "rgba(50, 32, 19, 0.92)";

  for (const row of metrics.starPointIndexes) {
    for (const col of metrics.starPointIndexes) {
      ctx.beginPath();
      ctx.arc(
        BOARD_PADDING + col * metrics.cellSize,
        BOARD_PADDING + row * metrics.cellSize,
        Math.max(2.8, metrics.cellSize * 0.09),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
}

function drawStone(ctx, row, col, stone, metrics, scale = 1) {
  const x = BOARD_PADDING + col * metrics.cellSize;
  const y = BOARD_PADDING + row * metrics.cellSize;
  const radius = metrics.stoneRadius * scale;
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

function drawWinningLine(ctx, winningLine, metrics, animationProgress) {
  if (!winningLine || winningLine.length < 2) {
    return;
  }

  const animationState = getWinningLineAnimationState(animationProgress);
  const first = winningLine[0];
  const last = winningLine[winningLine.length - 1];
  const startX = BOARD_PADDING + first.col * metrics.cellSize;
  const startY = BOARD_PADDING + first.row * metrics.cellSize;
  const finalX = BOARD_PADDING + last.col * metrics.cellSize;
  const finalY = BOARD_PADDING + last.row * metrics.cellSize;
  const endX = startX + (finalX - startX) * animationState.progress;
  const endY = startY + (finalY - startY) * animationState.progress;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.lineWidth = Math.max(5, metrics.cellSize * 0.22);
  ctx.lineCap = "round";
  ctx.strokeStyle = `rgba(220, 38, 38, ${animationState.alpha * 0.9})`;
  ctx.shadowColor = "rgba(255, 244, 180, 0.75)";
  ctx.shadowBlur = 18 + animationState.progress * 6;
  ctx.stroke();
  ctx.restore();
}

function drawLastMoveMarker(ctx, lastMove, metrics) {
  if (!lastMove) {
    return;
  }

  const x = BOARD_PADDING + lastMove.col * metrics.cellSize;
  const y = BOARD_PADDING + lastMove.row * metrics.cellSize;

  ctx.beginPath();
  ctx.strokeStyle = lastMove.player === "black" ? "#f8fafc" : "#1f2937";
  ctx.lineWidth = 2;
  ctx.arc(x, y, metrics.stoneRadius * 0.32, 0, Math.PI * 2);
  ctx.stroke();
}

export function drawGame(canvas, state, animationProgress = 1) {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  const metrics = getBoardMetrics(state.boardSize);

  drawBoardSurface(ctx, canvas);
  drawGrid(ctx, metrics);
  drawStarPoints(ctx, metrics);

  const winningLineSet = new Set(
    (state.winningLine ?? []).map((point) => `${point.row}:${point.col}`)
  );

  for (let row = 0; row < state.boardSize; row += 1) {
    for (let col = 0; col < state.boardSize; col += 1) {
      const stone = state.board[row][col];

      if (stone) {
        const key = `${row}:${col}`;
        const winningIndex = state.winningLine
          ? state.winningLine.findIndex((point) => point.row === row && point.col === col)
          : -1;
        const scale = winningLineSet.has(key)
          ? getWinningStoneScale(animationProgress, winningIndex)
          : 1;

        drawStone(ctx, row, col, stone, metrics, scale);
      }
    }
  }

  drawWinningLine(ctx, state.winningLine, metrics, animationProgress);
  drawLastMoveMarker(ctx, state.lastMove, metrics);
}
