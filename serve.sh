#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="${1:-8000}"

cd "$ROOT_DIR"
python3 -m http.server "$PORT"
