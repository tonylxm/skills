---
name: stack-defaults
description: Use when choosing, scaffolding or deviating from a tech stack (hosting, database, auth, CI/CD, testing, deploy), starting from a template repo, or handling client accounts, billing, handover and contracts.
---

# Stack defaults

Tony's personal stack layer. The core pipeline never depends on it: it only needs a repo's `AGENTS.md` and `checks.sh`. Read the file for the question in hand, not all of them. In an existing repo, its manifests and lockfiles win.

| File | Read when |
|---|---|
| [tech-stack.md](tech-stack.md) | Picking a base stack, scaffolding, setting up quality baseline, CI/CD, backups, templates, running costs |
| [deprecations.md](deprecations.md) | Before using a framework or library API from memory: check the repo's stack rows |
| [clients.md](clients.md) | Client accounts, who pays for what, handover |
| [contract-template.md](contract-template.md) | Drafting a client contract from a quote and the PRD |
| [templates/](templates/ci.yml) | CI, Dependabot and backup workflows to copy into a repo |

Facts here may go stale (versions, prices): check the date stamped beside them and the installed version before relying on one.
