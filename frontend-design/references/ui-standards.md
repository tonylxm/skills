# Craft floor

Adapted from [pbakaus/impeccable](https://github.com/pbakaus/impeccable) `craft-floor.md` (Apache-2.0, commit `508d7e8`).

Read this after the direction is settled, and build without announcing the checklist. A pinned brief or `DESIGN.md` overrides anything here; your own habit does not.

## Verify

Each item is a check on the built result, not an intention. Run them together in one browser-e2e pass, not as separate screenshot trips.

- **Contrast:** body and placeholder text at least 4.5:1, large text at least 3:1. On coloured surfaces, tint secondary text from that hue or the foreground, never plain grey.
- **Depth:** shadows have an offset and a soft blur. A zero-offset coloured halo is decoration.
- **Spacing:** tight groups, generous separation, more space above a heading than below it. Read the computed values.
- **Type:** body measure 65–75ch, display at most 6rem, tracking no tighter than -0.04em, balanced headings, obvious steps in scale and weight. Run the real copy at every breakpoint and fix what overflows.
- **Motion:** one authored moment, not scattered effects or the same entrance on every section. Ease out from an already-visible default.
- **States:** hover, disabled, loading, error, empty, plus real content, working controls, responsive composition and keyboard focus.
- **Browser surfaces:** text selection, caret, focus rings, underline offset, scrollbars and tabular numerals ship with browser defaults. Theme them from the palette. This is the cheapest sign a page was built rather than assembled.
- **Copy:** the product's own language. Controls name their action; errors name the problem and the recovery.
- **Coverage:** every brief requirement is present and findable within seconds.

## Conventions

The default behaviour of common controls. Break one only when the brief gives a reason.

- **Switch or checkbox:** a switch applies its change the moment it flips, with no Save. Settings that wait for a Save button are checkboxes. Never put both in one group.
- **Choice controls:** up to 6 mutually exclusive options are radio buttons or a segmented control, all visible. More than 6 is a select, and past about 15 a searchable combobox. Multi-select follows the same split: checkboxes, then a multi-select combobox.
- **Dirty state:** unsaved edits are visible (Save enabled, a changed marker). Leaving them by navigation, close or Esc opens a discard dialog that names what is lost, with "Discard changes", "Keep editing" (focused by default) and Save where it can. Tab close and reload use `beforeunload`. No dialog when nothing changed.
- **Save feedback:** every save ends in a toast. Success is short ("Settings saved"), `role="status"`, gone after about 5s. A failed save shows an error toast that stays until dismissed, names what failed, offers Retry and keeps the user's edits. Field errors also stay inline, never only in a toast.
- **Submit buttons:** stay enabled. Validate a touched field on blur and the whole form on submit, never per keystroke, then focus the first error with its message under the field. While the request runs, the button shows loading and ignores repeat clicks.
- **Destructive actions:** reversible ones run at once with Undo in the toast. Irreversible or bulk ones confirm in a dialog that states the object and count, with a button named for the action ("Delete 12 files"), never "Yes" or "OK".
- **Waiting:** under about 1s, show nothing. From 1 to 10s, a skeleton for page loads or a spinner in the control that started it. Over 10s, a progress bar with an estimate and a way to cancel or leave.
- **Labels:** every field has a visible label above it. A placeholder is an example, never the label. Mark whichever of optional or required is the minority, not both.
- **Keyboard:** Enter submits a single-line form. Esc closes dialogs, menus and popovers (through the dirty-state check), and focus returns to the trigger.
- **Targets:** at least 24×24px (WCAG 2.5.8), 44px on touch-first screens.
- **URL state:** filters, tabs, search, sort and page live in the URL, so Back, refresh and a shared link restore the view.
- **Link or button:** navigation is an `<a>`, an action is a `<button>`. Never a clickable `div`.
- **Empty states:** say why the view is empty and offer the action that fills it. "No results" also offers clearing the filters.
- **Optimistic updates:** low-risk changes (like, reorder, a switch) show at once and roll back with an error toast if the server fails. Never for payments, deletes or anything irreversible.
- **Input attributes:** every field has the right `type`, `inputmode` and `autocomplete`. Never block paste.
- **Tables:** numbers right-aligned, header sticky, sort direction shown, truncated text available in full on hover or focus.
- **Dates:** relative ("3h ago") for recent activity, with the exact time on hover. Absolute where moments are compared (logs, chat, history). Always the user's locale and timezone.
- **Icon-only buttons:** an `aria-label` and a tooltip with the same words.
- **Primary action:** one per view. Dialog button order is the same across the app.
- **Reduced motion:** under `prefers-reduced-motion`, movement becomes a fade or nothing.

## Refuse

These are the category's defaults, and the one list of what AI-generated design clusters around. The brief's own words can earn any of them back; reaching for one when the axis is free means you were not deciding. Rewrite the element rather than softening it.

Whole-page looks:

- Warm cream background (near `#F4F1EA`) with a high-contrast serif display and a terracotta or clay accent (near `#D97757`, Anthropic's own Claude accent, so on a user's brief it reads as a tell).
- Near-black background with a single bright acid-green or vermilion accent.
- Broadsheet layout: hairline rules, zero radius, dense newspaper-like columns.
- The SaaS-card kit: identical rounded cards, the same soft grey shadow (`rgba(0,0,0,.1)`) under each, gradient washes as decoration.

Page scaffolds:

- Same-size cards of icon + heading + text as the page structure. Cards are the lazy container, and nested cards are always wrong.
- The hero-metric template: big number, small label, supporting stats, accent.
- An eyebrow or kicker label above a heading. The heading carries its own weight.
- Section numbers (01 / 02 / 03) unless the sequence carries information the reader needs.
- A modal for a task that needs neither interruption nor protected focus.

Type and labels:

- One word or phrase in a headline accented in italic, bold or another colour.
- All-caps labels.
- Meta strings joined with middle dots (`A · B · C`).
- Labels built as `WORD — fragment` with a spaced em dash.
- A `→` appended to link and button text.

Surface habits:

- Purple, indigo or violet as the default brand colour or gradient wash.
- Gradient text. Emphasis comes from weight or size.
- Glass and blur as decoration rather than a specific effect.
- A coloured `border-left` or `border-right` above 1px on cards, list items, callouts or alerts.
- Hard offset shadows (`box-shadow: 4px 4px 0`) outside a design that is actually neobrutalist.
- Sparklines, progress rings and soft-shadowed rounded rectangles standing in for content.
- Monospace used to look "technical" rather than for code, data or measurement.
- Tinted near-black (`#0B0B0B`, `#111`) standing in for black.
- Emoji or unicode glyphs standing in for an icon system. Icons come from the project's icon set (Lucide by default) or authored SVG, in one consistent stroke and weight.
- Colour, light or dark chosen by category ("fintech is navy"). Choose from the use scene: who, where, under what light.
- One radius on everything. Use a small radius scale tied to hierarchy (from `DESIGN.md`).
- Floating pills, chips and badges with no clear owner. Anchor controls to what they act on.
- Centred text and controls by default. Left-align dense or task content; centre only short, focused moments.

The floor holds the mechanics; it never picks the direction. With every check green, spend the page on the committed direction.

## Growing this list

Add an item only after it recurs across projects, not after one bad page. A generic default goes under Refuse in the group it fits. A check that would have caught it goes under Verify. A control behaviour goes under Conventions. One line each, stated as the rule, and edit in `~/.agents/skills`, never a project copy.
