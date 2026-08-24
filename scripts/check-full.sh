#!/bin/sh
set -u

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd) || exit 1
cd "$root" || exit 1
. "$root/scripts/lib.sh"

with_build=1
[ "${1:-}" = "--no-build" ] && with_build=0

scope_of() {
  node -e '
const fs = require("fs");
const label = process.argv[1];
const covered = require("./package.json").workspaces.filter((dir) => {
  const pkg = JSON.parse(fs.readFileSync(`${dir}/package.json`, "utf8"));
  return Boolean(pkg.scripts?.[label]);
});
process.stdout.write(covered.join(", ") || "no workspaces define this");
' "$1"
}

run() {
  label="$1"
  scope="${2:-}"
  [ -n "$scope" ] || scope=$(scope_of "$label")
  try_step "$label" "$scope" npm run --silent "$label"
}

run format:check "root, covers every workspace"
run lint
run typecheck
run lint:deprecations "root + all workspaces"
run test
if [ "$with_build" -eq 1 ]; then
  run build
else
  skip build "--no-build"
fi

summarize "all checks passed"
