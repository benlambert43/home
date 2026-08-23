#!/bin/sh
# Project quality gates. Single source of truth for the npm scripts and the git hooks.
#
#   scripts/check.sh             format:check, lint, typecheck, build  (~17s)
#                                — npm run check, pre-push
#   scripts/check.sh --no-build  the same, minus build                 (~9s)
#                                — npm run check:fast, pre-commit
#
# Every check fans out to each workspace that defines it. The header names those
# workspaces so it is visible what actually ran, rather than having to trust that
# a silent step did something.
#
# BYPASS_HINT, when set, is shown on failure; the hooks use it to surface --no-verify.

set -u

with_build=1
[ "${1:-}" = "--no-build" ] && with_build=0

# Workspaces defining $1 as an npm script, comma separated. Read from the
# package.json files themselves so the header cannot drift from what npm runs.
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
  printf '\n\033[1m▶ %s\033[0m \033[2m— %s\033[0m\n' "$label" "$scope"
  if ! npm run --silent "$label"; then
    printf '\n\033[31m✖ %s failed\033[0m\n' "$label"
    case "$label" in
      format:check) printf '  Fix with: \033[1mnpm run format\033[0m\n' ;;
      lint)         printf '  Fix with: \033[1mnpm run lint:fix\033[0m\n' ;;
    esac
    if [ -n "${BYPASS_HINT:-}" ]; then
      printf '  Bypass with: \033[1m%s\033[0m\n' "$BYPASS_HINT"
    fi
    printf '\n'
    exit 1
  fi
}

# format runs as one pass over the whole repo, so it also covers the root-level
# files (README, docker-compose.yml, scripts/) that no workspace owns.
run format:check "root, $(scope_of format:check)"
run lint
run typecheck
if [ "$with_build" -eq 1 ]; then
  run build
fi

printf '\n\033[32m✔ all checks passed\033[0m\n\n'
