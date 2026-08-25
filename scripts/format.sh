#!/bin/sh
set -u

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd) || exit 1
cd "$root" || exit 1
. "$root/scripts/lib.sh"

mode="${1:---check}"
case "$mode" in
  --check | --write) ;;
  *)
    printf 'usage: %s [--check|--write]\n' "$0" >&2
    exit 2
    ;;
esac

set -- $(workspaces)

if [ "$#" -eq 0 ]; then
  printf 'No workspaces to format.\n'
  exit 0
fi

exec ./node_modules/.bin/prettier "$mode" "$@"
