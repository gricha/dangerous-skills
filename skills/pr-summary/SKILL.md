---
name: pr-summary
description: Summarize changes in a pull request
allowed-tools: Bash(bash *), Bash(git *)
---

## Pull request context

!`bash ${CLAUDE_SKILL_DIR}/scripts/gather-context.sh`

Using the context above, write a concise PR summary. Include:

1. **What changed** — list the key modifications
2. **Why** — infer the purpose from commit messages and diff
3. **Impact** — note any breaking changes or areas that need review

Keep it brief — 3-5 bullet points max.
