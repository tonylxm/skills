---
name: roadmap-next
description: Use when a repo has docs/ROADMAP.md and the user wants to move it forward, e.g. "what's next", "where am I", "continue the project", "plan the phase", "build the phase", "work through the roadmap", or "close out this phase".
argument-hint: "[status | plan | build | close]"
---

# Roadmap Next

Move a project forward one phase at a time from `docs/ROADMAP.md`. The user answers questions once, in `plan`; `build` and `close` then run the whole phase without stopping. Older repos keep `ROADMAP.md`, `MVP_PRD.md` and `TODO.md` at the root: use those where they exist, and treat `TODO.md` as the Later section. The roadmap's checkboxes are the source of truth for what is done.

The current phase is the first one with unchecked tasks or no tasks yet. With no mode given, pick one:
- **plan** if the current phase has no tasks.
- **build** if it has unchecked tasks that aren't `BLOCKED`, or any `BLOCKED (setup)` task to retry.
- **close** if every task is checked or `BLOCKED`.

If the only unchecked tasks are `BLOCKED (setup)` and the retry at the start of `build` shows none can proceed yet, print the setup checklist and stop. Don't re-run `close`.

Before any mode, read `docs/ROADMAP.md`, `AGENTS.md`, `docs/GLOSSARY.md`, and the parts of `docs/PRD.md` and `docs/ARCHITECTURE.md` the phase refers to. The Workflow line in `AGENTS.md` sets the mode: **Solo** (commit to `main`, the default when it's missing) or **Team** (one `feat/phase-<n>` branch per phase, merged by PR).

## Asking the user

Every question is clickable: use AskUserQuestion where it exists (numbered options otherwise), at least two options, recommended option first. It takes up to 4 questions per call, so use as many calls as needed. Then act on the answers in the same chat. Never just refuse or explain what to run instead.

If the mode the user ran doesn't fit the state, ask:

| Ran | State | Options |
| --- | --- | --- |
| `plan` | Phase has unchecked tasks | Continue build (recommended) / Revise the unchecked tasks |
| `plan` | All tasks checked | Close the phase (recommended) / Add tasks |
| `build` | Phase has no tasks | Plan it first (recommended) / Stop |
| `build` | All tasks checked or `BLOCKED` | Close the phase (recommended) / Stop |
| `close` | Unchecked tasks that aren't `BLOCKED` | Finish the build (recommended) / Close anyway |
| any | No roadmap | Run `/project-starter` (recommended) / Stop |

## status

Read-only: print where the project is, then ask the next-step question. Format:

```
Phase 1/3: {name} | task 1.3/4: {task text}
BLOCKED 1.4: {reason}
Next: /roadmap-next build
```

- `1/3` is the current phase's number over the highest phase number (Phase 0 is never counted). `1.3` is the next unchecked, non-`BLOCKED` task; `/4` is the highest task number in the phase.
- Leave out the `BLOCKED` lines when there are none.
- `Next:` per state: no roadmap → `/project-starter "idea"`; no tasks → `/roadmap-next plan`; unchecked tasks → `/roadmap-next build`; only `BLOCKED (setup)` left → "finish the setup checklist, then `/roadmap-next`"; all checked or `BLOCKED` → `/roadmap-next close`; every phase done → say the MVP is complete and point to the Later section.
- Then offer that step as the recommended option.

## plan

Break the current phase into tasks. **Plan writes only `docs/ROADMAP.md`.** It never edits code, config or other docs, installs packages, or runs builds or tests, even in auto mode. Use the format in [roadmap-format.md](roadmap-format.md).

1. **Ask everything now, in one batch**, each question with a recommended answer, so `build` has nothing left to ask:
   - product or design choices the docs don't cover,
   - assumptions you would otherwise make,
   - each item in the phase's `Review notes` (left by the last `close`); a "carried over" task becomes a task of this phase unless the user drops it,
   - accounts, keys or paid services the phase will need, only to decide what `build` provisions itself and what goes on the setup checklist (they are usually not set up yet, so never ask for the values).
2. **Write the tasks.** Each is roughly 1–4 hours, a vertical slice that can be tested and shipped on its own, in dependency order. Each gets 1–3 acceptance criteria taken from the PRD (never invented), observable at a public interface. Those ACs are the agreed test seams for the tdd skill. If the phase passes ~8 tasks, suggest splitting it.
3. **Confirm.** Show the task list in chat and ask: Build it (recommended) / Change something. Write the tasks into `docs/ROADMAP.md` (and remove the answered `Review notes`) only after the user confirms, then go straight into `build`.

**Revising a phase in progress:** change only unchecked tasks (add, drop, reword). New tasks take the next free ID. Never edit checked tasks.

## build

Build every unchecked, non-`BLOCKED` task in the phase, in order, without stopping to ask. `build <task ID>` (e.g. `build 1.3`) builds just that one task, for unblocking or one gnhf iteration, and never runs `close`. For a `BLOCKED` task, read its reason first; if it names a stash, `git stash pop` it; delete the line once it's fixed.

**Resume first.** If `git status` shows uncommitted changes in the files of the next unchecked task, finish and verify that task before anything else. Never discard changes. Any other uncommitted changes are the user's: leave them alone and mention them in the report. Then retry every task marked `BLOCKED (setup)`: if its prerequisite now works, delete the line and build the task.

**Branch.** Team: create `feat/phase-<n>` if it doesn't exist and work on it.

**Prerequisites.** Accounts, keys and env values are usually not set up yet, so never wait for them. Do everything that needs no setup first. When a task needs an account or key, do the provisioning yourself with `gh`, other CLIs or connected MCP tools if the user is logged in or has authorized them; otherwise mark the task `- BLOCKED (setup): {numbered steps for the user, with links, saying exactly what to copy or authorize}` and move on.

**Each task runs in its own subagent** with a fresh context: the task, its ACs, and which docs to read. Start each with the Agent tool and `model: "sonnet"`; if a task fails verification twice, re-run it with `model: "opus"`. Running `/roadmap-next build` is the user's request for these subagents. Without subagents, work inline; without a model choice, ignore the model split. The subagent does steps 1–3 and returns the evidence; you check that evidence before ticking. If a subagent can't reach browser tools, it says "not verified in browser", and you run the quick UI check yourself before ticking.

1. **Restate the goal.** Task, ACs, and the files you expect to touch.
2. **Implement it with the tdd skill**, following the stack's standards skill (typescript-standards or dotnet-standards) if one applies. For UI work, also use frontend-design and follow `docs/DESIGN.md`. When something fails unexpectedly, switch to systematic-debugging. Don't guess at fixes.
3. **Verify before ticking.** Fresh evidence, run in this session:
   - Lint and typecheck from `AGENTS.md` pass, and so do the tests covering the changed code (the whole suite if it runs in under a minute or you can't tell which tests are affected). Show each summary line.
   - Each AC is checked one by one.
   - User-facing changes actually run: for UI, frontend-verify in quick mode (no screenshots); otherwise the run skill or a curl.
4. **Record.** Tick the task. Significant choices go through decision-log. Out-of-scope ideas go in Later, one line each; don't widen the task.
5. **Commit, don't push.** One commit per task, staging only the files the task touched (never `git add -A`). Solo: on `main`, which deploys to production once pushed, so nothing leaves the machine until `close`. Team: on the phase branch.

**Never stop to ask mid-phase:**
- Minor unforeseen choice: take the option most consistent with the docs, and note it for the close report.
- A check still failing after systematic-debugging and the Opus re-run (about 3 fix attempts in all): `git stash push -u -m "<task ID> wip"`, add `- BLOCKED: {reason, evidence, stash name}` under the task, and move on.
- Missing user prerequisite: `- BLOCKED (setup): ...` as above, and move on.
- Skip tasks that depend on a `BLOCKED` one.

When no unblocked tasks remain, run `close`.

## close

Safe to re-run: skip any step that has already happened (review fixes committed, phase archived, branch pushed).

1. **`BLOCKED` tasks:** never ask here, so an unattended run still finishes. Move each plain `BLOCKED` task out of the phase into the next phase's `Review notes` (Later if there is no next phase) as `carried over: {task, reason, stash name}`, so the next `plan` picks it up, and list it in the report. Tasks marked `BLOCKED (setup)` stay: the phase stays open (no archive, no `✅`) until the user finishes the setup and re-runs `/roadmap-next`, so the next phase never starts on a missing foundation.
2. **Review the phase's diff,** each in a subagent so the diff doesn't fill this context: `/code-review medium` (`high` when the security review also runs), `/simplify`, and `/security-review` only if the phase touched auth, user input, secrets, permissions or dependencies. Fix the findings, or list them in the report if they aren't worth fixing now.
3. **Re-verify.** Full test suite, lint and typecheck. For UI, one frontend-verify pass with screenshots over every screen the phase changed.
4. **Update the docs:**
   - Run agents-md in update mode for conventions the phase taught.
   - Update `docs/PRD.md`, `docs/ARCHITECTURE.md` or `docs/DESIGN.md` where the shipped reality differs.
   - Unless a `BLOCKED (setup)` task remains, move the phase's task list to `docs/roadmap-archive.md` (create it on first use and link it from the roadmap header) and leave its `✅` heading line.
   - Add `Review notes` under the next phase heading (under Later if there is no next phase): assumptions made during build, and what to try in the app. The next `plan` asks about them, so the feedback survives a new chat.
5. **Push.** If there is no remote yet (repo creation is `BLOCKED (setup)`), skip this and keep it on the checklist. Solo: push `main` (this deploys). Team: push the phase branch and offer to open the PR, using the report as its body.
6. **Report:** what shipped, how it was verified, assumptions to confirm, tasks moved on because they were `BLOCKED`, any setup checklist (the numbered steps, together in one place), what to try in the app, then: "Start a new chat and run `/roadmap-next`." Solo `close` has already deployed `main`, so say so.
