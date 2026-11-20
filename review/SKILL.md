---
name: review
description: Use when a pipeline PR needs a code, UI or security review or the final approval, or when asked to review a diff against the repo's acceptance criteria, standards and merge rules.
argument-hint: "code | ui | security | final  <owner/repo#PR>"
---

# Review

Judge one PR in a fresh context and post one verdict comment. Read-only: never edit code, push, or merge. The caller names the mode and the PR. Verdict format and caps: [pipeline](../pipeline/SKILL.md#verdict-comment). Done when the comment is posted.

## Setup (every mode)

1. Read the PR (`gh pr view`, `gh pr diff`), the linked issue (acceptance criteria, Notes, the `pipeline` metadata line), the repo's `AGENTS.md`, and the `checks.sh` result.
2. Review the diff against the base, not the whole repo. Search narrowly for what the diff touches.
3. **Round 2 onward:** review only what changed since your last verdict, and confirm each earlier blocker or major finding is fixed.
4. Challenge, don't summarise: misread requirements, missing edge cases, tests that pass by construction, regressions, partial failures, duplicate operations, needless complexity. Report only what you can show at `file:line` with a concrete failure. No praise, no style nits a linter would catch.
5. Findings are `blocker` (breaks an AC, security, data loss), `major` (likely bug, missing test for an AC), `minor` (listed, never looped on). `APPROVE` with minors is fine. Any blocker or major is `CHANGES`.

## Modes

| Mode | Runs when | Check against |
|---|---|---|
| `code` | Every PR | Each acceptance criterion has a test or check that would fail without the change. [code-standards](../dev-loop/references/code-standards.md) Verify and Refuse lists. Test integrity (no test edited just to pass). Diff scope (no unrelated changes). Decisions the PR lists |
| `ui` | The diff touches UI (`ui` risk or UI paths) | Run the app, preferably the preview deploy. Follow [browser-e2e](../browser-e2e/SKILL.md) in full mode: 360, 768 and 1280 widths, states, keyboard, console. Compare with `DESIGN.md` and the [ui-standards](../frontend-design/references/ui-standards.md) Verify and Refuse lists. Also judge the flow as a user: is the next step obvious, is the copy plain. Attach the screenshots to the PR (see [conventions](../pipeline/conventions.md)) |
| `security` | The diff touches a risk path (auth, session, migrations, env, API routes, webhooks, dependencies) or `risk` has `auth`, `data`, `money`, `deps` | Authorization checked server-side on every read and write, deny by default, unknown identity fails closed. Input validated at the boundary, queries parameterized, no SSRF, no secret or personal data in logs, commits or client bundles. Dependency additions are named in the issue, maintained and necessary. Migrations are reversible or expand-and-contract |
| `final` | After the other reviews approve | See below |

If the built-in `/code-review` or `/security-review` is available, use it as a second pass for its mode and merge its findings. It never replaces the checks above.

## Final

The approver. Merging is the runner's job: you only decide.

1. Every acceptance criterion is met, with evidence (a passing test, a check, a screenshot). List each as met or not.
2. All other reviews have `APPROVE` and `checks.sh` is green on the PR head.
3. The PR body is complete: `Closes #N`, What, Why, How tested, screenshots for UI.
4. Any new dependency was named in the issue.
5. The merge policy in `.pipeline.yml` (default `safe`): under `safe`, a hit on the [escalate list](../pipeline/conventions.md#merge-policy) means `ESCALATE`. Under `none`, always `ESCALATE` with "ready to merge" as the summary.
6. The branch is mergeable. If the base moved, say so: the runner rebases and re-runs checks before merging.

`APPROVE` only if all hold. `ESCALATE` says in three lines what the human must decide and your recommendation, so it is a 30-second call.
