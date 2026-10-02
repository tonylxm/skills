---
name: refine-skill
description: Use when creating, reviewing, auditing, or improving an agent skill (a SKILL.md), when a skill doesn't trigger or behaves inconsistently, or before publishing a skills repo.
---

# Refine Skill

Audit a skill against the checklist, propose fixes, apply them once the user agrees, and verify the result. To build a brand-new skill from scratch, interview the user for the triggers and job first, then write it to this checklist.

## Process

1. **Locate.** Read the whole skill directory: `SKILL.md`, every linked file, scripts, and `agents/openai.yaml`. If the target is a repo of skills, audit each one and add the cross-skill checks below.
2. **Audit** against [checklist.md](checklist.md). Record each finding as `severity · file:line · problem · fix`. Severities are **broken** (won't load or will misbehave), **weak** (under-triggers, wastes context, ambiguous), and **polish**.
3. **Report** the findings as a table, broken first, and say which ones you recommend fixing. Fix only after the user agrees.
4. **Apply** the fixes. Keep upstream wording in vendored skills unless it is wrong; record the deviation in the repo's notices.
5. **Verify:**
   - Re-run the checklist on the changed files.
   - Pressure-test the description: write 3 prompts that should trigger the skill and 2 near-misses that shouldn't, and judge from the description alone.
   - For behavioural changes, run the skill once on a realistic task (or a sub-agent with only the skill loaded) and compare against the intent.
   - If a skill-creator skill is available and the user wants measured results, hand off to it for evals and benchmarking.

## Principles

- **The description says when to use the skill, not how it works.** Agents follow a workflow summary in the description instead of reading the body.
- **Context is the budget.** Only the name and description are always loaded. Keep `SKILL.md` lean (under ~200 lines; under ~500 words for skills that load often) and move detail into linked files, one level deep.
- **One job per skill.** A skill should compose others by name ("call the Skill tool with X") rather than copying their content.
- **Generated docs must stay lean too.** If the skill writes files into a project, check that its templates lead with a summary, use tables and bullets, link instead of restating, and split into new files instead of growing always-loaded ones.
