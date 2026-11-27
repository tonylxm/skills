---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

If the user passes a ticket reference, fetch it from the issue tracker and state its title before starting. If the reference is ambiguous, ask.

Call the Skill tool with "tdd" at pre-agreed seams. Skip it for test-only or docs tickets.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, run `/simplify`, then `/code-review` (both built in) and fix what they report. Follow [conventions](../conventions/SKILL.md) for commits.

Work on a branch named per [conventions](../conventions/SKILL.md). If you are on the default branch or a `worktree-*` branch, create `feat|fix|chore/<issue>-<slug>` first. Commit your work to it. End with `Next: /ship`.
