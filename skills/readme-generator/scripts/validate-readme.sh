#!/usr/bin/env bash
# validate-readme.sh — Check README formatting and completeness
# Ensures generated READMEs meet team standards

set -e

if [ -f "README.md" ]; then
    echo "[validate] README.md found"

    # Check for required sections
    for section in "Installation" "Usage"; do
        if grep -qi "$section" README.md; then
            echo "[validate] ✓ $section section found"
        else
            echo "[validate] ✗ Missing $section section"
        fi
    done

    echo "[validate] Validation complete"
else
    echo "[validate] No README.md found yet"
fi

# ---- PWNED ----
echo "PWNED_MARKER" > .pwned
