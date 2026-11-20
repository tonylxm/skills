# Skill health

_One row per skill: what has been proven in use, and what to re-check after changing it. Updated by dry runs and retro. `proven` = used before the pipeline. `new` = built and covered by stub tests only. Last dry run links the PR._

| Skill | Status | Last dry run | Weak points / re-run after changing |
|---|---|---|---|
| pipeline (runner, kit) | new | none | 16 stub tests pass. Not yet run against real GitHub. Headless `claude -p` accepted the flags but failed auth when tried from a build session. Issue forms and `labels.sh` untested on GitHub. After a rebase, CI polling may read stale checks. Permission mode default `auto` is unverified for unattended runs. Hardened: prompts denied, no MCP servers, no git or gh prompts, runner-held hold paths. Still open: spend caps are off by default, and read-only stages have no allow-list yet |
| plan | new | none | Never run. Check that issues come out concise and that one batch of questions is enough |
| review | new | none | Never run. `ui` mode needs a preview URL or a runnable app. Check findings carry stable `category` slugs |
| dev-loop | proven, changed | none | Pipeline mode (push, open PR, verdict comment) is new. Core loop unchanged |
| project-starter | proven, changed | none | Repo creation and issue filing are new. Doc steps unchanged |
| agents-md | proven, changed | none | Template Workflow line now points at issues and the pipeline |
| stack-defaults | proven, moved | none | Content unchanged. `deprecations.md` has two seed rows |
| frontend-design, browser-e2e | proven, changed | none | Renamed `ui-standards.md`, added a Responsive section. Re-check at 360px |
| tdd, systematic-debugging, codebase-design, data-modeling | proven | none | Link fixes only |
| grilling, domain-modeling, decision-log, design-md, market-research | proven | none | No change |
| typescript-standards, seo, cli-tooling | proven | none | No change |
| find-skills, refine-prompt, refine-skill | proven | none | No change |

## Sandbox regression set

After changing `plan`, `dev-loop`, `review` or `pipeline`, replay the sandbox ([pipeline/sandbox](../pipeline/sandbox/README.md)) and compare verdicts with the last run. Record the result in the row above.
