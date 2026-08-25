#!/bin/sh
set -u

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd) || exit 1
cd "$root" || exit 1
. "$root/scripts/lib.sh"

if [ "$#" -eq 0 ]; then
  set -- $(workspaces)
  if [ "$#" -eq 0 ]; then
    printf 'No workspaces to check.\n'
    exit 0
  fi
fi

./node_modules/.bin/eslint --max-warnings 0 --config scripts/deprecations/eslint.config.mjs "$@" || exit 1

printf 'No deprecated APIs in use.\n'
