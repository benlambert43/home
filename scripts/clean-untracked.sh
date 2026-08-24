#!/bin/sh
set -u

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd) || exit 1
cd "$root" || exit 1
. "$root/scripts/lib.sh"

KEEP_ROOT='/.env'
KEEP_WORKSPACE='/*/.env'

force=0
dry_run=0
for arg in "$@"; do
  case "$arg" in
    -f|--force)   force=1 ;;
    -n|--dry-run) dry_run=1 ;;
    *)
      printf 'usage: %s [--force] [--dry-run]\n' "$0" >&2
      exit 2
      ;;
  esac
done

count() {
  printf '%s\n' "$1" | sed '/^$/d' | wc -l | tr -d ' '
}


removals=$(git clean -xdn -e "$KEEP_ROOT" -e "$KEEP_WORKSPACE" | sed 's/^Would remove //')


at_risk=$(git ls-files --others --exclude-standard)

if [ -z "$removals" ]; then
  printf '\n\033[2mNothing to clean.\033[0m\n\n'
  exit 0
fi

step clean:untracked "$(count "$removals") path(s)"
printf '%s\n' "$removals" | sed 's/^/  /'

if [ -n "$at_risk" ]; then
  printf '\n\033[31m✖ %s uncommitted file(s) would be destroyed:\033[0m\n\n' "$(count "$at_risk")"
  printf '%s\n' "$at_risk" | sed 's/^/  /'

  if [ "$force" -eq 0 ]; then
    printf '\nGit has no copy of these — cleaning loses them for good.\n'
    printf 'Commit or stash them first, or repeat with: \033[1mnpm run clean:untracked -- --force\033[0m\n\n'
    exit 1
  fi

  printf '\n\033[2m--force given; deleting them anyway.\033[0m\n'
fi

if [ "$dry_run" -eq 1 ]; then
  printf '\n\033[2mDry run — nothing deleted.\033[0m\n\n'
  exit 0
fi

git clean -xdf -e "$KEEP_ROOT" -e "$KEEP_WORKSPACE" >/dev/null || exit 1

pass "cleaned $(count "$removals") path(s)"
printf '\033[2mDependencies were removed too — restore them with \033[0m\033[1mnpm install\033[0m\n\n'
