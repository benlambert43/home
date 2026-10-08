#!/bin/sh
set -u

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd) || exit 1
. "$root/scripts/lib.sh"

site_url=${1:-http://localhost:3000}
site_url=${site_url%/}
attempts=${REVALIDATE_ATTEMPTS:-60}
delay=${REVALIDATE_DELAY_SECONDS:-2}
for env_file in "$root/home-web-ui/.env" "$root/.env"; do
  [ -n "${REVALIDATE_SECRET:-}" ] && break
  [ -f "$env_file" ] || continue
  REVALIDATE_SECRET=$(sed -n 's/^REVALIDATE_SECRET=//p' "$env_file" | tail -n 1)
done

if [ -z "${REVALIDATE_SECRET:-}" ]; then
  printf 'REVALIDATE_SECRET is not set and neither home-web-ui/.env nor .env defines it.\n' >&2
  exit 1
fi

body_file=$(mktemp) || exit 1
paths_file=$(mktemp) || exit 1
headers_file=$(mktemp) || exit 1
trap 'rm -f "$body_file" "$paths_file" "$headers_file"' EXIT

request_revalidation() {
  printf 'header = "x-revalidate-secret: %s"\n' "$REVALIDATE_SECRET" |
    curl -s -o "$body_file" -w '%{http_code}' --max-time 30 --config - \
      -X POST "$site_url/revalidate"
}

revalidated() {
  grep -q '"error":false' "$body_file"
}

revalidate() {
  step revalidate "$site_url"

  attempt=1
  while [ "$attempt" -le "$attempts" ]; do
    status=$(request_revalidation)

    case "$status" in
      200)
        if revalidated; then
          pass "revalidated $site_url"
          return
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
}

sitemap_paths() {
  status=$(curl -s -o "$body_file" -w '%{http_code}' --max-time 30 "$site_url/sitemap.xml")

  if [ "$status" != 200 ]; then
    printf '%s/sitemap.xml answered %s; check the site URL.\n' "$site_url" "$status" >&2
    report_fail postbuild-render-crawl
    exit 1
  fi

  grep -o '<loc>[^<]*</loc>' "$body_file" |
    sed -e 's#^<loc>##' -e 's#</loc>$##' -e 's#^[A-Za-z][A-Za-z0-9+.-]*://[^/]*##' -e 's#^$#/#' \
      > "$paths_file"
}

postbuild_render_crawl() {
  step postbuild-render-crawl "$site_url"
  sitemap_paths

  exercised=0
  posts=0
  failed=0

  while IFS= read -r path; do
    status=$(curl -s -o /dev/null -D "$headers_file" -w '%{http_code}' --max-time 60 "$site_url$path")
    cache=$(tr -d '\r' < "$headers_file" | grep -i '^x-nextjs-cache:' | tail -n 1 | sed 's/^[^:]*: *//')

    case "$status:$cache" in
      200:MISS) outcome="saved now" ;;
      200:HIT | 200:STALE) outcome="already saved" ;;
      200:*) outcome="not saved" ;;
      000:*) outcome="no response" ;;
      *) outcome="failed" ;;
    esac

    case "$outcome" in
      "saved now" | "already saved") ;;
      *) failed=$((failed + 1)) ;;
    esac

    case "$path" in
      /blog/*) posts=$((posts + 1)) ;;
    esac

    exercised=$((exercised + 1))
    printf '  %s -> %s %s\n' "$path" "$status" "$outcome"
  done < "$paths_file"

  if [ "$failed" -gt 0 ]; then
    printf '\n%s of %s routes were not saved. Check that the API is up, then run this again.\n' "$failed" "$exercised" >&2
    report_fail postbuild-render-crawl
    exit 1
  fi

  pass "exercised $exercised routes ($posts posts) at $site_url"
}

revalidate
postbuild_render_crawl
