# skills

My personal agent skills for Claude Code, Codex, and other agents that support the [skills](https://skills.sh) format.

## Install

```bash
npx skills add tonylxm/skills
```

To install a single skill:

```bash
npx skills add tonylxm/skills --skill project-starter
```

Some skills call others (for example, project-starter uses grilling, domain-modeling, design-md and agents-md), so install the whole set unless you know a skill's dependencies.

## Workflow

Work flows through GitHub issues. You plan once, then the run is hands-off: up to 3 jobs at a time, each in its own worktree and branch, each ending in one PR that closes its issue.

| Stage | Where | You |
| --- | --- | --- |
| Kickoff (new project) | `/project-starter "idea"` in Claude: docs, repo from your template, first issues | Answer questions, set up the listed accounts |
| Plan | `/plan` in Claude: triages every open issue, asks everything in one batch | Answer, confirm |
| Run | `node ~/.agents/skills/pipeline/scripts/run.mjs --until 07:00` in a terminal | Nothing. `run.mjs status` or the GitHub app shows progress |
| Needs you | Issues labelled `needs-human` | Answer them in the next `/plan` |
| Retro | `run.mjs retro`, weekly | Review the PRs it opens |

A job is build ([dev-loop](dev-loop/SKILL.md)) → `checks.sh` → [review](review/SKILL.md) (code, ui, security, routed by the diff) → final review → merge. Labels, verdict comments, caps and the per-repo kit: [pipeline](pipeline/SKILL.md).

- **Work outside the pipeline** (a quick fix, a one-off): just ask for the change. dev-loop runs the same Goal → Explore → Plan → Implement → Verify → Review → Commit loop.
- **Interrupted** (laptop closed, usage limit)? Run `run.mjs` again: each job's stage is read back from its PR.
- **Overnight:** `--until` stops starting new jobs at that time. The laptop must stay plugged in with the lid open (the runner holds `caffeinate`).

Generated docs stay lean. Root `AGENTS.md` is an index, every fact lives in one file, and docs grow by splitting into linked files instead of getting longer.

## Adding a skill from skills.sh

Don't use `npx skills add` for this repo. Ask your agent to "add `<owner/repo>` `<skill>` to my skills". The find-skills skill then vendors it: copies the files, resolves its dependencies, runs refine-skill, and credits the source.

## Skills

| Skill | Description | Origin |
| --- | --- | --- |
| **Kickoff and planning** | | |
| [project-starter](project-starter/SKILL.md) | Kick off a project: README, AGENTS.md and `docs/` (PRD, architecture, design, decisions), then the repo from your template and the first issues | Original |
| [stack-defaults](stack-defaults/SKILL.md) | Personal stack layer: base stacks, template repos, quality baseline, CI/CD, running costs, client accounts and contracts | Original |
| [market-research](market-research/SKILL.md) | Sourced market and competitor snapshot | Original, based on firecrawl-market-research and coreyhaines31 competitor-profiling |
| [grilling](grilling/SKILL.md) | Round-based interview with recommended answers | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [domain-modeling](domain-modeling/SKILL.md) | Build `docs/GLOSSARY.md` and sharpen domain terms | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [decision-log](decision-log/SKILL.md) | Record significant decisions as ADRs in `docs/decisions/` | Original |
| [design-md](design-md/SKILL.md) | Define the visual design system in `docs/DESIGN.md` | Original, based on google-labs-code stitch design-md |
| [agents-md](agents-md/SKILL.md) | Write and maintain a lean `AGENTS.md` (Claude Code reads it natively) | Original, based on the agents.md standard and github/awesome-copilot create-agentsmd |
| **Building** | | |
| [plan](plan/SKILL.md) | Triage GitHub issues into `ready`, split, needs-info or rejected: one batch of questions, issues rewritten to a concise format | Original |
| [review](review/SKILL.md) | Code, UI, security and final review of a PR, posting one verdict comment | Original |
| [pipeline](pipeline/SKILL.md) | Issue-to-merged-PR pipeline contracts: labels, issue body, verdict comments, caps, git and merge conventions, and the per-repo kit (issue forms, PR template, `checks.sh`) | Original |
| [dev-loop](dev-loop/SKILL.md) | The loop for every code change: core rules, agentic pitfalls, test strategy, tiered verification, test integrity, review | Original |
| [data-modeling](data-modeling/SKILL.md) | Relational schema rules: keys, constraints, types, indexes, transactions, idempotency, query pitfalls | Original |
| [tdd](tdd/SKILL.md) | Test-driven development, red-green-refactor, for logic, invariants and regressions | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [codebase-design](codebase-design/SKILL.md) | Deep-module vocabulary, used by tdd | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [systematic-debugging](systematic-debugging/SKILL.md) | Debugging that finds the root cause first | Adapted from [obra/superpowers](https://github.com/obra/superpowers) |
| [frontend-design](frontend-design/SKILL.md) | UI design that follows `DESIGN.md`: product vs marketing mode, rules against the generic AI look, and code-level interface guidelines | Adapted from [anthropics/skills](https://github.com/anthropics/skills) (Apache-2.0), with rules from [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (Apache-2.0), [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) and [emilkowalski/skills](https://github.com/emilkowalski/skills) (MIT, motion) |
| [browser-e2e](browser-e2e/SKILL.md) | Check a UI or full-stack change in the running app (widths, themes, console, keyboard, accessibility, flows), and decide what becomes a Playwright journey | Original |
| [seo](seo/SKILL.md) | Technical SEO for client and small business sites (Next.js, Astro): build-in baseline, 10-minute pre-launch check (PageSpeed Insights, Rich Results Test), Search Console and Business Profile handover, AI search (GEO) basics | Original |
| [typescript-standards](typescript-standards/SKILL.md) | TypeScript code standards: strict types, early returns, injected dependencies | Original |
| [cli-tooling](cli-tooling/SKILL.md) | Fast, non-interactive shell tools: ast-grep, rg, fd, jq, yq, gh | Original |
| **Meta** | | |
| [refine-skill](refine-skill/SKILL.md) | Audit and improve an agent skill | Original, based on anthropics skill-creator and obra/superpowers writing-skills |
| [refine-prompt](refine-prompt/SKILL.md) | Sharpen a rough prompt for an AI model | Original, based on Anthropic prompt guidance and stitch enhance-prompt |
| [find-skills](find-skills/SKILL.md) | Discover agent skills and vendor them into this repo | Adapted from [vercel-labs/skills](https://github.com/vercel-labs/skills) |

## Skill dependencies

Install the whole set. The pipeline skills call these by name:

| Skill | Calls or reads |
| --- | --- |
| plan | pipeline, grilling, market-research, domain-modeling, decision-log, tdd |
| dev-loop (the build stage) | pipeline, review, tdd, typescript-standards, frontend-design, browser-e2e, data-modeling, systematic-debugging |
| review | pipeline, dev-loop, browser-e2e, frontend-design |
| project-starter | grilling, market-research, domain-modeling, design-md, agents-md, decision-log, stack-defaults, pipeline |

The runner needs `git`, `gh`, `node` and `claude`: `node pipeline/scripts/run.mjs check` verifies them.

The adapted skills are personalised, so they can differ from upstream. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for their licenses.

Built-ins are used rather than duplicated: `/code-review`, `/security-review`, `/simplify` and skill-creator.

## License

Original skills are released under the [MIT License](LICENSE).
