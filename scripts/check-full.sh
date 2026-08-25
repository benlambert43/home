#!/bin/sh
set -u

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd) || exit 1
cd "$root" || exit 1
. "$root/scripts/lib.sh"

with_build=1
[ "${1:-}" = "--no-build" ] && with_build=0

run() {
  label="$1"
  scope="${2:-}"
  if [ -z "$scope" ]; then
    scope=$(workspace_list "$label")
    [ -n "$scope" ] || scope="no workspaces define this"
  fi
  try_step "$label" "$scope" npm run --silent "$label"
}

run format:check "root, $(workspace_list)"
run lint
run typecheck
run lint:deprecations "root, $(workspace_list)"

if [ "$with_build" -eq 1 ]; then
  run build
else
  try_step build:shared "home-shared — tests import its build output" \
    npm run --silent build:shared
  skip build "--no-build"
fi
run test

summarize "all checks passed"
