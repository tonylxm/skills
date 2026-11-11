---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# Systematic Debugging

**Core principle:** always find the root cause before attempting a fix. Symptom fixes are failure.

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

Use it for any technical issue: test failures, production bugs, unexpected behaviour, performance problems, build or integration failures. Use it **especially** under time pressure, when a quick fix seems obvious, or when earlier fixes didn't work. Simple bugs have root causes too. Complete each phase before the next.

## Phase 1: Root cause investigation

1. **Read the error completely.** Full stack trace, line numbers, file paths, error codes. Warnings too.
2. **Reproduce consistently.** Exact steps, every time. If it isn't reproducible, gather more data; don't guess.
3. **Check recent changes.** `git diff`, recent commits, new dependencies, config and environment differences.
4. **Gather evidence at component boundaries** in multi-component systems (CI → build → signing, API → service → database). Log what enters and leaves each component and check config propagation, run once to see *where* it breaks, then investigate that component. Worked example: [multi-component-evidence.md](multi-component-evidence.md).
5. **Trace the data flow** when the error is deep in the call stack: where does the bad value originate, and what called this with it? Keep tracing up and fix at the source. Full technique: [root-cause-tracing.md](root-cause-tracing.md).

## Phase 2: Pattern analysis

1. **Find working examples** of similar code in the same codebase.
2. **Read the reference completely** if you're implementing a pattern. Don't skim.
3. **List every difference** between working and broken, however small. Don't assume "that can't matter".
4. **Understand dependencies:** what components, settings, config and assumptions it needs.

## Phase 3: Hypothesis and testing

1. **One hypothesis, written down:** "I think X is the root cause because Y."
2. **Test minimally:** the smallest change that tests it, one variable at a time.
3. **Verify:** confirmed → Phase 4. Not confirmed → a new hypothesis, not more fixes stacked on top.
4. **When you don't know,** say "I don't understand X", research, or ask. Don't pretend.

## Phase 4: Implementation

1. **Create a failing test** that reproduces the bug: an automated test if possible (the tdd skill), a one-off script otherwise. Have it before fixing.
2. **Implement a single fix** at the root cause. No "while I'm here" changes, no bundled refactoring.
3. **Verify the fix:** the new test passes, no other test broke (dev-loop's verification tiers), and the affected app path works. Show the evidence. Never edit an existing test to make the fix pass (dev-loop's test-integrity rule).
4. **If the fix doesn't work:** stop and count. Under 3 attempts, return to Phase 1 with the new information. **At 3, stop fixing.**
5. **After 3 failed fixes, question the architecture.** Signs: each fix reveals new shared state or coupling elsewhere, needs a "massive refactor", or creates new symptoms. Ask whether the pattern is sound or kept through inertia, and **discuss with the user before attempting more fixes**.
6. **Ask why the workflow didn't catch it.** Once fixed, decide whether a durable guardrail is worth adding (regression test, E2E journey, lint rule, one `AGENTS.md` line), per dev-loop's "After a bug escapes".

## When there is no root cause

If investigation shows the issue is truly environmental, timing-dependent or external: document what you investigated, add appropriate handling (retry, timeout, clear error) and logging for next time. But 95% of "no root cause" cases are incomplete investigation.

## Red flags

Any urge to fix before tracing ("quick fix for now", "just try X", "one more attempt" after 2+ failures, several changes at once) means stop and return to Phase 1. The full list, user signals and rationalisations are in [red-flags.md](red-flags.md).

## Supporting techniques

- [root-cause-tracing.md](root-cause-tracing.md): trace a bug backward through the call stack to its trigger.
- [defense-in-depth.md](defense-in-depth.md): add validation at several layers once the root cause is known.
- [condition-based-waiting.md](condition-based-waiting.md): replace arbitrary timeouts with condition polling.
- `find-polluter.sh`: bisect which test pollutes shared state (see root-cause-tracing.md).
