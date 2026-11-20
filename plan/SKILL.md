---
name: plan
description: Use when GitHub issues need triaging for the pipeline (new or rough issues, "plan my backlog", "what's ready"), or when issues labelled needs-human are waiting on the user's decision.
argument-hint: "[owner/repo] [issue numbers]"
disable-model-invocation: true
---

# Plan

The one interactive stage. The user answers every question here, once, so the unattended run never has to ask. Done when every open unplanned issue is `ready`, split, sent back with a question, or closed with a reason, and every `needs-human` issue has an answer. Contracts (labels, issue body, verdict comment): [pipeline](../pipeline/SKILL.md). Plan edits issues, never code.

## Steps

1. **Gather facts yourself.** `gh issue list --state open --json number,title,body,labels,comments` for issues with no pipeline label, plus `needs-human` ones (read the latest comment for what is blocked). Read `AGENTS.md`, `docs/PRD.md`, `ARCHITECTURE.md`, `GLOSSARY.md`, `DESIGN.md` where they exist, and `rg` the code each issue touches. Never ask the user a fact you can look up. No repo docs or no repo at all: stop and point to `/project-starter`.
2. **Triage each issue** with the questions below, and pick one outcome: `READY`, `SPLIT`, `NEEDS-INFO`, `REJECT`.
3. **Ask everything in one batch.** Each question gets a recommended answer, first. Use AskUserQuestion where it exists (up to 4 per call, as many calls as needed). Ask only what you can't decide:
   - decisions the user owns: product, UX direction, data model, pricing, scope cuts, and every consequential choice in [choice-rules.md](choice-rules.md) the issue leaves open. Give 2-3 options with a one-line trade-off and a recommendation
   - for a UI direction that is the user's call: build 2-3 small HTML mockups in the OS temp dir and let them pick. Don't commit them
   - app-only or desktop-only. Default is responsive from 360px, so ask only when the issue is unclear
   - for `needs-human` issues, the question the stage left, with its options
   - accounts, keys or paid services an issue needs, only to decide what the builder provisions itself and what goes on a setup list. Never ask for the values
4. **Write the issues** in the body format from [pipeline](../pipeline/SKILL.md#issue-body). Concise: Goal, acceptance criteria, out of scope, notes. Answered decisions go in Notes. Then `size`, `risk`, `touches` (from the code you read).
5. **Confirm, then apply.** Show one table: issue, outcome, size, risk, one-line reason. Ask: Apply (recommended) / Change something. Only then edit bodies, set labels, post the verdict comment, close rejects and create sub-issues.
6. **Report:** counts per outcome, anything still `needs-human`, and the next command (the runner).

## Triage

| Question | If the answer is bad |
|---|---|
| Is the problem real, and who has it? | `NEEDS-INFO` (ask the author) or `REJECT` with the reason |
| Is there a smaller version that solves it? | Plan the small one, move the rest to a new unlabelled issue |
| Already built, duplicate, or contradicts an ADR or the PRD's non-goals? | `REJECT`, linking the original |
| What assumption would sink it? | Name it in Notes. If cheap to check, check it now |
| What can go wrong (data, money, auth, deps, rollback)? | Set `risk`. Consequential choices become questions |

`REJECT` and `NEEDS-INFO` always say why, in one comment, in plain words. If the user is the author, ask in this session instead of on the issue.

## Size and split

| Size | Meaning | Runs? |
|---|---|---|
| S | One concern, 1-2 areas, roughly ≤150 changed lines | Yes. Spec stays in the issue |
| M | One concern, roughly ≤400 changed lines | Yes |
| L | More than that, or more than one concern | Never. `SPLIT` into sub-issues |

- A sub-issue is a vertical slice that can be tested and merged alone: one PR, one concern, its own acceptance criteria, in dependency order. The parent keeps a task list linking them.
- Order matters: put `Depends on #N` in a dependent issue's Notes. The runner skips an issue until its dependencies are closed.
- Acceptance criteria come from the PRD or the user, never invented. Each is observable at a public interface, so it becomes a test (the agreed seams for [tdd](../tdd/SKILL.md)) or a check.
- A new dependency, a migration, or a change to auth, money or an external contract is named in Notes, so final review can tell planned from surprising.

## Worth building

For a vague or large idea, run [grilling](../grilling/SKILL.md) before writing anything. Push toward the simplest version that solves the real problem, list the assumptions it rests on, and write a "not doing" list into Out of scope. Market questions: [market-research](../market-research/SKILL.md). Domain terms: [domain-modeling](../domain-modeling/SKILL.md). A decision that is hard to reverse, surprising and a real trade-off goes through [decision-log](../decision-log/SKILL.md).
