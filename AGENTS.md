# AGENTS.md

Tony's personal agent skills (skills.sh format) for Claude Code, Codex and other agents. Installed via `npx skills add tonylxm/skills`, and linked locally from `~/.claude/skills`.

## Non-negotiables
- Edit skills here, never through `~/.claude/skills` paths or with `npx skills add` (it installs copies outside this repo).
- Every skill folder has a `SKILL.md`. Don't add `agents/openai.yaml` files. The 3 existing ones (project-starter, handoff, grill-with-docs) stay only to block implicit invocation in Codex.
- Vendored or adapted skills keep their credit: an Origin cell in the README table and the license text in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Map
- `<skill>/SKILL.md`: entry point. Supporting files (`references/`, `templates/`, `template.md`) sit beside it and are linked from it.
- [README.md](README.md): skills table, workflow diagram, install steps.
- Personal stack defaults: [project-starter/tech-stack.md](project-starter/tech-stack.md).

## Conventions
- Skills call each other by name. Before renaming or removing one, `rg '<name>'` across the repo and update every reference.
- Adding, renaming or removing a skill also updates its README table row.
- New or vendored skills: use `find-skills` to vendor, then `refine-skill` to audit before committing.

## Workflow
- Solo: commit to `main`. Conventional Commits, scope is the skill name (`feat(project-starter): ...`).
