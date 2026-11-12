---
name: dev-loop
description: Use when implementing any non-trivial code change (feature, bug fix, refactor, client request), on its own or as a roadmap-next task, or when unsure how much to explore, plan, test, verify or review before calling a change done.
---

# Dev loop

The loop for one change: **Goal → Explore → Plan → Implement → Verify → Review → Commit**. Done means the acceptance criteria are met, with fresh evidence, and the change is committed or handed back. Ad-hoc work runs it directly. roadmap-next runs it once per task, and its rules win there: the task subagent stops after Verify (the orchestrator commits, and Review runs once per phase in `close`), and "stop and ask" becomes a `BLOCKED` mark, never a question.

## Core rules
1. **Requirements over tests.** Never trade the actual requirement for a passing test.
2. **Verify independently.** The agent that wrote the change is not the only source of confidence: checks, CI and a fresh-context review are.
3. **Test behaviour, not implementation.** Invariants, integration tests, critical E2E journeys and behavioural evals beat piles of mocks and unit tests.
4. **Stop when uncertain.** Don't guess requirements, retry a failing approach, or manufacture a pass.
5. **Improve the harness.** When a bug escapes, ask why the workflow missed it and add the smallest durable guardrail.

## Pitfalls
| Pitfall | Do instead |
|---|---|
| Editing or deleting a test to go green | Classify the failure first (below); explain any test change |
| Special-casing fixtures or assertions | Fix the general behaviour |
| "Done" without running anything | Show fresh check output |
| Retrying the same failing fix | After 2 tries switch to systematic-debugging; after 3, stop |
| Repo-wide exploration, reading whole large files | Targeted search of the area you touch |
| Scope creep, drive-by refactors, speculative abstractions | Note them as follow-ups |
| Mocking your own code | Mock only at system boundaries |
| Silent assumptions about requirements | State them; stop on consequential ones |
| Reviewing only your own work | `/code-review` in a fresh context |

## 1. Goal
Restate the goal, its observable acceptance criteria (from the user, the task or `docs/PRD.md`), and the edge cases that matter (invalid input, boundaries, money rounding, repeats). If requirements, tests and code disagree, investigate which is wrong; don't make the tests pass by default.

## 2. Explore
For non-trivial work, read the code you will touch, the patterns next to it, its tests and the docs it cites (`AGENTS.md`, `docs/GLOSSARY.md`, ADRs for the area). Search narrowly with `rg`; skip anything the change can't reach.

## 3. Plan
For meaningful changes, a few lines: files, approach, how each criterion gets verified. Prefer the smallest change and the existing architecture unless there is a concrete reason to depart (then use decision-log).

## 4. Implement
Small increments, each left working. Preserve existing behaviour unless the requirement changes it. Follow the stack's standards skill (typescript-standards, dotnet-standards); UI follows frontend-design.

Pick the verification per behaviour, before writing code:

| Behaviour | Strategy |
|---|---|
| Business logic, algorithms, state machines, validation, money or security invariants, regression bugs | Test-first with the tdd skill |
| CRUD, styling, UI exploration, straightforward integrations | Implement, then integration test or browser-e2e check as the risk warrants |
| AI or agent behaviour | Behavioural evals, see [agent-evals.md](agent-evals.md) |

Prefer a few strong invariants over many shallow tests: invalid state transitions are impossible, completed records can't be mutated, users can't read other users' data, money stays consistent, required operations are idempotent. Test levels and mocking: [tdd/testing.md](../tdd/testing.md).

## 5. Verify
Cheapest effective check first. Never run the whole suite in the inner loop.

| Tier | When | Run |
|---|---|---|
| 1 | While editing | The single test or file you're working on |
| 2 | Change done | Whole-project lint and typecheck, plus tests for the changed area (the test map in `AGENTS.md` Commands) |
| 2b | Shared modules, schema or migrations, auth, dependencies or lockfile, config or env, shared fixtures touched; related tests unclear; or the suite runs under ~2 min | Full suite. Lean towards it in unattended runs |
| 3 | Before push, merge or deploy (roadmap-next `close`) | Full suite, all E2E journeys, production build. CI repeats it and is the hard gate |

- **Evidence:** command, exit code, and pass/fail/skip counts. "Tests pass" on its own is a claim, not evidence. For test-first work, also show each new test failing before the fix.
- **Quiet output:** use reporters that print only failures plus the summary counts, so a green run costs a few lines of context.
- **UI or full-stack changes:** also run browser-e2e against the running app.

**Test integrity.** Never change an existing test just to make the code pass. When one fails, decide: is the implementation wrong, the test wrong, the requirement changed, or the environment or data wrong? Change a test only for the second or third, and say why in the report and commit body.

## 6. Review
Review in a fresh context with `/code-review`, plus `/security-review` when auth, input handling, secrets, permissions or dependencies changed. Risk decides, not size: always review changes to money, auth or permissions, user data, concurrency, external contracts or migrations, even a one-character fix. Skip only for copy, styling, docs, or a pure refactor already covered by tests; anything else is a judgment call. The reviewer challenges, not summarises: misread requirements, missing edge cases, tests overfit to the code, regressions, authorization holes, races, partial failures, duplicate operations, backwards compatibility, needless complexity. Fix findings or list them.

## 7. Commit
Commit at green checkpoints, one concern per commit, never mixing unrelated changes, so each is easy to review and revert. Branch and commit rules come from `AGENTS.md` Workflow.

## When stuck or uncertain
- If the correct behaviour can't be determined: stop, explain the uncertainty, and name the smallest decision the user must make.
- Unexpected failures go to systematic-debugging.
- A noisy or overloaded context: write a handoff (the handoff skill) and continue in a fresh session.

## After a bug escapes
Ask "why didn't the workflow catch this?" Codify the lesson only where it pays: a regression test, an E2E journey, an eval case, a lint rule, a script, or one line in `AGENTS.md` (agents-md). Don't add process for completeness.
