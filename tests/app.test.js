import { BOARD_PADDING, CELL_SIZE } from "../src/render.js";
import { getBoardPositionFromClick, getStatusViewModel } from "../src/app.js";
import { assertEqual, test } from "./test-framework.js";

function createCanvasRect() {
  return {
    left: 0,
    top: 0,
  };
}

test("getBoardPositionFromClick maps a click near an intersection", () => {
  const canvas = {
    getBoundingClientRect: createCanvasRect,
  };
  const event = {
    clientX: BOARD_PADDING + CELL_SIZE * 4 + 2,
    clientY: BOARD_PADDING + CELL_SIZE * 7 - 3,
  };

  const point = getBoardPositionFromClick(event, canvas);

  assertEqual(point.row, 7, "row should round to the nearest grid intersection");
  assertEqual(point.col, 4, "col should round to the nearest grid intersection");
});

test("getBoardPositionFromClick rejects clicks far from intersections", () => {
  const canvas = {
    getBoundingClientRect: createCanvasRect,
  };
  const event = {
    clientX: BOARD_PADDING + CELL_SIZE * 4 + CELL_SIZE * 0.49,
    clientY: BOARD_PADDING + CELL_SIZE * 7,
  };

  const point = getBoardPositionFromClick(event, canvas);

  assertEqual(point, null, "distant clicks should not place a stone");
});

test("getBoardPositionFromClick rejects coordinates outside the board", () => {
  const canvas = {
    getBoundingClientRect: createCanvasRect,
  };
  const event = {
    clientX: BOARD_PADDING - CELL_SIZE,
    clientY: BOARD_PADDING - CELL_SIZE,
  };

  const point = getBoardPositionFromClick(event, canvas);

  assertEqual(point, null, "out-of-bounds clicks should be ignored");
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
