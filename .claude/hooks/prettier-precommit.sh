#!/bin/bash
# PreToolUse hook: run prettier on staged files before `git commit` runs.
command=$(jq -r '.tool_input.command // empty')

if echo "$command" | grep -qE '(^|;|&&|\|)\s*git commit\b'; then
  files=$(git diff --cached --name-only --diff-filter=ACMR)
  if [ -n "$files" ]; then
    echo "$files" | xargs npx prettier --write --ignore-unknown 2>/dev/null
    echo "$files" | xargs git add
    echo "prettier-precommit: formatted and staged $(echo "$files" | wc -l | tr -d ' ') file(s)" >&2
  fi
fi

echo '{}'
