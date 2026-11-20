# Conventions

One place for git, PR and merge rules. `checks.sh` enforces what a script can (branch name, commit subjects), so reviews never spend tokens on it. A repo's `AGENTS.md` overrides this file.

| Thing | Rule |
|---|---|
| Branch | `feat\|fix\|chore/<issue>-<slug>`, e.g. `feat/42-contact-form`. One per job |
| Commits | Conventional Commits, imperative, subject ≤72 chars, body says why. Scope is the area or skill name |
| Issue title | Starts with the type: `feat: `, `fix: `, `chore: `. The PR title is the squash commit subject |
| PR | One concern per PR, roughly ≤400 changed lines. Body from [templates/pull_request_template.md](templates/pull_request_template.md), starting `Closes #N` |
| Merge | Squash, delete branch. Only after `checks.sh` is green in CI |
| UI changes | Before/after screenshots in the PR. Prefer the preview deploy URL. `gh` cannot upload images, so otherwise push them to an orphan `pr-assets` branch and link the raw URLs |
| Worktrees | One per job, own install, own `.env`, own port. Removed after merge, then `git worktree prune` |
| Never | `--no-verify`, force-push `main`, commit secrets, edit a test just to pass it |

## Merge policy

Per repo, in `.pipeline.yml` (default `safe`):

| Policy | Behaviour |
|---|---|
| `safe` | Auto-merge unless the PR hits the list below |
| `all` | Always auto-merge. Pre-launch projects only |
| `none` | Never auto-merge. Every PR waits for you. Use once a client site has real users |

**Escalated under `safe`** (`all` ignores this list, `none` never merges): database migrations, auth or permissions, payments, major dependency bumps, an unnamed new dependency, production config or env, new repo bootstrap, size L.

## Risk paths

Intake predicts risk, but the diff decides which reviews run. Defaults (override in `.pipeline.yml`): `auth`, `session`, `middleware`, `migrations`, `schema`, `.env*`, `wrangler*`, `api/`, `webhooks`, `package.json` and lockfiles.
