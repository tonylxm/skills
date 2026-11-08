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

Use auto mode for everything. You work in phases; tasks are the agent's steps inside a phase. After kickoff you only ever type `/roadmap-next`: it picks the step for the current phase, and whenever a choice is needed it asks a clickable question with the recommended option first.

| Chat | What happens | You | Skills it calls |
| --- | --- | --- | --- |
| Kickoff | `/project-starter "idea"` writes README, AGENTS.md and `docs/` (PRD, architecture, design, roadmap with Phase 0 planned, decisions) and lists what only you can provide | Answer questions, set up the listed accounts and keys | refine-idea, market-research, grilling, domain-modeling, decision-log, design-md, agents-md |
| Each phase, new chat | `/roadmap-next` → **plan**: asks every question up front, then confirms the task list. Phase 0 skips this | Answer, click confirm | |
| | → **build**: every task in order, each in its own subagent, verified and committed locally. Never stops to ask; stuck tasks are marked `BLOCKED` | Nothing | tdd, typescript-standards or dotnet-standards, systematic-debugging, frontend-design, frontend-verify, decision-log |
| | → **close** (automatic): review, re-verify, update docs, archive the phase, push, report | Try the app, read the assumptions | `/code-review`, `/security-review` (when relevant), `/simplify`, frontend-verify, agents-md |
| | Report ends with "Start a new chat and run `/roadmap-next`" | New chat | |

- **Interrupted** (usage limit, laptop closed)? New chat, `/roadmap-next` resumes where it stopped.
- **Lost?** `/roadmap-next status` shows where you are and offers the next step.
- **Overnight:** plan the phase, then hand it to `/gnhf`, and run `/roadmap-next close` after the morning review.
- `plan` only edits `docs/ROADMAP.md`, never code, so auto mode is safe there too.

Generated docs stay lean. Root `AGENTS.md` is an index, every fact lives in one file, and docs grow by splitting into linked files instead of getting longer.

## Adding a skill from skills.sh

Don't use `npx skills add` for this repo. Ask your agent to "add `<owner/repo>` `<skill>` to my skills". The find-skills skill then vendors it: copies the files, resolves its dependencies, runs refine-skill, and credits the source.

## Skills

| Skill | Description | Origin |
| --- | --- | --- |
| **Kickoff and planning** | | |
| [project-starter](project-starter/SKILL.md) | Kick off a project: produces README, AGENTS.md and `docs/` (PRD, architecture, design, roadmap, decisions), starting from your stack defaults in `tech-stack.md` | Original |
| [refine-idea](refine-idea/SKILL.md) | Turn a raw idea into an actionable one-pager | Adapted from [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) |
| [market-research](market-research/SKILL.md) | Sourced market and competitor snapshot | Original, based on firecrawl-market-research and coreyhaines31 competitor-profiling |
| [grilling](grilling/SKILL.md) | Round-based interview with recommended answers | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [grill-with-docs](grill-with-docs/SKILL.md) | Grilling that also writes the glossary and ADRs | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [domain-modeling](domain-modeling/SKILL.md) | Build `docs/GLOSSARY.md` and sharpen domain terms | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [decision-log](decision-log/SKILL.md) | Record significant decisions as ADRs in `docs/decisions/` | Original |
| [design-md](design-md/SKILL.md) | Define the visual design system in `docs/DESIGN.md` | Original, based on google-labs-code stitch design-md |
| [agents-md](agents-md/SKILL.md) | Write and maintain a lean `AGENTS.md` (Claude Code reads it natively) | Original, based on the agents.md standard and github/awesome-copilot create-agentsmd |
| **Building** | | |
| [roadmap-next](roadmap-next/SKILL.md) | Plan a phase up front, then build and close it unattended | Original, based on obra/superpowers writing-plans, executing-plans and verification-before-completion |
| [tdd](tdd/SKILL.md) | Test-driven development, red-green-refactor | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [codebase-design](codebase-design/SKILL.md) | Deep-module vocabulary, used by tdd | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [systematic-debugging](systematic-debugging/SKILL.md) | Debugging that finds the root cause first | Adapted from [obra/superpowers](https://github.com/obra/superpowers) |
| [frontend-design](frontend-design/SKILL.md) | UI design that follows `DESIGN.md`: product vs marketing mode, rules against the generic AI look, and code-level interface guidelines | Adapted from [anthropics/skills](https://github.com/anthropics/skills) (Apache-2.0), with rules from [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (Apache-2.0), [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) and [emilkowalski/skills](https://github.com/emilkowalski/skills) (MIT, motion) |
| [frontend-verify](frontend-verify/SKILL.md) | Check a UI change in a real browser: widths, themes, console, keyboard, accessibility | Original |
| [seo](seo/SKILL.md) | Technical SEO for client and small business sites (Next.js, Astro): build-in baseline, 10-minute pre-launch check (PageSpeed Insights, Rich Results Test), Search Console and Business Profile handover | Original |
| [client-preview](client-preview/SKILL.md) | Get a prototype in front of a client: passcode gate, readable preview link, pre-send checklist (access, security, assets, confidentiality, permissions) and email template | Original |
| [gnhf](gnhf/SKILL.md) | Capped overnight agent loop (5M tokens / 20 iterations / soft 8h deadline by default) that works through the roadmap | Adapted from [kunchenguid/gnhf](https://github.com/kunchenguid/gnhf) |
| [typescript-standards](typescript-standards/SKILL.md) | TypeScript code standards: strict types, early returns, injected dependencies | Original |
| [dotnet-standards](dotnet-standards/SKILL.md) | C# and ASP.NET Core standards: nullable types, async all the way, minimal API endpoints, EF Core | Original |
| [cli-tooling](cli-tooling/SKILL.md) | Fast, non-interactive shell tools: ast-grep, rg, fd, jq, yq, gh | Original |
| [handoff](handoff/SKILL.md) | Compact a session into a handoff document for a fresh context | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| **Meta** | | |
| [refine-skill](refine-skill/SKILL.md) | Audit and improve an agent skill | Original, based on anthropics skill-creator and obra/superpowers writing-skills |
| [refine-prompt](refine-prompt/SKILL.md) | Sharpen a rough prompt for an AI model | Original, based on Anthropic prompt guidance and stitch enhance-prompt |
| [find-skills](find-skills/SKILL.md) | Discover agent skills and vendor them into this repo | Adapted from [vercel-labs/skills](https://github.com/vercel-labs/skills) |

The adapted skills are personalised, so they can differ from upstream. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for their licenses.

Built-ins are used rather than duplicated: `/code-review`, `/security-review`, `/simplify` and skill-creator.

## License

Original skills are released under the [MIT License](LICENSE).
