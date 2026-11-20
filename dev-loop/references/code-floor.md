# Code floor

Read this before Implement and again before Review. A repo's `AGENTS.md`, ADRs or an explicit user instruction override anything here. Add to the lists only by the rule in the last section.

## Verify

Check the finished diff, not your intentions.

- **Reuse:** you searched for an existing helper, type or pattern before writing a new one.
- **Boundaries:** input is validated where it enters (request, file, env, third-party response) and trusted after that.
- **Errors:** each failure is handled where something can be done about it, or propagated with context. None is swallowed.
- **Dead code:** no unused exports, parameters, flags or commented-out blocks left behind.
- **Logs:** each carries the identifiers needed to trace it. None contains secrets or personal data.
- **Diff scope:** every changed line serves the goal. Unrelated cleanups are listed as follow-ups.
- **Library APIs:** calls match the installed version's docs, not memory.

## Conventions

- **Single source of truth:** one place owns each fact (a constant, a type, a schema). Everything else derives from it.
- **Network calls:** every call has a timeout. Retries are bounded, back off, and apply only to idempotent operations.
- **External writes:** carry an idempotency key, so a retry or a double click cannot repeat the effect.
- **Config:** read from the environment once at startup and validated. Missing config fails the boot, not the first request.
- **Fail fast:** reject invalid state early with a typed, named error. Do not continue with a guessed default.
- **Side effects:** isolate them at the edges. Core logic takes values and returns values.
- **Concurrency:** state shared across requests is either avoided or guarded (transaction, lock, version check).
- **Data model:** table and constraint design follows [data-modeling](../../data-modeling/SKILL.md).

## Refuse

The defaults agent-written code clusters around. The brief or an existing codebase convention can earn one back; reaching for one without a reason means you were not deciding.

- `try/catch` that logs and continues, or returns an empty value on failure.
- Null checks and fallbacks for values the types already guarantee, or a default that hides a bug.
- A new helper beside an existing one that does the same thing.
- A wrapper, manager or service class with one caller and no variation (see the deletion test in [codebase-design](../../codebase-design/SKILL.md)).
- Options, parameters or interfaces "for future flexibility" nothing uses yet. SOLID is covered by depth, seams and injection; do not add abstraction to satisfy the acronym.
- Comments that narrate the code, changelog notes in source, banners.
- Casts, `any` or lint suppressions to make the compiler stop complaining.
- Mocks of your own code, or tests that assert how the code works instead of what it does.
- Reformatting, renaming or reordering lines the change did not need to touch.
- A passing test produced by special-casing the test's input.
- Reaching for a new dependency before checking the standard library and what the repo already has.

## Growing this list

Add an item only after it recurs across projects, not after one bad diff. A generic default goes under Refuse. A check that would have caught it goes under Verify. A rule of practice goes under Conventions. One line each, stated as the rule. Edit in `~/.agents/skills`, never a project copy.
