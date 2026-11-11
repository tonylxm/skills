# AGENTS.md

{One line: what this project is and who it is for.}

## Non-negotiables
- {Rule an agent must never break, with a reason if it isn't obvious}
- Every important behaviour gets a verification strategy (`dev-loop`): test-first for business logic, validation, money or security rules and bug fixes. Never edit a test just to make it pass, and never claim done without showing the check output.
- Never commit secrets. Config comes from env vars; keep `.env.example` current.

## Commands
```bash
{install}
{dev}
{test}            # full suite (quiet, still prints pass/fail counts: {cmd})
{single test}     # one file or name
{area tests}      # tests for one area, e.g. {src/x → tests/x}
{lint && typecheck}
{build}
```

## Map
- `{dir}/`: {what lives there}
- [PRD](docs/PRD.md) · [Architecture](docs/ARCHITECTURE.md) · [Design](docs/DESIGN.md) {drop when no UI} · [Roadmap](docs/ROADMAP.md) · [Decisions](docs/decisions/)
- Terms: [GLOSSARY](docs/GLOSSARY.md) {drop this line when there is no glossary}

## Conventions
- {Only conventions that tooling doesn't enforce and agents get wrong}

## Workflow
- {Solo: commit to `main`; a pre-commit hook auto-formats; use a branch + PR for gnhf runs | Team: branch `feat|fix|chore/{slug}`; squash-merge PRs once CI is green}. Conventional Commits.
- Work from `docs/ROADMAP.md` with `roadmap-next`. Ideas go in its Later section, not in scope.
