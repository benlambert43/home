#!/bin/sh
# Project quality gates. Single source of truth for the npm scripts and the git hooks.
#
#   scripts/check.sh          format:check, lint, typecheck   (~9s)  — pre-commit
#   scripts/check.sh --build  ...plus build                   (~17s) — pre-push
#
# BYPASS_HINT, when set, is shown on failure; the hooks use it to surface --no-verify.

set -u

with_build=0
[ "${1:-}" = "--build" ] && with_build=1

run() {
  label="$1"
  printf '\n\033[1m▶ %s\033[0m\n' "$label"
  if ! npm run --silent "$label"; then
    printf '\n\033[31m✖ %s failed\033[0m\n' "$label"
    case "$label" in
      format:check) printf '  Fix with: \033[1mnpm run format\033[0m\n' ;;
      lint)         printf '  Fix with: \033[1mnpm run lint -- --fix\033[0m\n' ;;
    esac
    if [ -n "${BYPASS_HINT:-}" ]; then
      printf '  Bypass with: \033[1m%s\033[0m\n' "$BYPASS_HINT"
    fi
    printf '\n'
    exit 1
  fi
}

run format:check
run lint
run typecheck
if [ "$with_build" -eq 1 ]; then
  run build
fi

printf '\n\033[32m✔ all checks passed\033[0m\n\n'
