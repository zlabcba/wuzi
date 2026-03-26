import { placeStone } from "./game.js";

const COMPUTER_PLAYER = "white";
const HUMAN_PLAYER = "black";
const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

function isInsideBoard(row, col, boardSize) {
  return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
}

function getCandidateMoves(state) {
  if (state.moveHistory.length === 0) {
    const center = Math.floor(state.boardSize / 2);
    return [{ row: center, col: center }];
  }

  const candidates = new Map();

  for (const move of state.moveHistory) {
    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
        const row = move.row + rowOffset;
        const col = move.col + colOffset;

        if (
          isInsideBoard(row, col, state.boardSize) &&
          state.board[row][col] === null
        ) {
          candidates.set(`${row}:${col}`, { row, col });
        }
      }
    }
  }

  if (candidates.size > 0) {
    return [...candidates.values()];
  }

  const center = Math.floor(state.boardSize / 2);
  return [{ row: center, col: center }];
}

function countDirection(board, boardSize, row, col, rowStep, colStep, player) {
  let count = 0;
  let nextRow = row + rowStep;
  let nextCol = col + colStep;

  while (isInsideBoard(nextRow, nextCol, boardSize) && board[nextRow][nextCol] === player) {
    count += 1;
    nextRow += rowStep;
    nextCol += colStep;
  }

  return count;
}

function evaluateLine(board, boardSize, row, col, player) {
  let best = 0;

  for (const [rowStep, colStep] of DIRECTIONS) {
    const lineLength =
      1 +
      countDirection(board, boardSize, row, col, rowStep, colStep, player) +
      countDirection(board, boardSize, row, col, -rowStep, -colStep, player);

    best = Math.max(best, lineLength);
  }

  return best;
}

function getCenterDistanceScore(boardSize, row, col) {
  const center = (boardSize - 1) / 2;
  return -(Math.abs(row - center) + Math.abs(col - center));
}

function sortMoves(a, b) {
  if (a.score !== b.score) {
    return b.score - a.score;
  }

  if (a.row !== b.row) {
    return a.row - b.row;
  }

  return a.col - b.col;
}

export function chooseComputerMove(state) {
  const candidates = getCandidateMoves(state);
  const computerState = {
    ...state,
    currentPlayer: COMPUTER_PLAYER,
  };

  for (const candidate of candidates) {
    const preview = placeStone(computerState, candidate.row, candidate.col);

    if (preview.winner === COMPUTER_PLAYER) {
      return candidate;
    }
  }

  const blockingState = {
    ...state,
    currentPlayer: HUMAN_PLAYER,
  };

  for (const candidate of candidates) {
    const preview = placeStone(blockingState, candidate.row, candidate.col);

    if (preview.winner === HUMAN_PLAYER) {
      return candidate;
    }
  }

  const scored = candidates.map((candidate) => {
    const computerPreview = placeStone(computerState, candidate.row, candidate.col);
    const computerLineScore = evaluateLine(
      computerPreview.board,
      state.boardSize,
      candidate.row,
      candidate.col,
      COMPUTER_PLAYER
    );
    const humanPreview = placeStone(blockingState, candidate.row, candidate.col);
    const blockScore = evaluateLine(
      humanPreview.board,
      state.boardSize,
      candidate.row,
      candidate.col,
      HUMAN_PLAYER
    );

    return {
      ...candidate,
      score:
        computerLineScore * 10 +
        blockScore * 8 +
        getCenterDistanceScore(state.boardSize, candidate.row, candidate.col),
    };
  });

  scored.sort(sortMoves);

  return scored[0];
}
