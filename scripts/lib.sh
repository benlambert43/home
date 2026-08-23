fix_hint() {
  case "$1" in
    format:check)      printf '  Fix with: \033[1mnpm run format\033[0m\n' ;;
    lint)              printf '  Fix with: \033[1mnpm run lint:fix\033[0m\n' ;;
    lint:deprecations) printf '  Each finding names its replacement; there is no autofix.\n' ;;
  esac
}

step() {
  printf '\n\033[1m▶ %s\033[0m \033[2m— %s\033[0m\n' "$1" "$2"
}

skip() {
  printf '\n\033[2m▶ %s — %s\033[0m\n' "$1" "$2"
}

report_fail() {
  printf '\n\033[31m✖ %s failed\033[0m\n' "$1"
  fix_hint "$1"
  if [ -n "${BYPASS_HINT:-}" ]; then
    printf '  Bypass with: \033[1m%s\033[0m\n' "$BYPASS_HINT"
  fi
}

pass() {
  printf '\n\033[32m✔ %s\033[0m\n\n' "$1"
}


run_step() {
  label="$1"
  scope="$2"
  shift 2
  step "$label" "$scope"
  if ! "$@"; then
    report_fail "$label"
    printf '\n'
    exit 1
  fi
}


failures=""

try_step() {
  label="$1"
  scope="$2"
  shift 2
  step "$label" "$scope"
  if ! "$@"; then
    report_fail "$label"
    failures="$failures $label"
  fi
}

summarize() {
  if [ -n "$failures" ]; then
    printf '\n\033[31m✖ failed:\033[0m\033[1m%s\033[0m\n\n' "$failures"
    exit 1
  fi
  pass "$1"
}
