import { chooseComputerMove } from "../src/computer.js";
import { createGameState, placeStone } from "../src/game.js";
import { assert, assertEqual, test } from "./test-framework.js";

test("chooseComputerMove opens near the center on an empty board", () => {
  const state = createGameState(15, "computer");
  const move = chooseComputerMove(state);

  assertEqual(move.row, 7, "computer should open at the center row on a 15x15 board");
  assertEqual(move.col, 7, "computer should open at the center col on a 15x15 board");
});

test("chooseComputerMove takes an immediate winning move", () => {
  let state = createGameState(15, "computer");

  state = placeStone(state, 0, 0);
  state = placeStone(state, 7, 7);
  state = placeStone(state, 0, 1);
  state = placeStone(state, 7, 8);
  state = placeStone(state, 0, 2);
  state = placeStone(state, 7, 9);
  state = placeStone(state, 0, 3);
  state = placeStone(state, 7, 10);

  const move = chooseComputerMove(state);

  assertEqual(move.row, 7, "computer should finish its own line");
  assert(
    move.col === 6 || move.col === 11,
    "computer should choose one of the two immediate winning points"
  );
});

test("chooseComputerMove blocks an immediate human win", () => {
  let state = createGameState(15, "computer");

  state = placeStone(state, 7, 7);
  state = placeStone(state, 0, 0);
  state = placeStone(state, 7, 8);
  state = placeStone(state, 0, 1);
  state = placeStone(state, 7, 9);
  state = placeStone(state, 1, 0);
  state = placeStone(state, 7, 10);
  state = placeStone(state, 1, 1);

  const move = chooseComputerMove(state);

  assertEqual(move.row, 7, "computer should block on the threatened row");
  assert(
    move.col === 6 || move.col === 11,
    "computer should block one of the two immediate losing points"
  );
});
