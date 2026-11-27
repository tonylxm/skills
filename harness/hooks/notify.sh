#!/usr/bin/env bash
# Desktop alert for Stop and Notification hooks. Reads the hook JSON on stdin.
# Notification types other than the ones below (auth, quota, elicitation) stay silent.
set -uo pipefail
input=$(cat)
event=$(printf '%s' "$input" | jq -r '.hook_event_name // empty')
kind=$(printf '%s' "$input" | jq -r '.notification_type // empty')
project=$(basename "$(printf '%s' "$input" | jq -r '.cwd // "."')")
case "$event:$kind" in
  Stop:*)                            msg="Finished" ;;
  Notification:permission_prompt)    msg="Needs permission" ;;
  Notification:agent_needs_input)     msg="Needs your input" ;;
  Notification:agent_completed)      msg="Background agent finished" ;;
  Notification:idle_prompt)          msg="Waiting for you" ;;
  *) exit 0 ;;
esac
osascript -e "display notification \"$msg\" with title \"Claude Code\" subtitle \"$project\"" >/dev/null 2>&1 || true
