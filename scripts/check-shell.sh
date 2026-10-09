#!/bin/sh
set -u

root=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd) || exit 1
cd "$root" || exit 1

if ! command -v shellcheck >/dev/null 2>&1; then
  printf 'shellcheck is not installed. Install it with: \033[1mbrew install shellcheck\033[0m\n' >&2
  exit 1
fi

set -- scripts/*.sh .husky/pre-commit

shellcheck --shell=sh "$@" || exit 1

printf 'No ShellCheck findings in %s file(s).\n' "$#"
