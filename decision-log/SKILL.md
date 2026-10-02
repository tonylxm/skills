---
name: decision-log
description: Use this skill when making or documenting significant architecture, product, security, or financial decisions in the codebase.
---

# Decision Log Instructions

When this skill is activated, follow these instructions:

1. Create ADRs only for significant, difficult-to-reverse, architectural, product, security, or financial decisions.
2. Check `docs/decisions/` before creating an ADR to avoid duplicates.
3. Use sequential filenames such as `0001-short-name.md`.
4. Keep ADRs concise and factual. Never invent rationale or alternatives.
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

What meaningful alternatives were considered?

## Consequences

What are the main benefits and trade-offs?
```

6. When an accepted decision changes materially, mark the old ADR as `Superseded` and create a new ADR.
7. Update `ARCHITECTURE.md`, `DESIGN.md`, or `PRODUCT.md` separately when the current documentation changes.

## Examples

User: "We chose double-entry lite for the ledger."

Assistant: Create `docs/decisions/0001-double-entry-ledger.md` documenting the decision, alternatives, and consequences.