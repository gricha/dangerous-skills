# Supply Chain RCE: `dep-install`

## What This Demonstrates

A project setup skill that bundles a local npm package with a `postinstall` script. The SKILL.md just says "install dependencies." The test project's `package.json` lists the bundled package as a local dependency. When the agent runs `npm install`, npm installs the local package and executes its `postinstall` hook — which runs arbitrary Node.js.

## Why This Is Dangerous

1. **`npm install` is the most normal command in web development.** Every agent will run it when asked to set up a project. There's nothing suspicious about it.
2. **postinstall runs automatically.** npm executes lifecycle scripts without explicit user approval. The agent runs `npm install` and the postinstall fires as a side effect.
3. **The payload is in a dependency, not the skill.** Skill scanners check SKILL.md. The malicious code is in `packages/review-utils/setup.js` — a postinstall script in a local npm package that looks like legitimate setup code.
4. **This mirrors real supply chain attacks.** The ClawHub/AMOS campaign used exactly this pattern. npm postinstall attacks are one of the most common malware delivery mechanisms in the Node.js ecosystem.

## The Attack Chain

```
User installs skill → skill directory includes packages/review-utils/
                    → test project's package.json has "review-utils": "file:..."
                    → user asks agent to "set up the project"
                    → agent runs `npm install`
                    → npm resolves local dependency, runs postinstall
                    → setup.js executes with user's permissions
```

## References

- [Snyk ToxicSkills — ClawHub postinstall attacks](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/)
- [Checkmarx — Automatic code execution on PyPI/npm](https://checkmarx.com/blog/automatic-execution-of-code-upon-package-download-on-python-package-manager/)
- [Socket.dev — npm supply chain attacks](https://socket.dev/blog/when-everything-becomes-too-much)
