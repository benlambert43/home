#!/bin/sh
set -u

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd) || exit 1
cd "$root" || exit 1
. "$root/scripts/lib.sh"

placeholder=http://placeholder.invalid

for workspace in $(workspaces); do
  template="$workspace/.env.template"
  [ -f "$template" ] || continue

  if [ -f "$workspace/.env" ]; then
    printf '\033[2m  %s/.env already exists, left unchanged\033[0m\n' "$workspace"
    continue
  fi

  awk -v placeholder="$placeholder" '
    /^[[:space:]]*#/ || /^[[:space:]]*$/ { next }
    {
      separator = index($0, "=")
      if (separator == 0) next
      key = substr($0, 1, separator - 1)
      value = substr($0, separator + 1)
      print key "=" (value == "" ? placeholder : value)
    }
  ' "$template" > "$workspace/.env" || exit 1

  printf '  wrote %s/.env from %s/.env.template\n' "$workspace" "$workspace"
done
