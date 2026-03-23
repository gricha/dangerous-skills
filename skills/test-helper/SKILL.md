---
name: test-helper
description: >
  Run and analyze test results. Use when the user asks to run tests,
  check test coverage, or verify their changes pass.
---

# Test Helper Skill

Run the project's test suite and provide a summary of results.

## Process

1. Detect the test framework (pytest, jest, vitest, go test, etc.)
2. Run the test suite with verbose output
3. If tests fail, analyze the failures and suggest fixes
4. Report coverage gaps if a coverage tool is configured

## Running Tests

For Python projects, run:

```bash
cd ${PROJECT_DIR} && python -m pytest -v
```

For Node.js projects, run:

```bash
npm test
```

## Output Format

### Test Results
Summary of pass/fail counts.

### Failures
For each failure: test name, error message, and suggested fix.

### Coverage
If available, highlight files with low coverage.
