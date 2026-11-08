---
name: project-starter
description: Use when starting a new project from an idea or short description and it needs a plan before code. Writes README.md, AGENTS.md and docs/ (PRD, architecture, design, roadmap, decisions).
argument-hint: "\"<quick description>\""
disable-model-invocation: true
---

# Project Starter

Turn a quick description into a planned, agent-ready repo. Orchestrate; delegate to the named skills instead of redoing their work.

## Rules

- **Ask with grilling:** rounds of questions, each with a recommended answer. Bigger choices get 2–3 options with one-line trade-offs. Delegated skills ask their own questions.
- **Find facts yourself** (repo, web, sub-agents). Only decisions go to the user.
- **Resumable:** if a file in the Output table already exists, summarise it and ask "keep, update or redo?" before its step.
- **Progress:** open each step with `[n/6] Name`, close it with `Done: <decision>. Next: <step>`.
- **ADRs:** a decision that passes decision-log's test goes to `docs/decisions/` via decision-log.

## Steps

1. **Idea.** One line: problem, user, outcome. Vague? Run refine-idea first. Offer market-research (`quick`) if the market is unclear.
2. **Constraints.** Solo or team (sets the Workflow mode, [tech-stack.md → CI/CD](tech-stack.md#cicd)), timeline, hosting budget, compliance (privacy law wherever personal data is stored).
3. **Stack.** Start from the defaults in [tech-stack.md](tech-stack.md). Deviate only when step 2 requires it, and say why. ADR for each lock-in choice.
4. **Architecture.** Components (mermaid), core data model, key contracts, quality baseline (tests, security, deploy, NFRs) from tech-stack.md. If the domain has terms that are easy to confuse, run domain-modeling, which writes `docs/GLOSSARY.md`. ADR for the shape.
5. **Design.** Run design-md. Skip for backend-only, CLI or library projects.
6. **Write and hand off.**
   - Fill the doc templates into the layout below, then run agents-md for `AGENTS.md`.
   - Phase 0 in `docs/ROADMAP.md` is always the walking skeleton, created from the template or scaffold that tech-stack.md names for the chosen stack. Later phases stay one line each.
   - For client work, draft the client's list from [clients.md](clients.md) (only the rows this project needs) and fill [contract-template.md](contract-template.md) from the quote and the PRD's MVP scope. Keep the filled contract out of the repo.
   - Report the files created, the 3 riskiest open questions, and the accounts Phase 0 will need (repo, hosting, data store, auth). They don't have to exist yet: `build` does the local work first and hands back a setup checklist. End with: "Start a new chat and run `/roadmap-next`" (Phase 0 is already planned, so it builds and closes the phase).

## Output

| File | Holds | Template |
|---|---|---|
| `README.md` | What it is, run it, links to docs | [templates/README.md](templates/README.md) |
| `AGENTS.md` | Agent index: rules, commands, map, workflow | agents-md |
| `docs/PRD.md` | Why and what: users, scope with AC, non-goals, metrics, risks | [templates/PRD.md](templates/PRD.md) |
| `docs/ARCHITECTURE.md` | How: stack, diagram, data model, contracts, quality baseline | [templates/ARCHITECTURE.md](templates/ARCHITECTURE.md) |
| `docs/DESIGN.md` | Look: tokens, type, components (UI only) | design-md |
| `docs/ROADMAP.md` | Phases, tasks, and Later (deferred ideas) | [templates/ROADMAP.md](templates/ROADMAP.md) |
| `docs/decisions/ADR-0001-<slug>.md` | One significant decision each | decision-log |
| `docs/GLOSSARY.md` | Domain terms, only when step 4 needed them | domain-modeling |

Doc rules: summary line first; tables and bullets over prose; each fact in one file, linked from others; split an oversized section into `docs/<area>/` and link it; never link to a file that doesn't exist.
