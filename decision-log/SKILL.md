---
name: decision-log
description: Use this skill when making or documenting significant architecture, product, security, or financial decisions in the codebase.
---

# Decision Log Instructions

When this skill is activated, follow these instructions:

1. Create ADRs only when a decision is all three: **hard to reverse**, **surprising without context**, and **the result of a real trade-off**. Typical cases: architectural shape, tech with lock-in (database, auth, hosting), boundary/scope decisions, deliberate deviations from the obvious path, constraints not visible in code (compliance, partner SLAs).
2. Check `docs/decisions/` before creating an ADR to avoid duplicates.
3. Use sequential filenames such as `0001-short-name.md`.
4. Keep ADRs concise and factual. Never invent rationale or alternatives. Options and trade-offs that the user discussed or explicitly accepted (e.g. accepting a recommendation) count as real, so record them as discussed.
5. Use this structure:

```md
# ADR-0001: Decision Title

**Status:** Proposed | Accepted | Superseded | Rejected
**Date:** YYYY-MM-DD

## Context

What problem or constraint led to the decision?

## Decision

What was chosen?

## Alternatives

(Optional) Only rejected options worth remembering.

## Consequences

(Optional) Only non-obvious downstream effects.
```

Context and Decision can be one sentence each. Omit optional sections rather than padding them.

6. When an accepted decision changes materially, mark the old ADR as `Superseded` and create a new ADR.
7. ADRs record *why*; current-state docs (`MVP_PRD.md`, `DESIGN.md`, `AGENTS.md`) record *what*. Update those separately and link to the ADR rather than restating it.
8. Use the project's vocabulary from `GLOSSARY.md` if it exists.

## Examples

User: "We chose double-entry lite for the ledger."

Assistant: Create `docs/decisions/0001-double-entry-ledger.md` documenting the decision, alternatives, and consequences.