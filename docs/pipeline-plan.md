# Pipeline plan

_Built 2026-11-21 (steps 1 to 9). Status and deviations are in the last section; per-skill health is in [skill-health.md](skill-health.md). Original draft: Moves the skills from "one chat drives a ROADMAP.md phase" to "GitHub Issues → up to 3 parallel jobs → one PR each". Open points are marked **[Q]** and get settled in grilling._

## Summary

- **Two phases.** `plan` is interactive: you answer every question in one sitting. `run` is unattended: build → checks.sh → review → approve/merge, 3 jobs at a time.
- **State lives on GitHub** (issues, labels, PR comments). The orchestrator is a script that keeps no state of its own.
- **3 new skills** (`pipeline`, `plan`, `review`), **5 removed** (`roadmap-next`, `gnhf`, `grill-with-docs`, `handoff`, `refine-idea`), and **stack content moves out of `project-starter`** into one personal layer (`stack-defaults`). 25 skills → 24, with far less overlap.
- **The core flow is stack-agnostic.** It only knows `checks.sh` (exit code + log) and the repo's `AGENTS.md`. Stack choices, templates and the TS rules are a layer you add on top.

## Flow

```
Issue (template) ─► plan (you present, Opus) ─┬─ reject: comment why, close
                                              ├─ split: sub-issues
                                              └─ ready: Goal / ACs / Out of scope / touches / size / risk
                                                   │
run.sh ── takes ≤3 ready issues with no `touches` overlap ──► worktree + branch per issue
  build (dev-loop, Sonnet S/M, Opus L or risky) ─► checks.sh ─FAIL≤3─► build
  review (modes routed by diff: code, ui, security) ─CHANGES≤2─► build
  review final (Opus): merge rules + every AC met ─┬─ gh pr merge --squash --auto --delete-branch
                                                   └─ needs-human (picked up by the next plan)
  cleanup: worktree remove, port freed, log line
retro (weekly or on demand): 3+ repeats in the log → PRs to skills, floors, templates
```

## Skill map

| Skill | Today | Verdict | Change |
|---|---|---|---|
| roadmap-next | Plan/build/close a ROADMAP.md phase | **Remove** | `plan` takes its batch-questions step and choice rules. `run.sh` takes build/close. Close's review becomes `review`; its doc updates go into the PR |
| gnhf | Overnight loop via external CLI | **Remove** | `run.sh --until <time>` does the same with the pipeline's caps. Two unattended runners would overlap **[Q]** |
| grill-with-docs | 2-line wrapper | **Remove** | Call grilling + domain-modeling directly |
| handoff | Session handoff doc | **Remove** | Each job's state is its issue + PR. Fresh sessions read those **[Q]** |
| refine-idea | 173-line ideation flow | **Remove** | "Worth building? / assumptions / not doing" becomes a short reference in `plan`. grilling covers stress-testing |
| **pipeline** (new) | | **New** | `SKILL.md` (how to run, labels, verdict contract, caps), `conventions.md` (branch, commit, PR, issue format), `scripts/run.sh`, `templates/` (issue templates, PR template, `checks.sh` contract, label setup), retro mode |
| **plan** (new) | | **New** | Triage all open issues in one session: reject / split / rewrite to the template, owned decisions with options + rec (+ mockups for UI), set size, risk, `touches`. New-project issues route to project-starter |
| **review** (new) | Built-ins `/code-review`, `/security-review` | **New, thin** | Modes `code`, `ui`, `security`, `final`. Routes by diff paths, wraps the built-ins, posts one verdict comment. `final` = the approver |
| dev-loop | The change loop + review + commit | **Keep, trim** | Becomes the builder. Drop roadmap-next coupling, Review step points to `review`, Commit step = push branch + PR body from `conventions.md`. Keeps "After a bug escapes" as the retro feed |
| project-starter | Kickoff + stack + clients + CI templates | **Keep, slim** | Agnostic kickoff only: PRD, ARCHITECTURE, DESIGN, AGENTS.md, then **files issues** (Phase 0 + first slice) instead of ROADMAP.md. Stack content moves out |
| **stack-defaults** (moved) | `project-starter/tech-stack.md`, `clients.md`, `contract-template.md`, `templates/*.yml` | **Move** | Your personal layer: stacks, template repos, CI, clients. Only project-starter and dev-loop's "standards skill" pointer refer to it |
| agents-md | AGENTS.md writer | Keep, edit | Template Workflow line: issue → branch → PR. Drop `roadmap-next` mentions |
| browser-e2e | UI check in browser | Keep, edit | Add "PR screenshots" (before/after for the `ui` review). Drop roadmap-next mentions |
| frontend-design | UI design rules | Keep, edit | shadcn/Radix default line moves to stack-defaults. Commit the pending `tactile.md` work first |
| tdd, systematic-debugging, codebase-design, data-modeling | Build references | Keep | Path fixes only (gnhf/roadmap-next mentions, tech-stack path) |
| decision-log, domain-modeling, design-md, grilling, market-research | Plan references | Keep | No change |
| typescript-standards, seo | Stack-specific | Keep | Part of the personal layer by nature. No change |
| cli-tooling, find-skills, refine-prompt, refine-skill | Meta | Keep | refine-skill checklist: drop the `agents/openai.yaml` exceptions once those skills are gone |

## Where things live

| Thing | Location | Notes |
|---|---|---|
| Work queue | GitHub issues + labels `ready`, `in-progress`, `needs-human` | Milestones replace ROADMAP phases **[Q]** |
| Product docs | `docs/PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `decisions/`, `GLOSSARY.md` | Unchanged. ROADMAP.md retired **[Q]** |
| Git/PR/issue conventions | `pipeline/conventions.md` | One file. Enforced in `checks.sh` where possible |
| Code antipatterns | `dev-loop/references/code-floor.md` (Refuse) | Already exists. No separate antipatterns file |
| UI antipatterns | `frontend-design/references/craft-floor.md` (Refuse) | Already exists |
| Data antipatterns | `data-modeling` (Refuse) | Already exists |
| Your taste in writing/process | `~/.claude/CLAUDE.md` | Already exists |
| Job log | `.pipeline/log.md` per repo, one line per job | Feeds retro **[Q]** location |

## Contracts

- **checks.sh** (per repo, every template ships one): runs lint, typecheck, tests, build. Exit 0 = pass. Writes the log to stdout. CI runs the same script as the required check.
- **Verdict line** (every stage's last comment): `VERDICT: READY | REJECT | NEEDS-INFO | CHANGES | APPROVE | ESCALATE` + a short JSON block (`size`, `risk`, `touches`, `findings`).
- **Caps:** checks.sh fails 3× → `needs-human`. Review >2 rounds → `needs-human`. Per-job token cap **[Q]**.
- **Never auto-merge:** migrations, auth/permissions, payments, major dependency bumps, new repo bootstrap, prod config, size L **[Q]**.

## Build order

| # | Step | Done when |
|---|---|---|
| 1 | Commit pending frontend-design work. Move stack content to `stack-defaults`, fix every reference (`rg 'tech-stack\|clients.md\|contract-template'`) | `check.sh` passes, project-starter has no stack facts |
| 2 | `pipeline` skeleton: conventions, verdict contract, labels, issue + PR templates, checks.sh contract | Templates usable by hand |
| 3 | `plan` skill (port from roadmap-next `plan` + choice rules + refine-idea essentials) | Plans a real issue backlog in one session |
| 4 | Trim `dev-loop` into the builder | One issue → green PR, run by hand |
| 5 | `review` skill with modes | Posts verdicts on that PR |
| 6 | `run.sh`: slots, worktrees, stage calls, caps, `--until`, cleanup | 3 issues → 3 PRs unattended |
| 7 | Retro mode + log | Proposes a PR from a seeded log |
| 8 | Remove the 5 skills, update README, AGENTS.md, both template repos (ship `checks.sh` + issue/PR templates) | `check.sh` passes, `rg` finds no stale names |
| 9 | Dry run: mermaid diagram + tracking dashboard (reads GitHub, no extra state) | You've watched one full cycle |

## Decisions (grilling)

| # | Decision |
|---|---|
| 1 | GitHub Issues replace `docs/ROADMAP.md`. Milestones = phases, unlabelled open issues = Later |
| 2 | Pipeline work always goes through a PR. Manual small edits may still commit to `main` (Solo) |
| 3 | Orchestrator runs locally. `run.sh` holds `caffeinate -i`, the laptop stays plugged in with the lid open, and re-running resumes from GitHub state. An always-on machine is a later option |
| 4 | Orchestrator is one dependency-free Node script (`run.mjs`) |
| 5 | gnhf removed, `--until <time>` replaces it |
| 6 | handoff and refine-idea removed. refine-idea essentials become a short reference in `plan` |
| 7 | Approver is `review final`, not its own skill |
| 8 | Auto-merge policy is per repo, default `safe` (no-go list: migrations, auth/permissions, payments, major deps, prod config, size L). `none` for client releases |
| 8a | Staging is deferred (future). All projects, personal and client, use PR preview deployments. When staging is added later: a `staging` Worker and Neon branch, test-mode Stripe and Resend, manual production trigger. Verify OpenNext env support and Neon branch limits then |
| 15 | Rename `code-floor.md` → `code-standards.md`, `craft-floor.md` → `ui-standards.md`. Refuse sections stay the antipattern lists |
| 16 | Keep the legal-minimum attributions (NOTICES, LICENSE.txt, README Origin, 3 one-line headers). Nothing else to strip |
| 17 | Keep a line only if it changes what a capable model does by default. ~500-word SKILL.md is a soft target, not enforced: lists and detail may run longer. refine-skill gains the default-behaviour test, retro proposes deletions, models and caps live only in `run.mjs` config. Token pass on frontend-design, dev-loop, seo, codebase-design |
| 18 | `stack-defaults/deprecations.md` table (Stack, Since, Avoid, Use instead, Checked). Lint `no-deprecated` first. Replaces the 3 scattered rules |
| 19 | New dependencies must be named in the issue, otherwise `review final` escalates. `run.mjs --check` verifies git, gh, node, claude. README gets a small skill dependency map |
| 20 | Responsive from 360px by default unless the issue or PRD says app-only or desktop-only. Rule moves to `ui-standards.md` (short Responsive section). Breakpoints per project in DESIGN.md |
| 21 | Process for adopting new tech: not designed now |
| 22 | Models and effort per step are fixed in `run.mjs` config (plan Opus high, build Sonnet medium, review code/ui Sonnet medium, review security and retro Opus high, review final Opus medium). Escalation rules: size L or risky → Opus; second failure → Opus. No Haiku in the pipeline. Confirm CLI flags at build time |
| 23 | `run.mjs status` gives a per-repo table. A finished run sends a macOS notification and a summary with the next command. Dashboard reads the same GitHub data, stores nothing new |
| 24 | `docs/skill-health.md` (status, last dry run, weak points, do-not-change notes). A `pipeline-sandbox` repo with 5 fixed issues, replayed after core skill changes |
| 25 | Process model: `run.mjs` is a plain Node process run in the background under caffeinate. Each stage is a fresh `claude -p` child process in the job's worktree (not Claude Code's Agent tool). Up to 3 jobs run at once. Stages inside a job are sequential; the routed reviews run in parallel. `plan` is the only interactive session |
| 14 | First pipeline project is the personal Astro template, with no database. Next.js + Neon is the second test |
| 9 | No job log file. Retro reads verdict comments on issues and PRs via `gh` |
| 10 | One `run.mjs` run across a repo list (`~/.config/pipeline/repos.txt`), 3 slots total. Per-repo override file is optional |
| 11 | New projects enter through interactive `/project-starter`, which creates the repo from a template and files the first issues |
| 12 | Three issue forms: Feature, Bug, Chore. Dependabot PRs skip plan and build |
| 13 | Each job has a 90-minute wall-clock cap, then `needs-human`. Spend cap depends on `claude` CLI flags, checked at build time |

## Built, and where it differs from the plan

| Item | What was built | Difference |
|---|---|---|
| 25 Models | Table in `pipeline/scripts/lib/config.mjs` | `claude` accepts `--model`, `--effort`, `--max-budget-usd` and `--permission-mode`, so a per-call and per-job spend cap exist (off by default) |
| Merge | Runner waits for CI (`gh pr checks`), then `gh pr merge --squash --delete-branch` | Not `--auto`: that needs branch protection on every repo |
| Findings | Added a `category` slug | Needed so retro can count repeats |
| Stage state | Derived from PR verdict comments | No state file, so a restart resumes |
| Dashboard | `run.mjs dashboard`, localhost only, `--demo` for sample data | Also shows retro repeats and `docs/skill-health.md` |
| Not verified | Real `gh` and real `claude -p` end to end | Tested with stubs only. `claude -p` failed auth from the build session, so the first real run is the dry run |
| Not done | Token pass on seo and codebase-design, `pipeline-sandbox` repo creation, template repos (`checks.sh`, issue and PR templates) | Sandbox script is written, not run. Template repos live on GitHub, outside this repo |

## Outside this repo

- `~/.claude/CLAUDE.md` links `project-starter/tech-stack.md` and says "Solo: commit to main". Both need editing after step 1 and the Solo/PR decision.
- Template repos (`astro-site-starter`, `nextjs-neon-starter`) need `checks.sh`, issue templates and a PR template.
