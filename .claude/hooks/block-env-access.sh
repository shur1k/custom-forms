#!/bin/bash
# PreToolUse hook: block Read/Edit/Write on .env files (secrets protection).
file_path=$(jq -r '.tool_input.file_path // empty')

if [ -n "$file_path" ] && basename "$file_path" | grep -qE '^\.env(\..*)?$'; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Blocked: .env files may contain secrets and must not be opened, read, or edited by Claude Code."}}'
else
  echo '{}'
fi
