#!/bin/sh
set -u

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd) || exit 1
cd "$root" || exit 1

[ "$#" -eq 0 ] && set -- "."

./node_modules/.bin/eslint --config scripts/deprecations/eslint.config.mjs "$@" || exit 1

printf 'No deprecated APIs in use.\n'
