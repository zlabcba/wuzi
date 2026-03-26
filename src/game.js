export const BOARD_SIZE = 19;
export const SUPPORTED_BOARD_SIZES = [13, 15, 19];

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

function normalizeBoardSize(boardSize) {
  return SUPPORTED_BOARD_SIZES.includes(boardSize) ? boardSize : BOARD_SIZE;
}

export function createEmptyBoard(boardSize = BOARD_SIZE) {
  const normalizedBoardSize = normalizeBoardSize(boardSize);

  return Array.from({ length: normalizedBoardSize }, () =>
    Array(normalizedBoardSize).fill(null)
  );
}

export function createGameState(boardSize = BOARD_SIZE) {
  const normalizedBoardSize = normalizeBoardSize(boardSize);

  return {
    boardSize: normalizedBoardSize,
    board: createEmptyBoard(normalizedBoardSize),
    currentPlayer: "black",
    moveHistory: [],
    winner: null,
    winningLine: null,
    lastMove: null,
  };
}

function isInsideBoard(row, col, boardSize) {
  return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
}

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

function countDirection(board, row, col, rowStep, colStep, stone, boardSize) {
  let count = 0;
  let nextRow = row + rowStep;
  let nextCol = col + colStep;

  while (
    isInsideBoard(nextRow, nextCol, boardSize) &&
    board[nextRow][nextCol] === stone
  ) {
    count += 1;
    nextRow += rowStep;
    nextCol += colStep;
  }

  return count;
}

function collectDirection(board, row, col, rowStep, colStep, stone, boardSize) {
  const positions = [];
  let nextRow = row + rowStep;
  let nextCol = col + colStep;

  while (
    isInsideBoard(nextRow, nextCol, boardSize) &&
    board[nextRow][nextCol] === stone
  ) {
    positions.push({ row: nextRow, col: nextCol });
    nextRow += rowStep;
    nextCol += colStep;
  }

  return positions;
}

function findWinningLine(board, row, col, stone, boardSize) {
  for (const [rowStep, colStep] of DIRECTIONS) {
    const backward = collectDirection(
      board,
      row,
      col,
      -rowStep,
      -colStep,
      stone,
      boardSize
    ).reverse();
    const forward = collectDirection(
      board,
      row,
      col,
      rowStep,
      colStep,
      stone,
      boardSize
    );
    const line = [...backward, { row, col }, ...forward];

    if (line.length >= 5) {
      return line;
    }
  }

  return null;
}

export function placeStone(state, row, col) {
  if (
    !isInsideBoard(row, col, state.boardSize) ||
    state.winner ||
    state.board[row][col]
  ) {
    return state;
  }

  const board = cloneBoard(state.board);
  const stone = state.currentPlayer;
  const move = { row, col, player: stone };

  board[row][col] = stone;

  const winningLine = findWinningLine(board, row, col, stone, state.boardSize);
  const winner = winningLine ? stone : null;

  return {
    boardSize: state.boardSize,
    board,
    currentPlayer: winner ? stone : stone === "black" ? "white" : "black",
    moveHistory: [...state.moveHistory, move],
    winner,
    winningLine,
    lastMove: move,
  };
}

export function undoMove(state) {
  if (state.moveHistory.length === 0) {
    return state;
  }

  const nextMoves = state.moveHistory.slice(0, -1);
  let nextState = createGameState(state.boardSize);

  for (const move of nextMoves) {
    nextState = placeStone(nextState, move.row, move.col);
  }

  return nextState;
}

export function restartGame(stateOrBoardSize = BOARD_SIZE, nextBoardSize) {
  if (typeof nextBoardSize === "number") {
    return createGameState(nextBoardSize);
  }

  if (typeof stateOrBoardSize === "number") {
    return createGameState(stateOrBoardSize);
  }

  return createGameState(stateOrBoardSize.boardSize);
}
