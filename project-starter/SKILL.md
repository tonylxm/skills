---
name: project-starter
description: Use when starting a new project from an idea. Writes README, AGENTS.md and docs/, then creates the repo and first issues.
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

1. **Idea.** One line: problem, user, outcome. Vague? Run [grilling](../grilling/SKILL.md) to find the simplest version worth building. Offer market-research (`quick`) if the market is unclear.
2. **Constraints.** Solo or team (sets the Workflow mode, [tech-stack.md → CI/CD](../stack-defaults/tech-stack.md#cicd)), timeline, hosting budget, compliance (privacy law wherever personal data is stored).
3. **Stack.** Start from the defaults in [tech-stack.md](../stack-defaults/tech-stack.md). Deviate only when step 2 requires it, and say why. ADR for each lock-in choice.
4. **Architecture.** Components (mermaid), core data model, key contracts, quality baseline (tests, security, deploy, NFRs) from tech-stack.md. If the domain has terms that are easy to confuse, run domain-modeling, which writes `docs/GLOSSARY.md`. ADR for the shape.
5. **Design.** Run Impeccable (`/impeccable init`, then `document`), which writes `PRODUCT.md` and `DESIGN.md`. Skip for backend-only, CLI or library projects.
6. **Write and hand off.**
   - Fill the doc templates into the layout below, then run agents-md for `AGENTS.md`.
   - **Repo and issues.** Confirm each outward step with the user first. Create the repo from the template tech-stack.md names (`gh repo create <app> --template ... --private --clone`). Then file the Phase 0 issues under a "Phase 0: walking skeleton" milestone (run `gh label create needs-human --force` first), using the issue template in [to-tickets](../to-tickets/SKILL.md): scaffold and verify the baseline, verify CI, provision the data store and env, deploy hello world (tech-stack.md → CI/CD). Templates ship most of it, so those are check-only. Each step that needs the user's accounts or keys is an issue labelled `needs-human` with numbered steps. Later phases go on the roadmap, deferred ideas are unlabelled issues.
   - For client work, draft the client's list from [clients.md](../stack-defaults/clients.md) (only the rows this project needs) and fill [contract-template.md](../stack-defaults/contract-template.md) from the quote and the PRD's MVP scope. Keep the filled contract out of the repo.
   - Report the files created, the issues filed, the 3 riskiest open questions, and the accounts Phase 0 will need (repo, hosting, data store, auth). End with: `Next: /to-tickets` on the PRD's MVP scope, then `/implement #<N>` per unblocked ticket (those skills are user-invoked, so you run them).

## Output

| File | Holds | Template |
|---|---|---|
| `README.md` | What it is, run it, links to docs | [templates/README.md](templates/README.md) |
| `AGENTS.md` | Agent index: rules, commands, map, workflow | agents-md |
| `docs/PRD.md` | Why and what: users, scope with AC, non-goals, metrics, risks | [templates/PRD.md](templates/PRD.md) |
| `docs/ARCHITECTURE.md` | How: stack, diagram, data model, contracts, quality baseline | [templates/ARCHITECTURE.md](templates/ARCHITECTURE.md) |
| `docs/DESIGN.md` | Look: tokens, type, components (UI only) | Impeccable `document` |
| `docs/ROADMAP.md` | Now / Next / Later / Done, each line an outcome linked to an issue | [templates/ROADMAP.md](templates/ROADMAP.md) |
| `docs/decisions/ADR-0001-<slug>.md` | One significant decision each | decision-log |
| `docs/GLOSSARY.md` | Domain terms, only when step 4 needed them | domain-modeling |

Doc rules: summary line first; tables and bullets over prose; each fact in one file, linked from others; split an oversized section into `docs/<area>/` and link it; never link to a file that doesn't exist.
