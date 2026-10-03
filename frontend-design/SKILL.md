---
name: frontend-design
description: Use when building or reshaping any UI (product screens, dashboards, settings, landing pages, components), when the result looks generic or AI-generated, or when asked to review UI code for design, accessibility or interface best practice.
license: Complete terms in LICENSE.txt
---

# Frontend Design

> If the project has a `DESIGN.md`, it is the source of truth: use its tokens, type and components, and apply the guidance below only where it is silent. Propose changes to `DESIGN.md` rather than diverging from it.

## Pick the mode first

- **Product UI** (app screens, dashboards, settings, admin, tools): the default for most work. Familiarity is the feature: a user fluent in the category should trust every control at once, and the interface should disappear into the task. The studio stance below does not apply; spend distinctiveness only in precise details. Read [references/product-ui.md](references/product-ui.md).
- **Marketing** (landing, pricing, campaigns): see the marketing reference below.

**Marketing:** read [references/marketing.md](references/marketing.md) first. It holds the studio stance, hero, type, motion, the generic-default traits to avoid, and the plan-then-critique process.

Either way, prefer lists, tables and plain sections spaced for hierarchy over cards (cards only for things that really are discrete objects), a neutral base with one restrained accent for actions and state, every component state built (hover, focus, active, disabled, loading, error, empty), skeletons over spinners, and empty states that teach.

**References:** if `docs/design/references/` exists, read those screenshots and take the pattern (layout, density, flow), never the brand. Otherwise follow `DESIGN.md` and platform norms (Apple HIG, Material 3). A reference MCP (Mobbin, Refero) or Figma MCP can be added later when design needs more weight.

**Before any UI edit**, read [references/craft-floor.md](references/craft-floor.md). Its Refuse list is the "never by default" set in either mode: purple or indigo defaults, gradient text, decorative glass, card grids and nested cards, emoji icons, thick coloured side borders, modal-first flows. **When reviewing UI code**, check it against [references/web-interface-guidelines.md](references/web-interface-guidelines.md) and the craft-floor Refuse list, and report `file:line` findings with paths relative to the repo root. Note any plain bugs you spot too, but the rules are the checklist.


## More on writing in design

Words appear in a design for one reason: to make it easier to understand and use. They are design content, not decoration. Bring the same intentionality and minimalism to copywriting that you would bring to spacing and color. Before writing anything, ask what the design needs to say, and how it can best be said to help the person navigate the experience.

Write from the end user's perspective. Name things by what users will understand in simple language, not by how the system is built. A user manages notifications, not webhook config. Describe what something is or does in plain terms rather than selling it. Being specific and legible to new users is always better than being clever.

Use active voice as default. A CTA says exactly what happens when it is used: "Save changes," not "Submit." An action keeps the same name through the whole flow, so the button that says "Publish" produces a toast that says "Published." The vocabulary of an interface is the signposting for someone navigating the product. Cohesion and consistency are how people learn their way around.

Treat failure and emptiness as moments for direction, not mood. Explain what went wrong and how to fix it, in the interface's voice rather than a person's. Errors don't apologize, and they are never vague about what happened. An empty screen is an invitation to act.

Keep the tone conversational: plain verbs, sentence case, no filler, with tone matched to the brand and the audience. Let each written element do exactly one job.
