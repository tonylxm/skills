# Code standards

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
- **Security:** every route and action checks the session and the caller's right to that record. Queries are parameterized. No secret, token or personal data is logged, committed or sent to the client.

## Conventions

- **Single source of truth:** one place owns each fact (a constant, a type, a schema). Everything else derives from it.
- **Network calls:** every call has a timeout. Retries are bounded, back off, and apply only to idempotent operations.
- **External writes:** carry an idempotency key, so a retry or a double click cannot repeat the effect.
- **Config:** read from the environment once at startup and validated. Missing config fails the boot, not the first request.
- **Fail fast:** reject invalid state early with a typed, named error. Do not continue with a guessed default.
- **Side effects:** isolate them at the edges. Core logic takes values and returns values.
- **Authorization:** deny by default. Check ownership on the server for every read and write, never trust ids, roles or prices sent by the client.
- **Outbound requests:** a URL supplied by a user is allowlisted or resolved and checked before the server fetches it (SSRF).
- **Secrets:** live in the environment or a secret store. Rotate any that reach a log, a commit or a chat.
- **Concurrency:** state shared across requests is either avoided or guarded (transaction, lock, version check).
- **Data model:** table and constraint design follows [data-modeling](../../data-modeling/SKILL.md).

## Comments

Default is none. Keep or write one only when it guards something the code can't show. If a test, type or named constant can enforce it instead, use that.

| Keep | Must include | Example |
|---|---|---|
| Workaround or trade-off | The cause (bug link, version, measurement) | `// Safari drops the event under 50ms (WebKit#123). Do not lower.` |
| Coupling, order or sync | Both ends name each other | `// Must run before initializeAuth(), or session cookies fail to attach.` |
| Business or regulatory rule | The source (rule, client decision, ticket) | `// GST applies to the pre-discount price (IRD guidance).` |
| Lint or type suppression | A reason | `// eslint-disable-next-line rule -- reason`, `// @ts-expect-error reason` |

- **Never write:** narration, history ("added", "changed from"), banners, or commented-out code. File headers only for a non-obvious entry point the name can't say.
- **Don't delete a comment you don't understand.** Remove a guardrail only together with the code it guards.
- **Stale is a bug.** Change guarded code, update or delete its comment in the same diff.
- **Same warning in 3+ places** is a convention: put it in `AGENTS.md`.
- **Existing code:** prune only in files you are already changing. No repo-wide sweeps.

## Refuse

The defaults agent-written code clusters around. The brief or an existing codebase convention can earn one back; reaching for one without a reason means you were not deciding.

- `try/catch` that logs and continues, or returns an empty value on failure.
- Null checks and fallbacks for values the types already guarantee, or a default that hides a bug.
- A new helper beside an existing one that does the same thing.
- A wrapper, manager or service class with one caller and no variation (see the deletion test in [codebase-design](../../codebase-design/SKILL.md)).
- Options, parameters or interfaces "for future flexibility" nothing uses yet. SOLID is covered by depth, seams and injection; do not add abstraction to satisfy the acronym.
- Comments that narrate the code, changelog notes in source, banners (see Comments above).
- Casts, `any` or lint suppressions to make the compiler stop complaining, or any suppression without a reason.
- Mocks of your own code, or tests that assert how the code works instead of what it does.
- Reformatting, renaming or reordering lines the change did not need to touch.
- A passing test produced by special-casing the test's input.
- Building SQL, shell commands or HTML by string concatenation with user input.
- Client-side checks as the only guard on a permission or a price.
- Reaching for a new dependency before checking the standard library and what the repo already has.

## Growing this list

Add an item only after it recurs across projects, not after one bad diff. A generic default goes under Refuse. A check that would have caught it goes under Verify. A rule of practice goes under Conventions. One line each, stated as the rule. Edit in `~/.agents/skills`, never a project copy.
