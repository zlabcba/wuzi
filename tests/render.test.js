import {
  getWinningLineAnimationState,
  getWinningStoneScale,
} from "../src/render.js";
import { assertEqual, test } from "./test-framework.js";

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
