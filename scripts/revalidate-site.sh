#!/bin/sh
set -u

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd) || exit 1
. "$root/scripts/lib.sh"

site_url=${1:-http://localhost:3000}
attempts=${REVALIDATE_ATTEMPTS:-60}
delay=${REVALIDATE_DELAY_SECONDS:-2}
env_file="$root/home-web-ui/.env"

if [ -z "${REVALIDATE_SECRET:-}" ] && [ -f "$env_file" ]; then
  REVALIDATE_SECRET=$(sed -n 's/^REVALIDATE_SECRET=//p' "$env_file" | tail -n 1)
fi

if [ -z "${REVALIDATE_SECRET:-}" ]; then
  printf 'REVALIDATE_SECRET is not set and %s does not define it.\n' "$env_file" >&2
  exit 1
fi

body_file=$(mktemp) || exit 1
trap 'rm -f "$body_file"' EXIT

status_of() {
  curl -s -o /dev/null -w '%{http_code}' --max-time 30 "$@"
}

request_revalidation() {
  printf 'header = "x-revalidate-secret: %s"\n' "$REVALIDATE_SECRET" |
    curl -s -o "$body_file" -w '%{http_code}' --max-time 30 --config - \
      -X POST "$site_url/revalidate"
}

revalidated() {
  grep -q '"error":false' "$body_file"
}

warm() {
  for path in / /blog; do
    printf '  %s -> %s\n' "$path" "$(status_of "$site_url$path")"
  done
}

step revalidate "$site_url"

attempt=1
while [ "$attempt" -le "$attempts" ]; do
  status=$(request_revalidation)

  case "$status" in
    200)
      if revalidated; then
        warm
        pass "revalidated $site_url"
        exit 0
      fi
      printf '%s/revalidate answered 200 without the expected JSON; check the site URL.\n' "$site_url" >&2
      exit 1
      ;;
    403)
      printf 'The site rejected the revalidation secret.\n' >&2
      exit 1
      ;;
    404 | 405)
      printf '%s/revalidate does not exist; check the site URL and that the deployment has the route.\n' "$site_url" >&2
      exit 1
      ;;
  esac

  [ "$status" = 000 ] && status="no response"
  printf '  attempt %s/%s: %s, retrying in %ss\n' "$attempt" "$attempts" "$status" "$delay"
  attempt=$((attempt + 1))
  sleep "$delay"
done

report_fail revalidate
exit 1
