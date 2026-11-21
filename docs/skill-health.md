# Skill health

_One row per skill: what has been proven in use, and what to re-check after changing it. Updated by dry runs and retro. `proven` = used before the pipeline. `new` = built and covered by stub tests only. Last dry run links the PR._

| Skill | Status | Last dry run | Weak points / re-run after changing |
|---|---|---|---|
| pipeline (runner, kit) | run on 5 issues, 4 PRs | [sandbox PR 8](https://github.com/tonylxm/pipeline-sandbox/pull/8), [PR 9](https://github.com/tonylxm/pipeline-sandbox/pull/9), [PR 10](https://github.com/tonylxm/pipeline-sandbox/pull/10) (2026-11-21) | Real GitHub, 3 jobs in parallel. Working: all stages, parallel slots, security review (PR 10 APPROVE), rebase then CI re-check (PR 9 final saw CI green on the rebased head), scope-creep caught (PR 8: builder added global `retries: 1`, review-code flagged it, builder removed it), final held a `ci.yml` change and a UI PR with no screenshots. Fixed from this run: verdict example in SKILL.md used the literal marker `pipeline:stage` so builders posted unparseable verdicts (now `pipeline:<stage>`), and the runner restarted a finished issue several times because `gh issue list --label` lags behind label edits (now never restarts an issue within a run). Still open: headless auth needs a valid `claude` login (`setup-token` untested), a run started straight after relabelling can see an empty queue, dev-server e2e was flaky on a cold start, summary lists duplicate needs-human lines (likely same cause as the restart bug, re-check), `auto` permission mode only observed over short runs, issue forms untested, read-only stages have no allow-list |
| plan | run by hand, 2 issues | [sandbox PR 4](https://github.com/tonylxm/pipeline-sandbox/pull/4) | Ran by following the SKILL.md (it is user-only, so Claude cannot invoke it). #1 READY and #2 NEEDS-INFO as expected. The contract says NEEDS-INFO sets `needs-human`, the skill says to ask in session when the user is the author: pick one. Not tested via real `/plan` or the question batch |
| review | run on 4 PRs | [sandbox PR 4](https://github.com/tonylxm/pipeline-sandbox/pull/4) | review-code found real issues in round 1 and approved after the fix. review-ui approved after a browser check. Security review not triggered. Categories not yet checked across PRs |
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
