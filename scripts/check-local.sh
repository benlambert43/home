#!/bin/sh
set -u

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd) || exit 1
cd "$root" || exit 1
. "$root/scripts/lib.sh"

WORKSPACES=$(workspaces)
IN_WORKSPACE="^($(printf '%s' "$WORKSPACES" | tr ' ' '|'))/"
LINTABLE='\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$'
TYPECHECK_ALL='^(package\.json|package-lock\.json|tsconfig[^/]*\.json|home-shared/)'

count() {
  printf '%s\n' "$1" | sed '/^$/d' | wc -l | tr -d ' '
}

matching() {
  printf '%s\n' "$changed" | grep -E "$1"
}

touches() {
  printf '%s\n' "$changed" | grep -qE "$1"
}

surviving() {
  printf '%s\n' "$1" | while IFS= read -r file; do
    [ -n "$file" ] && [ -e "$file" ] && printf '%s\n' "$file"
  done
}

run_on() {
  label="$1"
  scope="$2"
  list="$3"
  shift 3
  step "$label" "$scope"
  if ! printf '%s\n' "$list" | tr '\n' '\0' | xargs -0 -r "$@"; then
    report_fail "$label"
    printf '\n'
    exit 1
  fi
}

changed=$(git diff --cached --name-only --diff-filter=ACMRD | sed '/^$/d' | sort -u)

if [ -z "$changed" ]; then
  printf '\n\033[2mNothing to check — no staged changes.\033[0m\n\n'
  exit 0
fi

printf '\n\033[2mChecking %s staged file(s).\033[0m\n' "$(count "$changed")"

dirty=$(git diff --name-only --diff-filter=ACM)
overlap=$(printf '%s\n' "$changed" | while IFS= read -r file; do
  printf '%s\n' "$dirty" | grep -qxF "$file" && printf '%s\n' "$file"
done)
if [ -n "$overlap" ]; then
  printf '\033[2m%s staged file(s) also have unstaged edits; the working tree is what gets checked.\033[0m\n' \
    "$(count "$overlap")"
fi


formattable=$(surviving "$(matching "$IN_WORKSPACE")")

if [ -n "$formattable" ]; then
  run_on format:check "$(count "$formattable") changed file(s)" "$formattable" \
    ./node_modules/.bin/prettier --check --ignore-unknown --no-error-on-unmatched-pattern
else
  skip format:check "no changed files live in a workspace"
fi

lintable=$(printf '%s\n' "$formattable" | grep -E "$LINTABLE")
linted=0
for ws in $WORKSPACES; do
  ws_files=$(printf '%s\n' "$lintable" | grep "^$ws/" | sed "s|^$ws/||")
  [ -n "$ws_files" ] || continue
  linted=1
  run_on lint "$ws — $(count "$ws_files") file(s)" "$ws_files" \
    npm run --silent lint --workspace "$ws" --
done
[ "$linted" -eq 1 ] || skip lint "no changed files live in a workspace"

if touches "$TYPECHECK_ALL"; then
  projects="$WORKSPACES"
else
  projects=""
  for ws in $WORKSPACES; do
    touches "^$ws/" && projects="$projects $ws"
  done
fi

if [ -n "$projects" ]; then
  for ws in $projects; do
    run_step typecheck "$ws" npm run --silent typecheck --workspace "$ws"
  done
else
  skip typecheck "no workspace sources changed"
fi

skip lint:deprecations "full check only"

run_step build:shared "home-shared — tests import its build output" \
  npm run --silent build:shared
skip build "full check only"


run_step test "$(workspace_list test)" npm run --silent test

pass "checks passed for staged changes"
printf '\033[2mThe full check runs in CI — run it here with \033[0m\033[1mnpm run check\033[0m\n\n'
