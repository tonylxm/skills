---
name: refine-prompt
description: Use when the user has a rough prompt, task description, or system prompt and wants it sharpened before giving it to an AI model or agent, or says "refine/improve/rewrite this prompt".
---

# Refine Prompt

Turn a rough prompt into one a model can act on first time. Do not carry out the prompt itself.

## Process

1. **Read the prompt and its target.** Which model or agent will receive it (coding agent, chat model, image/UI generator, system prompt)? Infer from context; it changes what "good" looks like.
2. **Look things up yourself.** If the prompt is about this repo, read the relevant files, `AGENTS.md`, `GLOSSARY.md` and `DESIGN.md` so the refined prompt names real paths, terms and constraints. Never ask the user for a fact you can find.
3. **Find the gaps** using the checklist below. Ask at most 3 questions, only for decisions you can't infer, each with your recommended answer. If nothing blocks you, skip straight to step 4.
4. **Write the refined prompt** in a single fenced block, then a short "What changed" list (3–6 bullets). Offer one more pass.

## Gap checklist

| Element | Ask yourself |
|---|---|
| Goal | Is the outcome stated, and why it matters? |
| Context | Does the model know the audience, codebase, domain terms, prior attempts? |
| Task | Is it one clear job, broken into steps if order matters? |
| Constraints | Scope limits, things not to touch, tech or style rules, length |
| Output | Exact format, file paths, structure; an example if the format is unusual |
| Done | How the model (or user) can verify success: tests, acceptance criteria |

## Writing rules

- Direct instructions over persona fluff. A role line only if it changes behaviour.
- Say what to do, not only what to avoid; give the reason for any non-obvious rule.
- Put long reference material first and the instruction last; wrap distinct inputs in XML-style tags (`<context>`, `<example>`).
- Use concrete examples rather than adjectives ("returns 404 with `{error}`" beats "handle errors well").
- No ALL-CAPS or threats; modern models over-apply them.
- Keep it as short as it can be while closing every gap. Delete anything the model would do anyway.

## Modes

- `--quick`: no questions; refine with stated assumptions listed under "What changed".
- For UI-generation prompts, pull tokens and components from `DESIGN.md` into a "Design system" section.
