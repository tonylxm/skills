# AGENTS.md

Tony's personal agent skills (skills.sh format) for Claude Code, Codex and other agents. Installed via `npx skills add tonylxm/skills`, and linked locally from `~/.claude/skills`.

## Non-negotiables
- Edit skills here, never through `~/.claude/skills` paths or with `npx skills add` (it installs copies outside this repo).
- Every skill folder has a `SKILL.md`. Don't add `agents/openai.yaml` files. The 1 existing one (project-starter) stays only to block implicit invocation in Codex.
- Vendored or adapted skills keep their credit: an Origin cell in the README table and the license text in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Map
- `<skill>/SKILL.md`: entry point. Supporting files (`references/`, `templates/`, `template.md`) sit beside it and are linked from it.
- [README.md](README.md): skills table, workflow diagram, install steps.
- Personal stack defaults: [stack-defaults/tech-stack.md](stack-defaults/tech-stack.md).
- Pipeline: [pipeline/SKILL.md](pipeline/SKILL.md) (contracts and runner). Plan and decisions: [docs/pipeline-plan.md](docs/pipeline-plan.md). Flow diagram: [docs/flow.md](docs/flow.md). Skill status and weak points: [docs/skill-health.md](docs/skill-health.md), update it after a dry run or a core skill change.

## Conventions
- Skills call each other by name. Before renaming or removing one, `rg '<name>'` across the repo and update every reference.
- Adding, renaming or removing a skill also updates its README table row.
- Markdown filenames are kebab-case. Uppercase only for `SKILL.md` and canonical project docs (`README.md`, `AGENTS.md`, and `docs/PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `GLOSSARY.md`, `ADR-*`).
- New or vendored skills: use `find-skills` to vendor, then `refine-skill` to audit before committing.
- Run `bash refine-skill/check.sh` before committing. CI runs it too.

## Workflow
- Solo: commit to `main`. Conventional Commits, scope is the skill name (`feat(project-starter): ...`).
