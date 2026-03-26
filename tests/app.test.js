import { BOARD_PADDING, getBoardMetrics } from "../src/render.js";
import {
  getBoardPositionFromClick,
  getBoardSizeOptions,
  getDefaultBoardSize,
  getModeOptions,
  getStatusViewModel,
  getUndoStepCount,
} from "../src/app.js";
import { assertEqual, test } from "./test-framework.js";

function createCanvasRect() {
  return {
    left: 0,
    top: 0,
  };
}

test("getBoardPositionFromClick maps a click near an intersection", () => {
  const { cellSize } = getBoardMetrics(19);
  const canvas = {
    getBoundingClientRect: createCanvasRect,
    dataset: {
      boardSize: "19",
    },
  };
  const event = {
    clientX: BOARD_PADDING + cellSize * 4 + 2,
    clientY: BOARD_PADDING + cellSize * 7 - 3,
  };

  const point = getBoardPositionFromClick(event, canvas);

  assertEqual(point.row, 7, "row should round to the nearest grid intersection");
  assertEqual(point.col, 4, "col should round to the nearest grid intersection");
});

test("getBoardPositionFromClick rejects clicks far from intersections", () => {
  const { cellSize } = getBoardMetrics(19);
  const canvas = {
    getBoundingClientRect: createCanvasRect,
    dataset: {
      boardSize: "19",
    },
  };
  const event = {
    clientX: BOARD_PADDING + cellSize * 4 + cellSize * 0.49,
    clientY: BOARD_PADDING + cellSize * 7,
  };

  const point = getBoardPositionFromClick(event, canvas);

  assertEqual(point, null, "distant clicks should not place a stone");
});

test("getBoardPositionFromClick rejects coordinates outside the board", () => {
  const { cellSize } = getBoardMetrics(19);
  const canvas = {
    getBoundingClientRect: createCanvasRect,
    dataset: {
      boardSize: "19",
    },
  };
  const event = {
    clientX: BOARD_PADDING - cellSize,
    clientY: BOARD_PADDING - cellSize,
  };

  const point = getBoardPositionFromClick(event, canvas);

  assertEqual(point, null, "out-of-bounds clicks should be ignored");
});

test("getBoardPositionFromClick uses the active board size from the canvas", () => {
  const { cellSize } = getBoardMetrics(15);
  const canvas = {
    getBoundingClientRect: createCanvasRect,
    dataset: {
      boardSize: "15",
    },
  };
  const event = {
    clientX: BOARD_PADDING + cellSize * 10 + 1,
    clientY: BOARD_PADDING + cellSize * 11 - 2,
  };

  const point = getBoardPositionFromClick(event, canvas);

  assertEqual(point.row, 11, "row should use the active board metrics");
  assertEqual(point.col, 10, "col should use the active board metrics");
});

test("getStatusViewModel returns a winner presentation", () => {
  const viewModel = getStatusViewModel({
    currentPlayer: "black",
    winner: "white",
  });

  assertEqual(viewModel.text, "White wins", "winner text should be explicit");
  assertEqual(viewModel.tone, "winner", "winner state should switch the tone");
  assertEqual(viewModel.overlayText, "White Wins", "overlay should use an emphasized label");
});

test("getStatusViewModel returns a turn presentation during play", () => {
  const viewModel = getStatusViewModel({
    currentPlayer: "white",
    winner: null,
  });

  assertEqual(viewModel.text, "White to move", "turn text should still be available");
  assertEqual(viewModel.tone, "playing", "normal play should keep the playing tone");
  assertEqual(viewModel.overlayText, "", "playing state should not show a win overlay");
});

test("getDefaultBoardSize prefers a smaller board on narrow screens", () => {
  assertEqual(getDefaultBoardSize(390), 15, "phones should default to 15x15");
  assertEqual(getDefaultBoardSize(1024), 19, "desktop widths should default to 19x19");
});

test("getBoardSizeOptions marks the active board size", () => {
  const options = getBoardSizeOptions(15);

  assertEqual(options.length, 3, "three board size options should be available");
  assertEqual(options[1].label, "15x15", "the middle option should describe the 15 board");
  assertEqual(options[1].isActive, true, "the current board size should be marked active");
  assertEqual(options[0].isActive, false, "other sizes should not be active");
});

test("getModeOptions marks the active game mode", () => {
  const options = getModeOptions("computer");

  assertEqual(options.length, 2, "two game modes should be available");
  assertEqual(options[1].label, "Vs Computer", "computer mode should have a readable label");
  assertEqual(options[1].isActive, true, "the selected mode should be active");
});

test("getUndoStepCount removes a full exchange in computer mode", () => {
  assertEqual(getUndoStepCount("local", 4), 1, "local mode should undo one move");
  assertEqual(
    getUndoStepCount("computer", 4),
    2,
    "computer mode should undo a human and computer pair"
  );
  assertEqual(
    getUndoStepCount("computer", 1),
    1,
    "computer mode should still undo one move if no computer reply exists"
  );
});
