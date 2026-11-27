---
name: conventions
description: Use when writing code or UI, committing, naming a branch, opening or describing a PR, finishing any task, or adding a lasting preference or antipattern to the list. The single home for git, PR, code and UI rules.
---

# Conventions

Tony's rules in one place. A repo's `AGENTS.md` overrides this skill. Each fact lives here once; other skills link to it.

## Git
| Thing | Rule |
|---|---|
| Branch | `feat\|fix\|chore/<issue>-<slug>`, e.g. `feat/42-contact-form`. Solo work on `main` follows the repo's Workflow line |
| Commit | Conventional Commits, imperative, subject ≤72 chars, body says why. Scope is the area or skill name. No `Co-Authored-By` or "Generated with" lines |
| PR | One concern, roughly ≤400 changed lines. Body from [pull-request-template.md](references/pull-request-template.md), starting `Closes #N`. Squash merge after CI is green |
| UI PR | Before/after screenshots or the preview URL. `gh` cannot upload images, so push them to an orphan `pr-assets` branch and link the raw URLs |
| Worktree | Parallel work only, max 3 besides `main`, own install, `.env` and port. Remove after merge, then `git worktree prune` |
| Never | `--no-verify`, force-push `main`, commit secrets, edit a test just to pass it, create accounts, keys or paid resources, or change live infrastructure without asking |

## Before writing code
Take the first option that fully works: (1) skip it if nobody asked, and say what you skipped; (2) reuse what the codebase has; (3) the standard library or platform; (4) an installed dependency; (5) one line a reader gets at a glance; (6) the minimum new code. Be lazy about the solution, never about the change: finish every caller, test and fixture it breaks. Bug fix: fix the root cause once in the shared code.

## Rules by area
| Area | Read |
|---|---|
| Code: Verify, Conventions, Comments, Refuse | [references/code.md](references/code.md) |
| Done checks: pitfalls, test tiers, test integrity, review | [references/verify.md](references/verify.md) |
| UI: Verify, Responsive, Conventions, Refuse | [references/ui.md](references/ui.md) |
| Physical controls, the `@tonylxm` registry | [references/tactile.md](references/tactile.md) |
| Stack, deploys, clients | `stack-defaults` |

## Antipatterns (cross-cutting)
- **No silent fallbacks.** A backup path, default or retry that hides a failure produces bugs later. Fail loudly: log it as an error (with identifiers, no secrets) and surface it. A fallback is allowed only when the brief or an ADR names it.
- Add to this list only after a pattern recurs across projects. One line, stated as the rule.

## Finishing a task
End every task with one line: `Next: <skill or command>, because <reason>`. Name the real next step (e.g. `/simplify` then `/code-review` then `/ship`, `to-tickets`, merge, or "done, nothing pending"). If the next move is the user's call, ask that one question instead.

## Adding a convention
Write the rule where it belongs (table above), one line, with the reason if it isn't obvious. Edit in `~/.agents/skills`, never a project copy. `retro` proposes additions; Tony approves them.
