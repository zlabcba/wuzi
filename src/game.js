export const BOARD_SIZE = 19;

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

export function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

export function createGameState() {
  return {
    board: createEmptyBoard(),
    currentPlayer: "black",
    moveHistory: [],
    winner: null,
    winningLine: null,
    lastMove: null,
  };
}

function isInsideBoard(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

function countDirection(board, row, col, rowStep, colStep, stone) {
  let count = 0;
  let nextRow = row + rowStep;
  let nextCol = col + colStep;

  while (isInsideBoard(nextRow, nextCol) && board[nextRow][nextCol] === stone) {
    count += 1;
    nextRow += rowStep;
    nextCol += colStep;
  }

  return count;
}

function collectDirection(board, row, col, rowStep, colStep, stone) {
  const positions = [];
  let nextRow = row + rowStep;
  let nextCol = col + colStep;

  while (isInsideBoard(nextRow, nextCol) && board[nextRow][nextCol] === stone) {
    positions.push({ row: nextRow, col: nextCol });
    nextRow += rowStep;
    nextCol += colStep;
  }

  return positions;
}

function findWinningLine(board, row, col, stone) {
  for (const [rowStep, colStep] of DIRECTIONS) {
    const backward = collectDirection(board, row, col, -rowStep, -colStep, stone).reverse();
    const forward = collectDirection(board, row, col, rowStep, colStep, stone);
    const line = [...backward, { row, col }, ...forward];

    if (line.length >= 5) {
      return line;
    }
  }

  return null;
}

export function placeStone(state, row, col) {
  if (!isInsideBoard(row, col) || state.winner || state.board[row][col]) {
    return state;
  }

  const board = cloneBoard(state.board);
  const stone = state.currentPlayer;
  const move = { row, col, player: stone };

  board[row][col] = stone;

  const winningLine = findWinningLine(board, row, col, stone);
  const winner = winningLine ? stone : null;

  return {
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
  let nextState = createGameState();

  for (const move of nextMoves) {
    nextState = placeStone(nextState, move.row, move.col);
  }

  return nextState;
}

export function restartGame() {
  return createGameState();
}
