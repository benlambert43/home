#!/bin/sh
set -u

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd) || exit 1
cd "$root" || exit 1
. "$root/scripts/lib.sh"



shared="home-shared"
build="$shared/build"
staging="$shared/.build.tmp"
lock="$shared/.build.lock"
manifest="$lock/manifest"
stamp="$build/.build-stamp"

LOCK_TIMEOUT=120

force=0
case "${1:-}" in
  "") ;;
  -f | --force) force=1 ;;
  *)
    printf 'usage: %s [--force]\n' "$0" >&2
    exit 2
    ;;
esac

note() {
  printf '\033[2m  %s\033[0m\n' "$1"
}

locked=0

cleanup() {
  rm -rf "$staging"
  [ "$locked" -eq 1 ] && rm -rf "$lock"
  return 0
}

trap 'cleanup' EXIT
trap 'cleanup; exit 130' INT
trap 'cleanup; exit 143' TERM
trap 'cleanup; exit 129' HUP

acquire_lock() {
  waited=0
  announced=0

  while ! mkdir "$lock" 2>/dev/null; do
    if [ "$waited" -ge "$LOCK_TIMEOUT" ]; then
      printf '\n\033[31m✖ build:shared gave up after %ss waiting for %s\033[0m\n' \
        "$LOCK_TIMEOUT" "$lock" >&2
      printf '  If no build is running, remove it: \033[1mrm -rf %s\033[0m\n\n' "$lock" >&2
      exit 1
    fi

    holder=$(cat "$lock/pid" 2>/dev/null) || holder=""
    case "$holder" in '' | *[!0-9]*) holder="" ;; esac

    if [ -n "$holder" ] && ! kill -0 "$holder" 2>/dev/null; then
      note "home-shared: clearing a lock left behind by pid $holder"
      rm -rf "$lock"
    elif [ "$announced" -eq 0 ]; then
      note "home-shared: waiting for the build already running${holder:+ (pid $holder)}…"
      announced=1
    fi

    sleep 1
    waited=$((waited + 1))
  done

  locked=1
  printf '%s\n' "$$" > "$lock/pid"
}

# tsconfig.build.json excludes tests, so they cannot change the output.
sources() {
  find "$shared/src" -type f -name '*.ts' ! -name '*.test.ts' | LC_ALL=C sort
}

sources_newer() {
  find "$shared/src" -type f -name '*.ts' ! -name '*.test.ts' -newer "$stamp" | head -n 1
}

config_newer() {
  find "$shared" -maxdepth 1 -type f \
    \( -name 'tsconfig*.json' -o -name 'package.json' \) -newer "$stamp" | head -n 1
}

is_fresh() {
  [ "$force" -eq 0 ] || return 1
  [ -f "$stamp" ] || return 1
  [ -f "$build/index.js" ] || return 1

  sources | cmp -s - "$stamp" || return 1

  [ -z "$(sources_newer)" ] || return 1
  [ -z "$(config_newer)" ] || return 1

  return 0
}


sweep() {
  ( cd "$build" && find . -type f ) | while IFS= read -r rel; do
    [ "$rel" = "./${stamp##*/}" ] && continue
    grep -qxF "$rel" "$manifest" || rm -f "$build/${rel#./}"
  done

  find "$build" -mindepth 1 -type d -empty -delete 2>/dev/null
  return 0
}


tsc() {
  if [ -x "$shared/node_modules/.bin/tsc" ]; then
    "$shared/node_modules/.bin/tsc" "$@"
  else
    ./node_modules/.bin/tsc "$@"
  fi
}

build_shared() {
  rm -rf "$staging" || return 1
  tsc -p "$shared/tsconfig.build.json" --outDir "$staging" || return 1
  mkdir -p "$build" || return 1

  ( cd "$staging" && find . -type f ) | LC_ALL=C sort > "$manifest" || return 1


  while IFS= read -r rel; do
    rel=${rel#./}
    dir="$build/$rel"
    dir=${dir%/*}
    [ -d "$dir" ] || mkdir -p "$dir" || return 1
    mv -f "$staging/$rel" "$build/$rel" || return 1
  done < "$manifest"

  sweep

  sources > "$stamp" || return 1
  rm -rf "$staging"
}

acquire_lock

if is_fresh; then
  note "home-shared up to date"
  exit 0
fi

if ! build_shared; then
  report_fail build:shared
  printf '\n'
  exit 1
fi

note "home-shared built"
