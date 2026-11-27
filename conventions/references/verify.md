# Verify before "done"

Done means the acceptance criteria are met with fresh evidence. Evidence is the command, exit code and pass/fail/skip counts. "Tests pass" alone is a claim.

## Pitfalls
| Pitfall | Do instead |
|---|---|
| Editing or deleting a test to go green | Classify the failure first (Test integrity below) |
| Special-casing fixtures or assertions | Fix the general behavior |
| Retrying the same failing fix | After 2 tries switch to `diagnosing-bugs`; after 3, stop and ask |
| Repo-wide exploration, reading whole large files | Targeted `rg` of the area you touch |
| Scope creep, drive-by refactors | Note them as follow-ups |
| Mocking your own code | Mock only at system boundaries |
| Silent assumptions about requirements | State them; ask on consequential ones (contracts, security, data, money) |

## Cheapest check first
| Tier | When | Run |
|---|---|---|
| 1 | While editing | The single test or file |
| 2 | Change done | Whole-project lint and typecheck, plus tests for the changed area |
| 2b | Shared modules, schema, auth, dependencies, config, or the suite runs under ~2 min | Full suite |
| 3 | Before push, merge or deploy | Full suite, E2E journeys, production build. CI repeats it |

- Use reporters that print only failures plus counts.
- UI or full-stack change: also run `browser-e2e`.
- AI or agent behavior: [agent-evals.md](agent-evals.md).

## Test integrity
Never change an existing test just to make code pass. When one fails, decide: implementation wrong, test wrong, requirement changed, or environment wrong. Change the test only for the second or third, and say why in the commit body.

## Review
`/simplify`, then `/code-review` in a fresh context; add `/security-review` when auth, input handling, secrets, permissions or dependencies changed. Always review money, auth, user data, concurrency, external contracts and migrations, even for a one-character fix. Skip only for copy, styling, docs, or a refactor already covered by tests. Check each finding against the code: fix the real ones, dispute wrong ones with evidence, list what you left.

## After a bug escapes
Ask why the workflow missed it, and add the smallest durable guardrail: a regression test, E2E journey, lint rule, or one line in `conventions`. No process for completeness.
