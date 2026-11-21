# Skill health

_One row per skill: what has been proven in use, and what to re-check after changing it. Updated by dry runs and retro. `proven` = used before the pipeline. `new` = built and covered by stub tests only. Last dry run links the PR._

| Skill | Status | Last dry run | Weak points / re-run after changing |
|---|---|---|---|
| pipeline (runner, kit) | run once, 1 issue | [sandbox PR 4](https://github.com/tonylxm/pipeline-sandbox/pull/4) (2026-11-21) | Real GitHub run: build, checks, review-code (CHANGES then APPROVE), review-ui, final all worked, final ESCALATEd on a `ci.yml` edit under `safe` and a human merged. Headless auth works after `/login`, but an expired CLI session fails every call (consider `claude setup-token`, untested). Open: one run exited at once without starting a ready issue (cause unknown, rerun worked). The summary lists one escalation twice. A manual merge leaves `needs-human` on the closed issue. Not yet tested: CI polling after a rebase, `auto` permission mode over a long run, issues 2 to 5 of the sandbox. Issue forms untested. Sandbox `checks.sh` skips e2e. Read-only stages still have no allow-list |
| plan | run by hand, 2 issues | [sandbox PR 4](https://github.com/tonylxm/pipeline-sandbox/pull/4) | Ran by following the SKILL.md (it is user-only, so Claude cannot invoke it). #1 READY and #2 NEEDS-INFO as expected. The contract says NEEDS-INFO sets `needs-human`, the skill says to ask in session when the user is the author: pick one. Not tested via real `/plan` or the question batch |
| review | run on 1 PR | [sandbox PR 4](https://github.com/tonylxm/pipeline-sandbox/pull/4) | review-code found real issues in round 1 and approved after the fix. review-ui approved after a browser check. Security review not triggered. Categories not yet checked across PRs |
| dev-loop | proven, changed | [sandbox PR 4](https://github.com/tonylxm/pipeline-sandbox/pull/4) | Pipeline mode (push, open PR, verdict comment) is new. Smallest-change rules from Ponytail added to Plan, Implement and code-standards: check builds stay small without skipping callers or tests. Sandbox run: pipeline mode worked (PR opened, verdict comments posted, one review round fixed). The builder also edited `ci.yml` beyond the issue to fix a failing gitleaks job: justified, but it is scope the final review had to catch |
| project-starter | proven, changed | none | Repo creation and issue filing are new. Doc steps unchanged |
| agents-md | proven, changed | none | Template Workflow line now points at issues and the pipeline |
| stack-defaults | proven, moved | none | Content unchanged. `deprecations.md` has two seed rows |
| frontend-design, browser-e2e | proven, changed | none | Renamed `ui-standards.md`, added a Responsive section. Re-check at 360px. Merged the UI tip lists: motion.md gained entrance, shake, stepper and tooltip rules; ui-standards.md gained radius, alpha border, OKLCH, dvh, mask, chip and IME rules |
| tdd, systematic-debugging, codebase-design, data-modeling | proven | none | Link fixes only |
| grilling, domain-modeling, decision-log, design-md, market-research | proven | none | No change |
| typescript-standards, seo, cli-tooling | proven | none | No change |
| find-skills, refine-prompt, refine-skill | proven | none | No change |

## Sandbox regression set

After changing `plan`, `dev-loop`, `review` or `pipeline`, replay the sandbox ([pipeline/sandbox](../pipeline/sandbox/README.md)) and compare verdicts with the last run. Record the result in the row above.
