---
name: pipeline
description: Use when setting up a repo for the issue-to-merged-PR pipeline (issue forms, PR template, checks.sh, labels), when filing or labelling issues for it, or when reading or writing a pipeline stage's verdict comment.
---

# Pipeline

Work flows through GitHub, not through chat: **issue → plan → job (worktree + branch) → build → `checks.sh` → review → final → merged PR that closes the issue**. Up to 3 jobs run at once. All state is on GitHub (issues, labels, comments), so a stopped run resumes by running again. This skill holds the contracts every stage and every repo shares. Stage skills: `plan`, `dev-loop` (build), `review`.

Core rule: the flow knows only the repo's `AGENTS.md` and its `checks.sh`. Stack, framework and test tool are the repo's business ([stack-defaults](../stack-defaults/SKILL.md) is the personal layer, never required).

## Labels (the whole state machine)

| Label | Meaning | Set by |
|---|---|---|
| `ready` | Planned, waiting for a free slot | `plan` |
| `in-progress` | A job owns it | the runner |
| `needs-human` | Stuck or escalated. The comment says what is needed in 3 lines | any stage |

No label: not yet planned (or done: the PR closes the issue). Create them with [templates/labels.sh](templates/labels.sh).

## Issue body

`plan` rewrites every issue to this shape. The last line is machine-read:

```md
## Goal
One or two sentences: what changes for whom.
## Acceptance criteria
- Observable result, one per line (each becomes a test or a check)
## Out of scope
- ...
## Notes
Decisions made, links.
<!-- pipeline: {"size":"S|M","risk":[],"touches":["src/area"]} -->
```

- `size`: S or M. L is split into sub-issues before it can be `ready`.
- `risk`: any of `auth`, `data`, `money`, `deps`, `infra`, `ui`. Drives model choice and which reviews run.
- `touches`: areas of the repo. Two jobs with overlapping `touches` never run together.
- New dependencies are named in Notes. An unnamed one escalates at final review.
- `Depends on #N` in Notes: the runner skips the issue until #N is closed.

## Verdict comment

Every stage ends with one comment, always in this shape, and the runner parses only this:

````md
<!-- pipeline:stage -->
Short human summary (3 lines max).

VERDICT: <value>
```json
{ "stage": "plan|build|review-code|review-ui|review-security|final", "findings": [] }
```
````

| Stage | Verdicts | On |
|---|---|---|
| plan | `READY` `SPLIT` `NEEDS-INFO` `REJECT` | NEEDS-INFO: ask the author, label `needs-human`. REJECT: say why, close |
| build | `DONE` `BLOCKED` | BLOCKED: `needs-human` with evidence |
| review-* | `APPROVE` `CHANGES` | CHANGES: the same builder fixes from one merged findings list, checking each finding against the code first and disputing a wrong one with evidence in its `build` comment |
| final | `APPROVE` `ESCALATE` | APPROVE: merge if the repo's merge policy allows. ESCALATE: `needs-human` |

A finding is `{"severity":"blocker|major|minor","category":"","file":"","line":0,"issue":"","fix":""}`. `category` is a short stable slug (`missing-test`, `scope-creep`, `authz-check`, `responsive`), reused across PRs so retro can count repeats. Blockers and majors must be fixed. Minors are listed in the PR and not looped on.

## Caps

`checks.sh` fails 3 times, review needs more than 2 rounds, or a job passes 90 minutes: the job goes to `needs-human`. Each `claude` call is capped at $5 and a job at $15 (checked after each stage, so a job can overshoot by up to one call). Models, effort and the caps live in the runner's config, never in a skill, so a model upgrade changes one line.

## Run it

The runner is `scripts/run.mjs` (Node, no dependencies). It is a plain script, not an agent: it picks `ready` issues across the repos in `~/.config/pipeline/repos.txt` (`owner/name /path/to/clone` per line), makes a worktree and branch per job, and runs each stage as a fresh `claude -p` process. Models, effort and caps are in [scripts/lib/config.mjs](scripts/lib/config.mjs), overridable in `~/.config/pipeline/config.json`.

```bash
node ~/.agents/skills/pipeline/scripts/run.mjs check            # git, gh, claude, repos, labels, checks.sh
node ~/.agents/skills/pipeline/scripts/run.mjs --dry-run        # what would start
node ~/.agents/skills/pipeline/scripts/run.mjs --until 07:00    # run; stops starting jobs at 07:00
node ~/.agents/skills/pipeline/scripts/run.mjs status           # queue, running, needs-human, merged today
node ~/.agents/skills/pipeline/scripts/run.mjs clean            # remove worktrees of closed issues
node ~/.agents/skills/pipeline/scripts/run.mjs retro            # repeated problems become PRs (see retro.md)
node ~/.agents/skills/pipeline/scripts/run.mjs dashboard        # local page: needs-you, running, ready, merged, repeats, skill health (--demo for sample data)
```

The flow as a diagram: [docs/flow.html](../docs/flow.html). Skill status and weak points: [docs/skill-health.md](../docs/skill-health.md).

Stopping and re-running resumes: a job's stage is derived from its PR's verdict comments. Tests: `node --test scripts/test/runner.test.mjs` (fake `gh` and `claude`).

## The repo kit

Copy these into a repo (the template repos ship them). Git, PR and merge rules: [conventions.md](conventions.md).

| File | Goes to | Purpose |
|---|---|---|
| [templates/checks.sh](templates/checks.sh) | `checks.sh` | The gate: exit 0 = pass. Builder runs it locally, CI runs the same script as the required check |
| [templates/issue-feature.yml](templates/issue-feature.yml), [issue-bug.yml](templates/issue-bug.yml), [issue-chore.yml](templates/issue-chore.yml) | `.github/ISSUE_TEMPLATE/` | Short forms for the author. `plan` does the rest |
| [templates/pull_request_template.md](templates/pull_request_template.md) | `.github/` | PR body: `Closes #N`, What, Why, How tested, Screenshots |
| [templates/pipeline.yml](templates/pipeline.yml) | `.pipeline.yml` (optional) | Per-repo overrides: merge policy, risk path globs |
| [templates/labels.sh](templates/labels.sh) | run once | Creates the three labels |
