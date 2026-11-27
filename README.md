# skills

My personal agent skills for Claude Code, Codex, and other agents that support the [skills](https://skills.sh) format. v2 is a lean rebuild: built-in commands do the orchestration, skills only add what they lack. The v1 set (issue-to-PR pipeline included) is the `v1` tag.

## Install

```bash
npx skills add tonylxm/skills
```

Single skill: `npx skills add tonylxm/skills --skill conventions`. Some skills call others (project-starter uses grilling, to-spec, to-tickets, domain-modeling, agents-md and stack-defaults), so install the whole set unless you know a skill's dependencies.

## Workflow

One chat per step, and each step ends with `Next: <step>`. Parallel work is one background session per ticket. Chains, scenarios and model routing: [docs/workflow.md](docs/workflow.md).

| Job | Use |
| --- | --- |
| Scope | `grill-me` → `to-spec` → `to-tickets` |
| Build | `implement` per ticket (`tdd` where it pays) → `/simplify` → `/code-review` → `/ship` |
| Bugs | `diagnosing-bugs` → `/code-review` → `/ship` |
| UI | Impeccable, `prototype`, `animation-vocabulary`, `browser-e2e` |
| Roadmap | `docs/ROADMAP.md` per project (Now / Next / Later / Done) |
| Improve | `retro` proposes edits to `conventions`, then commit them |
| Trials | [docs/trials.md](docs/trials.md) |

Generated docs stay lean. Root `AGENTS.md` is an index, every fact lives in one file, and docs grow by splitting into linked files.

## Adding a skill from skills.sh

Don't use `npx skills add` for this repo. Ask your agent to "add `<owner/repo>` `<skill>` to my skills". The find-skills skill then vendors it: copies the files, resolves its dependencies, runs refine-skill, and credits the source.

## Skills

| Skill | Description | Origin |
| --- | --- | --- |
| **Conventions** | | |
| [conventions](conventions/SKILL.md) | Git, PR, code and UI rules, antipatterns, done checks, next-step line. The one list to keep adding to | Original, with rules adapted from [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (Apache-2.0) and [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) (MIT) |
| **Scope and plan** | | |
| [grill-me](grill-me/SKILL.md) | Start a relentless interview (calls `grilling`) | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [grilling](grilling/SKILL.md) | Round-based interview with recommended answers | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [to-spec](to-spec/SKILL.md) | Turn the conversation into a spec issue | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [to-tickets](to-tickets/SKILL.md) | Split a spec into vertical-slice issues with blocking edges | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [project-starter](project-starter/SKILL.md) | Kick off a project: README, AGENTS.md and `docs/`, then the repo and first issues | Original |
| [stack-defaults](stack-defaults/SKILL.md) | Base stacks, template repos, quality baseline, CI/CD, running costs, client accounts and contracts | Original |
| [market-research](market-research/SKILL.md) | Sourced market and competitor snapshot | Original, based on firecrawl-market-research and coreyhaines31 competitor-profiling |
| [domain-modeling](domain-modeling/SKILL.md) | Build `docs/GLOSSARY.md` and sharpen domain terms | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [decision-log](decision-log/SKILL.md) | Record significant decisions as ADRs in `docs/decisions/` | Original |
| [agents-md](agents-md/SKILL.md) | Write and maintain a lean `AGENTS.md` | Original, based on the agents.md standard and github/awesome-copilot create-agentsmd |
| **Build** | | |
| [implement](implement/SKILL.md) | Build a spec or ticket: tdd, then `/simplify` and `/code-review` | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [tdd](tdd/SKILL.md) | Red-green-refactor for logic, invariants and regressions | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [diagnosing-bugs](diagnosing-bugs/SKILL.md) | Build a feedback loop first, then hypothesize, fix and clean up | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [codebase-design](codebase-design/SKILL.md) | Deep-module vocabulary, used by tdd | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [data-modeling](data-modeling/SKILL.md) | Relational schema rules: keys, constraints, indexes, transactions, idempotency | Original |
| [typescript-standards](typescript-standards/SKILL.md) | Strict types, early returns, injected dependencies | Original |
| [cli-tooling](cli-tooling/SKILL.md) | Fast, non-interactive shell tools: ast-grep, rg, fd, jq, yq, gh | Original |
| **UI** | | |
| [prototype](prototype/SKILL.md) | Several different versions of one UI piece behind a live picker | Adapted from [emilkowalski/skills](https://github.com/emilkowalski/skills) (MIT) |
| [animation-vocabulary](animation-vocabulary/SKILL.md) | Name a motion effect from a loose description | Adapted from [emilkowalski/skills](https://github.com/emilkowalski/skills) (MIT) |
| [browser-e2e](browser-e2e/SKILL.md) | Check a UI or full-stack change in the running app, and decide what becomes a Playwright journey | Original |
| [seo](seo/SKILL.md) | Technical SEO for client sites, Search Console handover, AI search (GEO) basics | Original |
| **Meta** | | |
| [retro](retro/SKILL.md) | Retrospective that proposes edits to the agent's environment | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [refine-skill](refine-skill/SKILL.md) | Audit and improve an agent skill | Original, based on anthropics skill-creator and obra/superpowers writing-skills |
| [refine-prompt](refine-prompt/SKILL.md) | Sharpen a rough prompt for an AI model | Original, based on Anthropic prompt guidance and stitch enhance-prompt |
| [find-skills](find-skills/SKILL.md) | Discover agent skills and vendor them into this repo | Adapted from [vercel-labs/skills](https://github.com/vercel-labs/skills) |

[Impeccable](https://github.com/pbakaus/impeccable) is the design skill. It ships a binary, so it is installed per its README rather than vendored here.

Built-ins are used rather than duplicated: `/ship`, `/code-review`, `/security-review`, `/simplify`, `/batch`, `/advisor`, `/loop`, `/schedule`.

The adapted skills are personalised, so they can differ from upstream. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for their licenses.

## License

Original skills are released under the [MIT License](LICENSE).
