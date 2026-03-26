import {
  getBoardMetrics,
  getWinningLineAnimationState,
  getWinningStoneScale,
} from "../src/render.js";
import { assertEqual, test } from "./test-framework.js";

test("getBoardMetrics adapts cell size and star points to board size", () => {
  const nineteen = getBoardMetrics(19);
  const fifteen = getBoardMetrics(15);

  assertEqual(nineteen.starPointIndexes.join(","), "3,9,15", "19x19 should keep standard star points");
  assertEqual(fifteen.starPointIndexes.join(","), "3,7,11", "15x15 should use compact star points");
  assertEqual(fifteen.cellSize > nineteen.cellSize, true, "smaller boards should use larger cells");
});

test("getWinningLineAnimationState clamps progress and grows opacity", () => {
  const start = getWinningLineAnimationState(-0.25);
  const middle = getWinningLineAnimationState(0.5);
  const end = getWinningLineAnimationState(2);

  assertEqual(start.progress, 0, "negative progress should clamp to zero");
  assertEqual(start.alpha, 0, "line should be invisible at the start");
  assertEqual(middle.progress, 0.5, "middle progress should be preserved");
  assertEqual(end.progress, 1, "progress should clamp at one");
  assertEqual(end.alpha, 1, "line should be fully visible at the end");
});

test("getWinningStoneScale creates a short pulse during the win animation", () => {
  const idleScale = getWinningStoneScale(0.1, 0);
  const pulsingScale = getWinningStoneScale(0.45, 2);
  const finishedScale = getWinningStoneScale(1, 4);

  assertEqual(idleScale, 1, "stones should start at their normal scale");
  assertEqual(finishedScale, 1, "stones should settle back to normal size");
  assertEqual(pulsingScale > 1, true, "stones should briefly scale up during the pulse");
});
