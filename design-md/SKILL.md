---
name: design-md
description: Use when a project needs a visual design system or brand direction defined (colours, typography, style, logo, UI components), when creating or updating DESIGN.md, or when extracting the design language from an existing UI.
---

# DESIGN.md

Write `DESIGN.md`: the single source of truth for how the product looks. It must be precise enough that frontend-design, UI-generation tools and future agents produce on-brand screens without guessing.

## Inputs

Read these first, if they exist: `MVP_PRD.md`, `docs/research/market.md` (competitors' visual language, so you can position against it), `GLOSSARY.md`, and any existing UI code (Tailwind config, CSS variables, theme files).

- **Existing UI:** extract the real tokens from the code. Don't invent them. Ask only about the gaps.
- **New project:** decide each section below. For each one, the user either provides their choice, or you recommend one: give 2–3 directions as one line each, with a recommended pick that is grounded in the audience and the product, not in generic SaaS defaults.

## Decisions, in order

1. **Personality.** 3 adjectives, what it must *not* feel like, and one or two reference products.
2. **Colour.**
   - Roles: primary, accent, background, surface, text, muted, border, and success/warning/danger.
   - Hex values for light **and** dark mode.
   - Check WCAG AA contrast for text roles.
3. **Typography.**
   - Font families: display, body and mono. They must be free for the project's use.
   - A type scale, and when each weight is used.
4. **Shape and depth.** Radius scale, spacing scale, and shadow/elevation style.
5. **Logo direction.** Concept, mark type (wordmark, symbol, or combination), how it uses the palette, and minimum sizes. Describe it; don't generate image files unless asked.
6. **Components.** Buttons, inputs, cards, navigation, feedback (toast, empty state, error) and data display. Each gets one line of rules.
7. **Motion and accessibility.** Motion durations and easing, `prefers-reduced-motion`, focus style, and touch-target size.

## Output

Use [template.md](template.md).
- Tokens go in one fenced YAML block so code can copy them.
- Each rule gets at most one line of rationale.
- If the project uses CSS or Tailwind, offer to sync the tokens into the theme file. The code then follows `DESIGN.md`, and `DESIGN.md` is never generated from the code after the fact.
- On re-runs, update the file in place. When the components section outgrows the file, move it to `docs/design/components.md` and link to it.

Record a significant brand decision (e.g. a deliberate break from category conventions) with the decision-log skill.
