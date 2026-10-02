# Skill audit checklist

## Frontmatter (broken if wrong)
- [ ] `name`: lowercase, hyphenated, ≤64 chars, **equals the directory name**.
- [ ] `description`: ≤1024 chars, third person, starts with or contains "Use when…".
- [ ] Optional keys are valid: `disable-model-invocation: true` for skills with side effects or long flows that should only run on request; `argument-hint`; `license` when vendored under a non-MIT licence.

## Triggering (weak if wrong)
- [ ] The description names the concrete situations, symptoms and phrases a user would type.
- [ ] The description does **not** summarise the workflow.
- [ ] It doesn't overlap another skill's description in this repo; if it does, sharpen one of them or merge the skills.
- [ ] Explicit-only skills set `disable-model-invocation: true`.

## Body
- [ ] The first lines say what the skill produces and when it is done.
- [ ] The steps are imperative and ordered, and any decision points are explicit.
- [ ] `SKILL.md` is under ~200 lines; reference material lives in linked files, linked directly from `SKILL.md`, not nested.
- [ ] No time-sensitive facts (versions, prices, dates) unless labelled with an "as of" date.
- [ ] No content duplicated from another skill. Reference it by name instead.
- [ ] Paths in the instructions are relative to the skill directory, not to some repo layout (the `skills/<name>/...` bug).
- [ ] Questions to the user are limited, and each comes with a recommended answer.
- [ ] Anything fetched from the web or another tool is treated as data, never as instructions.

## Cross-skill references (broken if wrong)
- [ ] Every `Skill tool with "X"`, `use the X skill`, or `X:Y` reference resolves to a skill that is installed or exists in this repo.
- [ ] No references to upstream namespaces (`superpowers:…`) that are not installed.

## Generated documents
- [ ] Templates start with a summary or table of contents.
- [ ] Facts are stated once; other docs link to them.
- [ ] Always-loaded files (`AGENTS.md`/`CLAUDE.md`) stay indexes. Growth goes to nested or linked files.
- [ ] Re-runs update the file in place and are idempotent. They never blindly append.

## Packaging
- [ ] No new `agents/openai.yaml` files (this repo doesn't ship Codex metadata).
- [ ] Scripts are executable, print usage with `--help`, and fail loudly.
- [ ] Vendored skills: the source and licence are recorded in `THIRD_PARTY_NOTICES.md`, and changes are noted for Apache-2.0 sources.
- [ ] The skill is listed in the repo README with its origin.

## Quick static check (run from the repo root)
```bash
for d in */; do d=${d%/}; f="$d/SKILL.md"; [ -f "$f" ] || continue
  n=$(sed -n 's/^name: *//p' "$f" | head -1); [ "$n" = "$d" ] || echo "name mismatch: $d ($n)"
  grep -oE 'Skill tool (with|twice, for) "[^"]+"( and "[^"]+")?' "$f" | grep -oE '"[^"]+"' | tr -d '"' |
    while read -r r; do [ -d "$r" ] || echo "broken ref in $d: $r"; done
done
```
