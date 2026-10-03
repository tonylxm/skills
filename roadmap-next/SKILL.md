---
name: roadmap-next
description: Use when continuing work on a project that has a ROADMAP.md, e.g. "what's next", "plan the next phase", "build the next task", "work through the roadmap", or "close out this phase".
argument-hint: "plan [--issues] | build [task] | close"
---

# Roadmap Next

Move a project forward one step at a time from `ROADMAP.md`. The roadmap's checkboxes are the source of truth for what is done. With no mode given, pick one:
- **plan** if the current phase has no tasks.
- **build** if it has unchecked tasks.
- **close** if every task is checked.

Before any mode, read `ROADMAP.md`, `AGENTS.md`, `GLOSSARY.md`, and the parts of `MVP_PRD.md` the phase refers to. The Workflow line in `AGENTS.md` sets the mode: **Solo** (commit to `main`, the default when it's missing) or **Team** (branch and PR). The current phase is the first one that still has unchecked items.

If the phase's task lines have issue numbers, sync them first: run `gh issue list --label "phase-<n>" --state closed --json number,stateReason,closedByPullRequestsReferences`, tick each unchecked task whose issue was closed as `COMPLETED` by a pull request, and tell the user which ones you ticked. Work merged elsewhere (by a teammate or a cloud agent) would otherwise leave the roadmap stale. For an issue closed any other way (not planned, or closed by hand with no PR), ask the user before ticking it. `close` re-verifies the whole phase either way.

On `main`, also sync work merged from worktrees: run `git log -50 --format=%B --grep='^Roadmap-Task:'`, tick each unchecked task named in a `Roadmap-Task:` trailer, and add each `Todo:` trailer line to `TODO.md` unless it's already there. Report any trailer that matches no task line (the task was probably reworded) and ask which task it belongs to. Never skip one silently. Solo: commit the result to `main` as `docs(roadmap): sync merged tasks`. Team: `main` only changes through PRs, so include it in the next task's branch.

## plan

Break the current phase into tasks. If the phase already has tasks, show them and ask whether to revise them or go to `build`. Use the format in [roadmap-format.md](roadmap-format.md).
- **Size each task** at roughly 1–4 hours: a vertical slice that can be tested and shipped on its own. List them in dependency order.
- **Acceptance criteria:** each task gets 1–3, taken from the PRD. Never invent requirements.
- **Choices:** if a task needs a product or design choice the docs don't cover, ask the user (giving your recommended answer) before writing the task.
- **`--issues`:** if `gh auth status` succeeds, create one issue per task. Use `gh issue create --title "<task>" --body "<criteria + link to ROADMAP.md>" --label "phase-<n>"`, creating the label if it's missing. Add `(#<num>)` to the task line. If `gh` isn't available, say so and continue with markdown only.
- **Parallel tasks:** add `(parallel)` to a task line when it depends on no unfinished task and touches different files from the other `(parallel)` tasks. Only these go to separate worktrees.
- **Confirm:** show the task list and wait for the user to confirm it before building.

## build

Implement the next unchecked task, or the one the user names.

1. **Restate the goal.** Give the task and its acceptance criteria in two lines, and name the files you expect to touch.
2. **Implement it with the tdd skill**, following the stack's standards skill (typescript-standards or dotnet-standards) if one applies. For UI work, also use the frontend-design skill and follow `DESIGN.md`. When something fails unexpectedly, switch to the systematic-debugging skill. Don't guess at fixes.
3. **Verify before ticking.** Ticking the task requires fresh evidence, run in this session:
   - The full test, lint and typecheck commands from `AGENTS.md` all pass. Show the summary line from each.
   - Each acceptance criterion is checked one by one.
   - For user-facing changes, the app actually runs and the change is visible. For UI, use the frontend-verify skill; otherwise the run skill or a curl.

   If any check fails, say so and keep the task unchecked.
4. **Update the docs:**
   - Tick the task.
   - Record any significant choice made along the way with the decision-log skill.
   - Add any out-of-scope ideas or follow-ups to `TODO.md`, one line each. Don't widen the current task.
   - **In a worktree,** leave `ROADMAP.md` and `TODO.md` untouched: parallel branches editing them conflict on merge. Put a `Roadmap-Task: <task line text>` trailer, plus one `Todo: <line>` trailer per follow-up, in the commit message instead, and repeat them at the end of the PR body so a squash merge keeps them. The sync above applies them once the branch merges to `main`.
5. **Commit** if the user's workflow commits per task. Use `Closes #<num>` when the task line has an issue number. Then stop and report what was done and the next task. Continue to the next task only if the user asked for the whole phase.

## close

Run this when every task in the phase is checked.

1. **Review the phase's diff.** Run `/code-review`, `/security-review` and `/simplify` (or the agent's equivalents) on everything the phase changed. Fix the findings, or list them for the user if they're not worth fixing now.
2. **Re-verify.** Re-run the full verification from build step 3.
3. **Update the docs:**
   - Run the agents-md skill in update mode, to capture conventions the phase taught.
   - Update `MVP_PRD.md` or `DESIGN.md` if the shipped reality differs from them.
   - Move the completed phase to `docs/roadmap-archive.md` (create the file on first use, and add the archive link to the `ROADMAP.md` header at the same time) as a summary line plus the task list, and leave a one-line "Done" entry in `ROADMAP.md`.
4. **Summarise the phase:** what shipped, how it was verified, and `Closes #…` for each open issue.
   - Solo: the tasks are already on `main`. Put the summary in the close commit and the report.
   - Team: use it as the PR title and body. Open the PR only if the user asks.
