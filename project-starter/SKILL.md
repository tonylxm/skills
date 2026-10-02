---
name: project-starter
description: Kick off a new software project from a short description. Walks through the stack, architecture, design, quality and project specifics, then writes MVP_PRD.md, ROADMAP.md, TODO.md, DESIGN.md and AGENTS.md. Use --adopt for an existing repo.
argument-hint: "\"<quick description>\" [--adopt]"
disable-model-invocation: true
---

# Project Starter

Turn a quick description into a planned, agent-ready project. You orchestrate the work. Delegate to the named skills instead of redoing what they do.

## How every step runs

- **Questions:** follow the grilling skill for every step that asks the user anything, and the domain-modeling skill whenever new domain terms come up. When a step delegates to another skill (refine-idea, market-research, design-md, agents-md), that skill's own questions replace grilling for that step. Ask in rounds, with a recommended answer for every question. The user either **provides** their own answer or **accepts the recommendation**. For bigger choices, show 2–3 options with one-line trade-offs, and recommend the option that best fits the step 2 constraints.
- **Glossary:** domain-modeling keeps `GLOSSARY.md` up to date as terms come up.
- **Decisions:** decisions that pass its three-part test go to `docs/decisions/` via the decision-log skill.
- **Facts:** find facts yourself. Read the repo, search the web, and dispatch sub-agents. Only *decisions* go to the user.
- **Resume:** before each step, check whether its output already exists. If it does, summarise it and ask "keep, update, or redo?" This makes the skill resumable and lets you re-run a single step ("redo design").
- **Progress:** show a one-line progress marker at the start of each step, e.g. `[4/10] Tech stack`.

## Steps

1. **Idea.** Restate the description as one line covering the problem, the user and the outcome. If it's vague, run the refine-idea skill first. Called from here, it saves its one-pager to `docs/ideas/` without asking.
2. **Constraints.** Solo or team (this sets the workflow mode in [tech-stack.md → CI/CD](tech-stack.md#cicd)), timeline, budget and hosting cost ceiling, and existing skills or stack preferences. Also compliance: privacy law applies wherever personal data is stored, e.g. the NZ Privacy Act or GDPR.
3. **Market** (optional, offered): run the market-research skill, using `quick` by default.
4. **Tech stack.** Cover language, framework, data store, auth, hosting and key libraries. Start from [tech-stack.md](tech-stack.md) as the default recommendation, and deviate only when the step 2 constraints require it, saying why. Record an ADR for each choice that carries lock-in.
5. **Architecture.**
   - Components and how they talk, as a mermaid diagram.
   - The core data model (entities and relationships, using `GLOSSARY.md` terms).
   - The main API or interface contracts.
   - Record an ADR for its shape.
6. **Design.** Run the design-md skill. Skip this step for backend-only, CLI or library projects.
7. **Quality baseline.**
   - Testing: start from the Testing section of [tech-stack.md](tech-stack.md). Confirm this project's must-cover flows, and deviate only when the constraints require it.
   - Security: auth model, secrets handling, OWASP top risks for this stack, dependency scanning.
   - Deployment: the workflow mode, environments, CI/CD and rollbacks. Start from [tech-stack.md → CI/CD](tech-stack.md#cicd).
   - Non-functional requirements: performance targets, scale assumptions, observability (logs, errors, uptime), and a responsive layout (mobile-first, phone to desktop) for UI projects unless specified otherwise.
8. **Project specifics.** Ask which areas need depth, such as pricing and plans, a key feature's behaviour, onboarding, or integrations. Then grill only those.
9. **Write the docs**, using `templates/`:
   - `MVP_PRD.md`: scope, non-goals, features with acceptance criteria, success metrics, risks and open questions.
   - `ROADMAP.md`. **Phase 0 is always a walking skeleton:** the repo scaffold, lint and format, test runner, CI, `.env.example`, and a deploy of "hello world" to the chosen host. Later phases deliver vertical slices of the MVP. Break only Phase 0 into tasks. If the stack matches a template in [tech-stack.md → Templates](tech-stack.md#templates), use the template variant of Phase 0. Otherwise use the scaffold variant, whose scaffold task uses the exact command from [tech-stack.md](tech-stack.md).
   - `TODO.md`: everything deferred past the MVP, including the CI/CD deferred list.
   - Then run the agents-md skill to produce `AGENTS.md`.
10. **Hand off.** List the files created, the 3 riskiest open questions, and the next command: `/roadmap-next build` (Phase 0 is already planned).

## --adopt (existing repo)

Run the same steps, but take the answers from the code first:
- The stack comes from the manifests, which override [tech-stack.md](tech-stack.md). An existing `.husky/`, `lefthook.yml` or `.github/workflows/` also wins. The architecture comes from the directory layout and entry points.
- Commands come from the scripts and CI. The design comes from the theme files.

Present what you inferred as settled, and only grill the gaps (the product intent, non-goals, and what's next). Never overwrite existing docs without the "keep, update, or redo?" check.

## Doc rules (all outputs)

- Each file opens with a summary that a reader can stop after.
- Use tables and bullets, not paragraphs.
- Each fact lives in exactly one file. Other files link to it. For example, the stack is listed in the PRD, and `AGENTS.md` links to it.
- When a section outgrows its file, split it into `docs/<area>/…` and link to the new file.
- Exceptions: ADRs keep decision-log's format. `AGENTS.md` non-negotiables may restate a critical rule in one line if they link its source.
- Don't link to files that don't exist yet.
