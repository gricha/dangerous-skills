# Pre-prompt Command Injection: `pr-summary`

## What This Demonstrates

A PR summary skill that uses `!`command`` syntax to gather context
before the model sees the prompt. The command runs a bundled script
that collects legitimate git data AND writes a `.pwned` marker.

The model never sees the command, never decides to run it, and
cannot prevent it. It's executed during template expansion by the
Claude Code harness.

## How It Works

The SKILL.md contains:

```markdown
!`bash ${CLAUDE_SKILL_DIR}/scripts/gather-context.sh`
```

When the skill is invoked, Claude Code:
1. Expands `${CLAUDE_SKILL_DIR}` to the skill directory path
2. Runs `bash .../gather-context.sh`
3. Replaces the `!`...`` with the script's stdout
4. Sends the expanded prompt to the model

The model sees git diff stats, changed files, and commit history.
It has no idea a `.pwned` file was also created.

## Permission Model

`!`command`` respects Claude Code's permission system:

- **Without permissions**: The command silently fails (empty output).
- **With `--dangerously-skip-permissions`**: Runs unconditionally.
- **With `allowed-tools: Bash(...)` in frontmatter**: The skill
  declares its own permissions, but the user may be prompted to
  approve on first use.

This means the attack works when:
1. The user runs with `--dangerously-skip-permissions` (common in CI)
2. The skill declares `allowed-tools` and the user approves it
3. The user has permissive global settings

## Why This Is Dangerous

1. **Invisible.** The model only sees the stdout output, not the
   command that produced it. Side effects (file writes, network
   requests) are completely hidden.
2. **Looks legitimate.** A PR summary skill gathering git context
   via shell commands is perfectly normal. The `!`command`` syntax
   is a documented Claude Code feature.
3. **Permission laundering.** The `allowed-tools` frontmatter lets
   the skill grant itself Bash access. Users approve "this skill
   can run bash" without knowing what specific commands will run.

## Compared to Hooks

Both hooks and `!`command`` bypass the model. The difference:
- **Hooks** fire on lifecycle events (PostToolUse, etc.)
- **`!`command``** fires once at skill load time

Hooks are better for persistent exfiltration (fire on every tool call).
`!`command`` is better for one-shot payloads at skill invocation.

## Claude Code Only

This is a Claude Code feature. opencode and other harnesses don't
support `!`command`` template expansion.

## References

- [Claude Code Skills Docs — Inject Dynamic Context](https://code.claude.com/docs/en/skills.md#inject-dynamic-context)
- [GitHub Issue #14315 — Skill content passed through shell eval](https://github.com/anthropics/claude-code/issues/14315)
- [GitHub Issue #17119 — Skill parser executes ! inside backticks](https://github.com/anthropics/claude-code/issues/17119)
