# AGENTS.md

{One line: what this project is and who it is for.}

## Non-negotiables
- {Rule an agent must never break, with a reason if it isn't obvious}
- Every important behaviour gets a verification strategy (see the `conventions` skill): test-first for business logic, validation, money or security rules and bug fixes. Never edit a test just to make it pass, and never claim done without showing the check output.
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
- [PRD](docs/PRD.md) · [Architecture](docs/ARCHITECTURE.md) · [Design](docs/DESIGN.md) {drop when no UI} · [Issues](../../issues) · [Decisions](docs/decisions/)
- Terms: [GLOSSARY](docs/GLOSSARY.md) {drop this line when there is no glossary}

## Conventions
- {Only conventions that tooling doesn't enforce and agents get wrong}

## Workflow
- Work comes from GitHub issues: branch `feat|fix|chore/<issue>-<slug>`, one PR that closes the issue, squash-merge once CI is green. Conventional Commits. {Solo: small manual fixes may commit to `main`; a pre-commit hook auto-formats | Team: PRs only}.
- New ideas become issues, not scope. Roadmap: `docs/ROADMAP.md`.
