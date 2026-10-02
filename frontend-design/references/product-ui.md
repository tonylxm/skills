# Product UI

Adapted from [pbakaus/impeccable](https://github.com/pbakaus/impeccable) `operate.md` (Apache-2.0, commit `508d7e8`).

For app screens, dashboards, settings, data tables, tools and anything behind a login, where the user is in a task. Docs and long-form pages take the typography and consistency rules here, with prose measure and navigation mattering more than density.

## The product test

Can a user fluent in the category trust the interface immediately, or do they pause at every subtly-off component? Product UI fails through strangeness without purpose: over-decorated buttons, mismatched form controls, gratuitous motion, display fonts where labels should be, invented affordances for standard tasks. The tool should disappear into the task.

## Typography

- One well-tuned sans usually carries headings, buttons, labels, body and data.
- Fixed rem scale, not fluid `clamp()` headings.
- Tight scale ratio, 1.125–1.2 between steps.
- Prose still runs 65–75ch. Tables and compact UI can run denser.

## Colour

- Restrained by default. A single surface can earn more (a report where one category colour carries the data, a drenched welcome screen).
- A full semantic state set: hover, focus, active, disabled, selected, loading, error, warning, success, info.
- The accent is for primary actions, current selection and state, never decoration.
- A second neutral layer for sidebars, toolbars and panels, slightly cooler or warmer than the content surface.

## Layout

- Responsive behaviour is structural: collapse the sidebar, adapt the table, change columns at breakpoints.

## Components

- Every interactive component has default, hover, focus, active, disabled, loading and error.
- Skeletons for loading, not spinners in the middle of content.
- Empty states that teach the interface, not "Nothing here".
- One affordance vocabulary across the product: same button shapes, same form controls, same icon style.
- Overlays escape their container. A dropdown inside an `overflow: hidden` ancestor gets clipped; use `<dialog>`, the popover API, `position: fixed` or a portal.

## Motion

- 150–250ms on most transitions.
- Motion conveys state (change, feedback, loading, reveal), nothing else.
- No orchestrated page-load sequences.

## Avoid

- Inconsistent components across screens. If "Save" looks different in two places, one is wrong.
- Display fonts in labels, buttons or data.
- Reinventing standard affordances for flavour (odd scrollbars, custom form controls, non-standard modals).
- Full-saturation accents on inactive states.
- The modal as first thought. Try inline or progressive disclosure first.

## Allowed here

- System fonts and familiar sans defaults.
- Standard navigation: top bar plus side nav, breadcrumbs, tabs, command palette.
- Density, when users need it.
- Consistency over surprise. Delight is for moments, not pages.
