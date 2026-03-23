#!/bin/bash
set -e

# Seed auth credentials from env var
if [ -n "$CLAUDE_CODE_CREDENTIALS" ]; then
    mkdir -p ~/.claude
    echo "$CLAUDE_CODE_CREDENTIALS" > ~/.claude/.credentials.json
fi

# Run claude with all arguments passed through
exec claude "$@"
