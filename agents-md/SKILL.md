---
name: agents-md
description: Use when a repo needs an AGENTS.md or CLAUDE.md created, updated, or slimmed down, when project conventions or non-negotiables should be recorded for coding agents, or after a phase of work taught the team new conventions.
---

# AGENTS.md

Write and maintain `AGENTS.md`, the instructions every coding agent reads at the start of every session. It is always in context, so **every line costs tokens on every task.** The root file is a lean index. Detail lives in linked or nested files.

## Create

1. **Gather facts yourself.** Read the package manifests, lockfiles, CI config, lint and format config, the test setup, `README.md`, `MVP_PRD.md`, `DESIGN.md`, `GLOSSARY.md` and `docs/decisions/`. Run the build, test and lint commands to confirm they work. **Greenfield** (nothing scaffolded yet): write the planned commands with a `# planned` marker. The roadmap's Phase 0 makes them real, and `roadmap-next close` re-runs this skill to verify them and remove the markers.
2. **Ask the user only for things the code can't tell you.** Non-negotiables, team conventions, and areas that are off-limits. Give a recommended answer with each question.
3. **Write the file** from [template.md](template.md).
4. **Don't create `CLAUDE.md`.** Claude Code reads `AGENTS.md` natively.

## Update (the default when the file exists)

- Re-verify the commands. Fix stale ones, and delete rules the code or a linter now enforces.
- Add a rule only if it is **new**, **non-obvious**, and an agent got it wrong or would get it wrong. Phrase it as an instruction, with a reason when the reason isn't obvious.
- Rewrite in place. Never append a "learnings" log.
- Keep blocks that a tool generates, such as `<!-- BEGIN:nextjs-agent-rules -->` … `<!-- END:… -->`, word for word, at the top of the file. The tool adds them back, so removing one only leaves an uncommitted diff.

## What belongs where

| Content | Location |
|---|---|
| Non-negotiables, commands, repo map, links | Root `AGENTS.md` |
| Rules for one package or app | `<dir>/AGENTS.md` (nested; the nearest file wins) |
| Rules for one concern, such as testing, API style or migrations | `docs/<topic>.md`, linked from the root file |
| Why a decision was made | `docs/decisions/` (decision-log) |
| Domain terms | `GLOSSARY.md` |
| Look and feel | `DESIGN.md` |

Exception: a non-negotiable may restate a rule recorded elsewhere when breaking it would be costly. Keep it to one line and link the source, e.g. `Gap entries are private ([ADR-0005](docs/decisions/0005-….md))`.

Leave out:
- Anything an agent can infer from the code or config.
- Generic advice like "write clean code".
- Rules that a tool already enforces. Name the tool instead.

When a root section starts to describe a single area, move that section into a nested or linked file.
