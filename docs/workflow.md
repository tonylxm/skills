# Workflow

Summary: no runner and no flow skills. Each skill ends with `Next: <step>`, you stay the conductor, and parallel tickets run as background sessions. Built-ins do the rest.

## Chains
| Scenario | Chain |
|---|---|
| Feature | `grill-me` → `to-spec` → `to-tickets` → `implement #N` per ticket (one background session each, max 3 worktrees) → `/simplify` → `/code-review` → `/ship` |
| Bug | `diagnosing-bugs` → `/code-review` → `/ship` |
| New client site | `grill-me` → `stack-defaults` → `project-starter` → Impeccable (`init`, `document`) → build → Impeccable `polish` and `audit` → `seo` → `browser-e2e` → `/ship` |
| UI exploration | `prototype` (or Impeccable `generate`) → Impeccable `critique` → pick → `browser-e2e` → `/ship` |
| Tiny tweak | Edit, `/ship`. No skill fires |
| Mechanical change across many files | `/batch` |
| Recurring check | `/loop` or `/schedule` |

A big mid-feature decision (schema, auth): `/advisor opus` from a Sonnet session.

## Roadmap
One `docs/ROADMAP.md` per project (template: [project-starter/templates/ROADMAP.md](../project-starter/templates/ROADMAP.md)). Each line is an outcome linked to an issue. `to-spec` and `to-tickets` consume "Next" items, and `retro` proposes the tidy-up of "Done".

## Models
| Work | Model |
|---|---|
| Search, log triage, simple edits | Haiku (`scout` agent) |
| Build and review | Sonnet (subagent default) |
| Planning, design, hard debugging, final review | Opus (`reviewer` agent, or `/advisor`) |

## Goals and where they are covered
| Goal | Covered by |
|---|---|
| Visible parallel progress | Background sessions and the sidebar, `/tasks` |
| Done alerts | Notification hooks ([harness/](../harness/README.md)) plus the desktop app's own |
| History and changelog | Conventional Commits with the skill as scope, `git log -- <skill>`, release notes on tags |
| Concise output | `concise` output style |
| Prototyping | `prototype`, Impeccable `live` and `generate`, the browser pane |
| Self-improving | `retro` → `conventions` (Napkin on trial) |
| No overlap | One skill per job; reviews stay with the built-ins |

## Not covered
Nothing starts `ready` issues unattended (v1's runner did). Add a `/schedule` task for it only when you miss it.
