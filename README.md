# Gomoku

A small desktop browser Gomoku game built with plain HTML, CSS, and JavaScript.

## Run the game

1. Start a local static server from `<project-root>`.
2. Run `./serve.sh` or `python3 -m http.server 8000`.
3. Open `http://127.0.0.1:8000/index.html` in Chrome.

## Run the tests

1. Start the local static server if it is not already running.
2. Open `http://127.0.0.1:8000/tests/test-runner.html` in Chrome.
3. Confirm the page shows only `PASS` lines.

## Why a local server is required

This project uses browser ES modules. Chrome may block module imports when the
page is opened directly with `file://`, which can leave the page showing only
the static HTML shell.

## Features

- Responsive layout for desktop and mobile
- 13x13, 15x15, and 19x19 board sizes
- Desktop defaults to 19x19, phones default to 15x15
- Local two-player play
- Win detection in four directions
- Undo
- Restart
- Current player status
- Last-move highlight
