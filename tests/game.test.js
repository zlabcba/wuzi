import {
  BOARD_SIZE,
  createGameState,
  placeStone,
  restartGame,
  undoMove,
} from "../src/game.js";
import { assert, assertEqual, test } from "./test-framework.js";

test("createGameState builds a 19x19 empty board with black to move", () => {
  const state = createGameState();

  assertEqual(state.board.length, BOARD_SIZE, "board should have 19 rows");
  assertEqual(state.board[0].length, BOARD_SIZE, "board should have 19 columns");
  assertEqual(state.currentPlayer, "black", "black should move first");
  assertEqual(state.moveHistory.length, 0, "history should start empty");
  assertEqual(state.winner, null, "winner should start empty");
  assertEqual(state.winningLine, null, "winning line should start empty");
  assertEqual(state.lastMove, null, "last move should start empty");
});

test("createGameState accepts a smaller board size", () => {
  const state = createGameState(15);

  assertEqual(state.boardSize, 15, "board size should be stored in state");
  assertEqual(state.board.length, 15, "board should use the requested row count");
  assertEqual(state.board[0].length, 15, "board should use the requested column count");
});

test("createGameState stores the requested game mode", () => {
  const state = createGameState(19, "computer");

  assertEqual(state.gameMode, "computer", "game mode should be stored in state");
});

test("placeStone stores a black stone and flips the turn", () => {
  const state = createGameState();
  const nextState = placeStone(state, 9, 9);

  assertEqual(nextState.board[9][9], "black", "stone should be placed");
  assertEqual(nextState.currentPlayer, "white", "turn should flip to white");
  assertEqual(nextState.moveHistory.length, 1, "history should record the move");
  assertEqual(nextState.lastMove.row, 9, "last move row should be stored");
  assertEqual(nextState.lastMove.col, 9, "last move col should be stored");
});

test("placeStone ignores occupied points", () => {
  const state = placeStone(createGameState(), 9, 9);
  const sameState = placeStone(state, 9, 9);

  assertEqual(sameState, state, "occupied move should return the same state");
  assertEqual(sameState.moveHistory.length, 1, "occupied move should be ignored");
  assertEqual(sameState.currentPlayer, "white", "turn should not change");
});

test("placeStone ignores coordinates outside the board", () => {
  const state = createGameState();
  const nextState = placeStone(state, -1, 0);

  assertEqual(nextState, state, "out-of-bounds move should be ignored");
});

test("undoMove removes the most recent move and restores the turn", () => {
  const first = placeStone(createGameState(), 9, 9);
  const second = placeStone(first, 9, 10);
  const undone = undoMove(second);

  assertEqual(undone.board[9][10], null, "last stone should be removed");
  assertEqual(undone.currentPlayer, "white", "turn should return to white");
  assertEqual(undone.moveHistory.length, 1, "history should shrink");
  assertEqual(undone.lastMove.row, 9, "previous move should become last move");
  assertEqual(undone.lastMove.col, 9, "previous move should become last move");
});

test("undoMove can remove two plies for computer mode", () => {
  let state = createGameState(15, "computer");

  state = placeStone(state, 7, 7);
  state = placeStone(state, 7, 8);
  state = placeStone(state, 8, 7);
  state = placeStone(state, 8, 8);

  const undone = undoMove(state, 2);

  assertEqual(
    undone.moveHistory.length,
    2,
    "undoing two plies should remove the computer response pair"
  );
  assertEqual(undone.currentPlayer, "black", "turn should return to the human player");
  assertEqual(undone.board[8][7], null, "the human move should be removed");
  assertEqual(undone.board[8][8], null, "the computer move should be removed");
});

test("restartGame clears the board and resets all metadata", () => {
  const inProgress = placeStone(placeStone(createGameState(), 9, 9), 9, 10);
  const restarted = restartGame(inProgress);

  assertEqual(restarted.board.length, BOARD_SIZE, "board should still be 19 rows");
  assertEqual(restarted.moveHistory.length, 0, "history should clear");
  assertEqual(restarted.currentPlayer, "black", "black should move first again");
  assertEqual(restarted.winner, null, "winner should clear");
  assertEqual(restarted.winningLine, null, "winning line should clear");
  assertEqual(restarted.lastMove, null, "last move should clear");
});

test("restartGame can switch to a different board size", () => {
  const inProgress = placeStone(placeStone(createGameState(19), 9, 9), 9, 10);
  const restarted = restartGame(inProgress, 13);

  assertEqual(restarted.boardSize, 13, "restart should switch the stored board size");
  assertEqual(restarted.board.length, 13, "restart should rebuild the board with the new size");
  assertEqual(restarted.moveHistory.length, 0, "restart should clear history on size change");
});

test("placeStone marks a horizontal five-in-a-row win", () => {
  let state = createGameState();

  state = placeStone(state, 5, 5);
  state = placeStone(state, 0, 0);
  state = placeStone(state, 5, 6);
  state = placeStone(state, 0, 1);
  state = placeStone(state, 5, 7);
  state = placeStone(state, 0, 2);
  state = placeStone(state, 5, 8);
  state = placeStone(state, 0, 3);
  state = placeStone(state, 5, 9);

  assertEqual(state.winner, "black", "black should win after five in a row");
  assertEqual(state.currentPlayer, "black", "winner should keep the board locked");
  assertEqual(state.winningLine.length, 5, "winning line should include five stones");
  assertEqual(state.winningLine[0].row, 5, "winning line should keep the winning row");
  assertEqual(state.winningLine[0].col, 5, "winning line should start at the left edge");
  assertEqual(state.winningLine[4].col, 9, "winning line should end at the right edge");
});

test("placeStone marks vertical and diagonal wins", () => {
  let vertical = createGameState();

  vertical = placeStone(vertical, 4, 8);
  vertical = placeStone(vertical, 0, 0);
  vertical = placeStone(vertical, 5, 8);
  vertical = placeStone(vertical, 0, 1);
  vertical = placeStone(vertical, 6, 8);
  vertical = placeStone(vertical, 0, 2);
  vertical = placeStone(vertical, 7, 8);
  vertical = placeStone(vertical, 0, 3);
  vertical = placeStone(vertical, 8, 8);

  assertEqual(vertical.winner, "black", "black should win vertically");
  assertEqual(vertical.winningLine[0].row, 4, "vertical line should start at the top stone");
  assertEqual(vertical.winningLine[4].row, 8, "vertical line should end at the bottom stone");

  let diagonal = createGameState();

  diagonal = placeStone(diagonal, 3, 3);
  diagonal = placeStone(diagonal, 0, 0);
  diagonal = placeStone(diagonal, 4, 4);
  diagonal = placeStone(diagonal, 0, 1);
  diagonal = placeStone(diagonal, 5, 5);
  diagonal = placeStone(diagonal, 0, 2);
  diagonal = placeStone(diagonal, 6, 6);
  diagonal = placeStone(diagonal, 0, 3);
  diagonal = placeStone(diagonal, 7, 7);

  assertEqual(diagonal.winner, "black", "black should win diagonally");
  assertEqual(diagonal.winningLine[0].row, 3, "diagonal line should include the first stone");
  assertEqual(diagonal.winningLine[4].col, 7, "diagonal line should include the last stone");
});

test("placeStone marks an anti-diagonal five-in-a-row win", () => {
  let state = createGameState();

  state = placeStone(state, 4, 8);
  state = placeStone(state, 0, 0);
  state = placeStone(state, 5, 7);
  state = placeStone(state, 0, 1);
  state = placeStone(state, 6, 6);
  state = placeStone(state, 0, 2);
  state = placeStone(state, 7, 5);
  state = placeStone(state, 0, 3);
  state = placeStone(state, 8, 4);

  assertEqual(state.winner, "black", "black should win on the anti-diagonal");
  assertEqual(state.winningLine[0].row, 4, "anti-diagonal should start at the upper stone");
  assertEqual(state.winningLine[0].col, 8, "anti-diagonal should start at the right side");
  assertEqual(state.winningLine[4].row, 8, "anti-diagonal should end at the lower stone");
  assertEqual(state.winningLine[4].col, 4, "anti-diagonal should end at the left side");
});

test("placeStone ignores moves after the game is won", () => {
  let state = createGameState();

  state = placeStone(state, 5, 5);
  state = placeStone(state, 0, 0);
  state = placeStone(state, 5, 6);
  state = placeStone(state, 0, 1);
  state = placeStone(state, 5, 7);
  state = placeStone(state, 0, 2);
  state = placeStone(state, 5, 8);
  state = placeStone(state, 0, 3);
  state = placeStone(state, 5, 9);

  const afterWin = placeStone(state, 6, 9);

  assertEqual(afterWin, state, "moves after win should be ignored");
  assertEqual(afterWin.moveHistory.length, 9, "history should not grow after win");
});

test("undoMove from the initial state is a no-op", () => {
  const state = createGameState();
  const undone = undoMove(state);

  assertEqual(undone, state, "undo on an empty game should be ignored");
});

test("createGameState creates independent rows", () => {
  const state = createGameState();

  state.board[0][0] = "black";

  assert(state.board[1][0] === null, "rows should not share the same array");
});
