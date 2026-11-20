# Choice rules

Sort every choice the issue, docs and ADRs don't settle. `plan` asks the consequential ones. The builder never asks: a minor choice is made and noted, a consequential one stops the job.

| Kind | What it is | Who decides |
|---|---|---|
| **Minor** | Internal, reversible, no effect outside the code being written: naming, helper shape, test structure, error wording, tables only this project uses | Take the option most consistent with the docs and existing code, or established practice where neither has a precedent. List it in the PR under "Decisions" |
| **Consequential** | Changes an external contract (API responses, payload or queue shapes, result sets); changes security or authorization behaviour; defines data semantics (what a sync applies or rejects, keys, backfill, soft vs hard delete); defines a schema other systems or existing rows depend on; invents business data (seed values, thresholds, role or status spellings, prices); or contradicts the PRD or an ADR | The user, in `plan`. In a build, don't implement a guess: comment the question with options (recommended first), set `needs-human`, and stop that job |
| **Fail closed** | A security check on an unknown, missing or null identity | A rule, not a choice: no access |
