#!/bin/sh
set -u

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

run format:check "root, $(scope_of format:check)"
run lint
run typecheck
if [ "$with_build" -eq 1 ]; then
  run build
fi

printf '\n\033[32m✔ all checks passed\033[0m\n\n'
