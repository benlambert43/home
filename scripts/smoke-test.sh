#!/bin/sh
set -u

root=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd) || exit 1
cd "$root" || exit 1
. "$root/scripts/lib.sh"

env_file="$root/smoke.env"
site_url=http://web:3000
api_url=http://api:4000
timeout=${SMOKE_TIMEOUT_SECONDS:-300}

with_build=1
case "${1:-}" in
  "") ;;
  --no-build) with_build=0 ;;
  *)
    printf 'usage: %s [--no-build]\n' "$0" >&2
    exit 2
    ;;
esac

if ! docker info >/dev/null 2>&1; then
  printf 'docker is not running.\n' >&2
  exit 1
fi

compose() {
  docker compose --env-file "$env_file" "$@"
}

cleanup() {
  compose down --volumes --remove-orphans --timeout 10 >/dev/null 2>&1
  return 0
}

trap 'cleanup' EXIT
trap 'cleanup; exit 130' INT
trap 'cleanup; exit 143' TERM

fail() {
  printf '\n'
  compose ps --all
  printf '\n'
  compose logs --no-color --tail 100
  report_fail "$1"
  printf '\n'
  exit 1
}

service_state() {
  id=$(compose ps --all --quiet "$1" | head -n 1)
  [ -n "$id" ] || return 0
  docker inspect --format '{{.State.Status}}{{if .State.Health}} {{.State.Health.Status}}{{end}}' "$id"
}

wait_healthy() {
  while :; do
    state=$(service_state "$1")
    case "$state" in
      "running healthy")
        printf '  %s healthy\n' "$1"
        return 0
        ;;
      "running unhealthy" | exited* | dead*)
        printf '  %s is %s\n' "$1" "$state" >&2
        return 1
        ;;
    esac
    if [ "$(date +%s)" -ge "$deadline" ]; then
      printf '  %s is still %s after %ss\n' "$1" "${state:-not created}" "$timeout" >&2
      return 1
    fi
    sleep 5
  done
}

request() {
  compose run --rm --no-deps -T --quiet-pull --entrypoint curl revalidate \
    -s -o /dev/null -w '%{http_code}' --max-time 30 "$1"
}

expect_status() {
  status=$(request "$2")
  if [ "$status" != "$1" ]; then
    printf '  %s -> %s, expected %s\n' "$2" "$status" "$1" >&2
    return 1
  fi
  printf '  %s -> %s\n' "$2" "$status"
}

requests() {
  expect_status 200 "$site_url/" || return 1
  expect_status 200 "$site_url/blog" || return 1
  expect_status 404 "$site_url/blog/this-post-does-not-exist" || return 1
  expect_status 200 "$api_url/api/v1/posts?page=1" || return 1
}

if [ "$with_build" -eq 1 ]; then
  run_step build "api, web" compose build api web
else
  skip build "--no-build"
fi

run_step up "database, storage-ownership, api, web" \
  compose up --detach --no-build --quiet-pull web

deadline=$(( $(date +%s) + timeout ))
step healthy "database, api, web"
for service in database api web; do
  wait_healthy "$service" || fail healthy
done

step revalidate "revalidate service"
compose run --rm -T --quiet-pull revalidate || fail revalidate

step requests "$site_url, $api_url"
requests || fail requests

pass "production stack smoke test passed"
