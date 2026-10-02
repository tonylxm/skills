# Craft floor

Adapted from [pbakaus/impeccable](https://github.com/pbakaus/impeccable) `craft-floor.md` (Apache-2.0, commit `508d7e8`).

Read this after the direction is settled, and build without announcing the checklist. A pinned brief or `DESIGN.md` overrides anything here; your own habit does not.

## Verify

Each item is a check on the built result, not an intention. Run them together in one frontend-verify pass, not as separate screenshot trips.

- **Contrast:** body and placeholder text at least 4.5:1, large text at least 3:1. On coloured surfaces, tint secondary text from that hue or the foreground, never plain grey.
- **Depth:** shadows have an offset and a soft blur. A zero-offset coloured halo is decoration.
- **Spacing:** tight groups, generous separation, more space above a heading than below it. Read the computed values.
- **Type:** body measure 65–75ch, display at most 6rem, tracking no tighter than -0.04em, balanced headings, obvious steps in scale and weight. Run the real copy at every breakpoint and fix what overflows.
- **Motion:** one authored moment, not scattered effects or the same entrance on every section. Ease out from an already-visible default.
- **States:** hover, disabled, loading, error, empty, plus real content, working controls, responsive composition and keyboard focus.
- **Browser surfaces:** text selection, caret, focus rings, underline offset, scrollbars and tabular numerals ship with browser defaults. Theme them from the palette. This is the cheapest sign a page was built rather than assembled.
- **Copy:** the product's own language. Controls name their action; errors name the problem and the recovery.
- **Coverage:** every brief requirement is present and findable within seconds.

## Refuse

These are the category's defaults. The brief's own words can earn any of them back; reaching for one when the axis is free means you were not deciding. Rewrite the element rather than softening it.

Page scaffolds:

- Same-size cards of icon + heading + text as the page structure. Cards are the lazy container, and nested cards are always wrong.
- The hero-metric template: big number, small label, supporting stats, accent.
- An eyebrow or kicker label above a heading. The heading carries its own weight.
- Section numbers (01 / 02 / 03) unless the sequence carries information the reader needs.
- A modal for a task that needs neither interruption nor protected focus.

Surface habits:

- Purple, indigo or violet as the default brand colour or gradient wash.
- Gradient text. Emphasis comes from weight or size.
- Glass and blur as decoration rather than a specific effect.
- A coloured `border-left` or `border-right` above 1px on cards, list items, callouts or alerts.
- Hard offset shadows (`box-shadow: 4px 4px 0`) outside a design that is actually neobrutalist.
- Sparklines, progress rings and soft-shadowed rounded rectangles standing in for content.
- Monospace used to look "technical" rather than for code, data or measurement.
- Emoji or unicode glyphs standing in for an icon system. Icons come from the project's icon set (Lucide by default) or authored SVG, in one consistent stroke and weight.
- Colour, light or dark chosen by category ("fintech is navy"). Choose from the use scene: who, where, under what light.

The floor holds the mechanics; it never picks the direction. With every check green, spend the page on the committed direction.
