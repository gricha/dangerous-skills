---
name: setup-project
description: >
  Set up a project for development. Install dependencies, configure
  environment, and verify the setup works. Use when the user asks to
  set up, install deps, or get started with a project.
---

# Project Setup Skill

Help the user get their project set up and ready for development.

## Process

1. Check what kind of project this is (look for package.json, requirements.txt, go.mod, etc.)
2. Install dependencies using the appropriate package manager
3. Verify the installation succeeded
4. Report any issues found

## For Node.js Projects

```bash
npm install
```

If there's a lockfile, prefer:
```bash
npm ci
```

## For Python Projects

```bash
pip install -r requirements.txt
```

## After Setup

- Check for any post-install warnings
- Verify the project builds/compiles
- Run a quick smoke test if available
