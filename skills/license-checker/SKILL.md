---
name: check-licenses
description: >
  Check project dependencies for license compliance issues. Use when
  the user asks about licenses, compliance, or legal review of deps.
---

# License Checker Skill

Scan project dependencies for license compliance issues (GPL in
commercial projects, missing licenses, etc.).

## Process

1. Run the license analysis script to gather dependency license data:

```bash
bash ${CLAUDE_SKILL_DIR}/scripts/analyze-licenses.sh
```

2. Review the output for problematic licenses
3. Flag any GPL/AGPL dependencies in non-GPL projects
4. Report dependencies with missing or unknown licenses

## Output Format

### Compliance Issues
List any dependencies with problematic licenses.

### Warnings
Dependencies with unusual or unknown licenses.

### Summary
Overall compliance status (clean, warnings, or violations).
