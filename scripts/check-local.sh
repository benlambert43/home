#!/bin/sh
set -u

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd) || exit 1
cd "$root" || exit 1
. "$root/scripts/lib.sh"

WORKSPACES="home-shared home-server home-web-ui"
LINTABLE='\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$'
TYPECHECK_ALL='^(package\.json|package-lock\.json|tsconfig[^/]*\.json|home-shared/)'
EMPTY_TREE=4b825dc642cb6eb9a060e54bf8d69288fbee4904

is_zero() {
  case "$1" in
    "")     return 1 ;;
    *[!0]*) return 1 ;;
    *)      return 0 ;;
  esac
}

count() {
  printf '%s\n' "$1" | sed '/^$/d' | wc -l | tr -d ' '
}

matching() {
  printf '%s\n' "$changed" | grep -E "$1"
}

touches() {
  printf '%s\n' "$changed" | grep -qE "$1"
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

staged_files() {
  git diff --cached --name-only --diff-filter=ACMR
}

pushed_files() {
  found=0
  if [ ! -t 0 ]; then
    while read -r _local_ref local_sha _remote_ref remote_sha; do
      is_zero "$local_sha" && continue
      found=1
      if is_zero "$remote_sha"; then
        oldest=$(git rev-list "$local_sha" --not --remotes | tail -n 1)
        [ -n "$oldest" ] || continue
        base=$(git rev-parse -q --verify "$oldest^") || base="$EMPTY_TREE"
      else
        base="$remote_sha"
      fi
      git diff --name-only --diff-filter=ACMR "$base" "$local_sha"
    done
  fi

  if [ "$found" -eq 0 ]; then
    base=$(git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null) ||
      base=$(git rev-parse -q --verify origin/main >/dev/null 2>&1 && printf 'origin/main')
    [ -n "${base:-}" ] || return 0
    git diff --name-only --diff-filter=ACMR "$base...HEAD"
  fi
}

mode="${1:---staged}"
case "$mode" in
  --staged)
    what="staged changes"
    changed=$(staged_files)
    ;;
  --pre-push)
    what="commits being pushed"
    changed=$(pushed_files)
    ;;
  *)
    printf 'usage: %s [--staged|--pre-push]\n' "$0" >&2
    exit 2
    ;;
esac

changed=$(printf '%s\n' "$changed" | sed '/^$/d' | sort -u)

if [ -z "$changed" ]; then
  printf '\n\033[2mNothing to check — no %s.\033[0m\n\n' "$what"
  exit 0
fi

printf '\n\033[2mChecking %s file(s) from %s.\033[0m\n' "$(count "$changed")" "$what"



if [ "$mode" = "--staged" ]; then
  dirty=$(git diff --name-only --diff-filter=ACM)
  overlap=$(printf '%s\n' "$changed" | while IFS= read -r f; do
    printf '%s\n' "$dirty" | grep -qxF "$f" && printf '%s\n' "$f"
  done)
  if [ -n "$overlap" ]; then
    printf '\033[2m%s staged file(s) also have unstaged edits; the working tree is what gets checked.\033[0m\n' \
      "$(count "$overlap")"
  fi
fi

run_on format:check "$(count "$changed") changed file(s)" "$changed" \
  ./node_modules/.bin/prettier --check --ignore-unknown --no-error-on-unmatched-pattern

lintable=$(matching "$LINTABLE")
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
skip build "full check only"

pass "checks passed for $what"
printf '\033[2mThe full check runs in CI — run it here with \033[0m\033[1mnpm run check\033[0m\n\n'
