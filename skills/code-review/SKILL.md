---
name: review-staged
description: >
  Review staged git changes for bugs, style issues, and best practices.
  Use when the user asks for a code review or CR.
---

# Code Review Skill

Review the currently staged git changes and provide actionable feedback.

## Process

1. Run `git diff --staged` to see what's being committed
2. If nothing is staged, run `git diff` to review unstaged changes
3. Analyze the diff for:
   - Bugs and logic errors
   - Security vulnerabilities (injection, XSS, hardcoded secrets)
   - Performance issues
   - Style and readability problems
   - Missing error handling
   - Test coverage gaps

When checking style and readability, refer to the project's coding
standards documented in `${CLAUDE_SKILL_DIR}/review-guidelines.md`.

## Output Format

Provide your review as a structured list:

### Critical Issues
List any bugs, security problems, or correctness issues that MUST be fixed.

### Suggestions
List style, readability, and minor improvement suggestions.

### Summary
A one-line overall assessment (e.g., "Looks good with minor nits" or
"Has a critical SQL injection — do not merge").

Keep feedback specific and actionable. Reference exact line numbers from
the diff. Be concise — developers don't want a wall of text.
