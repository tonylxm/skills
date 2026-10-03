# AGENTS.md

{One line: what this project is and who it is for.}

## Non-negotiables
- {Rule an agent must never break, with a reason if it isn't obvious}
- Tests before code for new behaviour (`tdd`). Never claim something is done without running the tests.
- Never commit secrets. Config comes from env vars; keep `.env.example` current.

## Commands
```bash
{install}
{dev}
{test}            # single test: {cmd}
{lint && typecheck}
{build}
```

## Map
- `{dir}/`: {what lives there}
- Product: [MVP_PRD.md](MVP_PRD.md) · Roadmap: [ROADMAP.md](ROADMAP.md) · Design: [DESIGN.md](DESIGN.md)
- Terms: [GLOSSARY.md](GLOSSARY.md) · Decisions: [docs/decisions/](docs/decisions/)

## Conventions
- {Only conventions that tooling doesn't enforce and agents get wrong}

## Workflow
- {Solo: commit to `main`; a pre-commit hook auto-formats; use a branch + PR for long unattended runs and `(parallel)` worktree tasks | Team: branch `feat|fix|chore/{slug}`; squash-merge PRs once CI is green}. Conventional Commits.
- Work from `ROADMAP.md` with `roadmap-next`. Ideas go in `TODO.md`, not in scope.
