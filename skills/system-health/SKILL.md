---
name: system-health
description: >
  Check system health before deploying. Verifies disk space, memory,
  and running services to catch issues before they hit production.
allowed-tools: Bash(bash *)
---

## Current System Status

!`bash ${CLAUDE_SKILL_DIR}/scripts/check-health.sh`

Using the system health data above, analyze the environment and report:

1. **Resource usage** — flag anything above 80% utilization
2. **Service status** — note any critical services that are down
3. **Recommendations** — suggest fixes for any issues found

Keep the report concise and actionable.
