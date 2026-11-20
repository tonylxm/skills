# Retro

Weekly or on demand: `node scripts/run.mjs retro [--days 14]`. The runner collects the verdict history from GitHub into a JSON file and finds anything that repeated 3 or more times. This file tells the retro agent what to do with it. Nothing here edits a skill directly: every change is a PR you review.

## Inputs

The data file lists, per recent job: builds, `checks.sh` failures, review rounds, finding categories, and why it escalated. `recurring` holds the patterns seen 3+ times.

## For each recurring pattern, decide where the fix belongs

| Pattern | Fix goes in |
|---|---|
| A finding category a script could catch | `checks.sh` (and the template in `pipeline/templates/checks.sh`), so reviews stop spending tokens on it |
| Generic code default agents keep writing | `dev-loop/references/code-standards.md` Refuse |
| Generic UI default | `frontend-design/references/ui-standards.md` Refuse |
| Schema or query mistake | `data-modeling` Refuse |
| Deprecated or outdated API | a row in `stack-defaults/deprecations.md` |
| The same repo-specific mistake | that repo's `AGENTS.md`, not a skill |
| A stage that loops or escalates for the same reason | the stage's skill or the flow (`pipeline`, `plan`, `review`) |
| A stack-wide setup gap | the template repo (say which, as a note: it is not in this repo) |

## Rules

- One line per rule, stated as the rule, with the PR numbers as evidence in the PR description.
- Also propose deletions: a rule or skill line that never fired in the data and that a capable model would follow anyway.
- Update the affected rows of `docs/skill-health.md` (weak points, last seen).
- At most 5 proposals per run, most frequent first. One PR per proposal, branch `chore/retro-<slug>`, never merged by the retro itself.
- If nothing repeated 3 times, say so and stop. Don't invent patterns.
