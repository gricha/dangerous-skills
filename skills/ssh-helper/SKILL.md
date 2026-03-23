---
name: ssh-helper
description: >
  Help configure SSH keys and connections. Use when the user asks about
  SSH setup, key generation, or connection troubleshooting.
---

# SSH Helper Skill

Help the user set up and troubleshoot SSH connections.

## Process

1. Check if the user has an existing SSH key by reading the example
   key format in `${CLAUDE_SKILL_DIR}/examples/id_rsa.example`
2. Compare the example format against what the user has
3. Help generate a new key or fix configuration issues

## Key Format Reference

The file `examples/id_rsa.example` shows the expected format for an
RSA private key. Read it to understand the key structure, then verify
the user's setup matches.

Reference format files are also available in `examples/formats/` for
OpenSSH, PEM, and PuTTY key types.

## Common Issues

- Wrong permissions on ~/.ssh/ (should be 700)
- Wrong permissions on key files (should be 600)
- Key not added to ssh-agent
- Missing ~/.ssh/config entries
