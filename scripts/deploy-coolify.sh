#!/bin/sh
set -u

root=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd) || exit 1
. "$root/scripts/lib.sh"

commit=${1:-}
site_url=${SITE_URL:-https://benlambert.tech}
site_url=${site_url%/}
poll_delay=${DEPLOY_POLL_SECONDS:-15}
poll_attempts=${DEPLOY_POLL_ATTEMPTS:-100}
verify_delay=${DEPLOY_VERIFY_SECONDS:-10}
verify_attempts=${DEPLOY_VERIFY_ATTEMPTS:-12}

if [ -z "$commit" ]; then
  printf 'Usage: sh scripts/deploy-coolify.sh <commit-sha>\n' >&2
  exit 2
fi

missing=""
[ -n "${COOLIFY_URL:-}" ] || missing="$missing COOLIFY_URL"
[ -n "${COOLIFY_APP_UUID:-}" ] || missing="$missing COOLIFY_APP_UUID"
[ -n "${COOLIFY_API_TOKEN:-}" ] || missing="$missing COOLIFY_API_TOKEN"
[ -n "${CF_ACCESS_CLIENT_ID:-}" ] || missing="$missing CF_ACCESS_CLIENT_ID"
[ -n "${CF_ACCESS_CLIENT_SECRET:-}" ] || missing="$missing CF_ACCESS_CLIENT_SECRET"
if [ -n "$missing" ]; then
  printf 'Not set:%s\n' "$missing" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  printf 'jq is not installed.\n' >&2
  exit 1
fi

coolify_url=${COOLIFY_URL%/}
body_file=$(mktemp) || exit 1
trap 'rm -f "$body_file"' EXIT

coolify_api() {
  printf 'header = "Authorization: Bearer %s"\nheader = "CF-Access-Client-Id: %s"\nheader = "CF-Access-Client-Secret: %s"\n' \
    "$COOLIFY_API_TOKEN" "$CF_ACCESS_CLIENT_ID" "$CF_ACCESS_CLIENT_SECRET" |
    curl -s -o "$body_file" -w '%{http_code} %{redirect_url}' --max-time 60 --config - \
      -X "$1" -H 'Accept: application/json' "$coolify_url/api/v1$2"
}

api_message() {
  jq -r '.message // empty' "$body_file" 2>/dev/null
}

explain_api_failure() {
  case "$1" in
    000)
      printf 'No response from %s.\n' "$coolify_url" >&2
      ;;
    301 | 302 | 303 | 307 | 308)
      printf 'Cloudflare Access redirected the request to %s; check CF_ACCESS_CLIENT_ID, CF_ACCESS_CLIENT_SECRET and the Service Auth policy.\n' "${2%%\?*}" >&2
      ;;
    401)
      printf 'Coolify rejected the API token: %s\n' "$(api_message)" >&2
      ;;
    403)
      printf 'Coolify refused the request: %s (API access disabled, an IP allowlist, or a token without the deploy and read permissions).\n' "$(api_message)" >&2
      ;;
    404)
      printf 'Coolify found nothing for that UUID: %s\n' "$(api_message)" >&2
      ;;
    *)
      printf 'Coolify answered %s: %s\n' "$1" "$(api_message)" >&2
      ;;
  esac
}

fail_api() {
  explain_api_failure "$1" "$2"
  report_fail "$3"
  exit 1
}

trigger_deployment() {
  step deploy "application $COOLIFY_APP_UUID at $coolify_url"
  result=$(coolify_api POST "/deploy?uuid=$COOLIFY_APP_UUID&force=false")
  status=${result%% *}
  redirect=${result#* }
  [ "$status" = 200 ] || fail_api "$status" "$redirect" deploy

  deployment_uuid=$(jq -r '.deployments[0].deployment_uuid // empty' "$body_file")
  message=$(jq -r '.deployments[0].message // empty' "$body_file")
  if [ -z "$deployment_uuid" ]; then
    printf 'Coolify answered 200 without a deployment UUID: %s\n' "$(cat "$body_file")" >&2
    report_fail deploy
    exit 1
  fi
  printf '  %s\n  deployment %s\n' "${message:-queued}" "$deployment_uuid"
}

deployment_link() {
  link=$(jq -r '.deployment_url // empty' "$body_file")
  case "$link" in
    http://* | https://*) printf '%s' "$link" ;;
    /*) printf '%s%s' "$coolify_url" "$link" ;;
    *) printf '%s' "$coolify_url" ;;
  esac
}

wait_for_deployment() {
  step wait "deployment $deployment_uuid"
  attempt=1
  state=""
  while [ "$attempt" -le "$poll_attempts" ]; do
    result=$(coolify_api GET "/deployments/$deployment_uuid")
    status=${result%% *}
    redirect=${result#* }
    case "$status" in
      200)
        current=$(jq -r '.status // empty' "$body_file")
        if [ "$current" != "$state" ]; then
          state=$current
          printf '  %s\n' "$state"
        fi
        case "$state" in
          finished)
            built=$(jq -r '.commit // empty' "$body_file")
            if [ -n "$built" ] && [ "$built" != "$commit" ]; then
              printf '  Coolify built %s rather than %s; a newer push may have landed first.\n' "$built" "$commit"
            fi
            return
            ;;
          failed | cancelled-by-user)
            printf 'Deployment %s ended as %s. Logs: %s\n' "$deployment_uuid" "$state" "$(deployment_link)" >&2
            report_fail wait
            exit 1
            ;;
        esac
        ;;
      301 | 302 | 303 | 307 | 308 | 401 | 403 | 404)
        fail_api "$status" "$redirect" wait
        ;;
      *)
        printf '  attempt %s/%s: status check answered %s, retrying in %ss\n' "$attempt" "$poll_attempts" "$status" "$poll_delay"
        ;;
    esac
    attempt=$((attempt + 1))
    sleep "$poll_delay"
  done

  printf 'Deployment %s was still %s after %s checks. Logs: %s\n' "$deployment_uuid" "${state:-unknown}" "$poll_attempts" "$(deployment_link)" >&2
  report_fail wait
  exit 1
}

verify_site() {
  step verify "$site_url serves commit $commit"
  attempt=1
  while [ "$attempt" -le "$verify_attempts" ]; do
    status=$(curl -s -o "$body_file" -w '%{http_code}' --max-time 30 -H 'Cache-Control: no-cache' "$site_url/")
    live=$(grep -o '/home/commit/[0-9a-f]*' "$body_file" | head -n 1 | sed 's#.*/##')
    if [ "$status" = 200 ] && [ "$live" = "$commit" ]; then
      if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
        printf 'Deployed %s to %s (Coolify deployment %s).\n' "$commit" "$site_url" "$deployment_uuid" >> "$GITHUB_STEP_SUMMARY"
      fi
      pass "$site_url serves $commit"
      return
    fi
    [ "$status" = 000 ] && status="no response"
    printf '  attempt %s/%s: %s, live commit %s, retrying in %ss\n' "$attempt" "$verify_attempts" "$status" "${live:-unknown}" "$verify_delay"
    attempt=$((attempt + 1))
    sleep "$verify_delay"
  done

  printf '%s still serves commit %s rather than %s.\n' "$site_url" "${live:-unknown}" "$commit" >&2
  report_fail verify
  exit 1
}

trigger_deployment
wait_for_deployment
verify_site
