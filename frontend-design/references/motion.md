# Motion

Adapted from [emilkowalski/skills](https://github.com/emilkowalski/skills) `review-animations/STANDARDS.md` (MIT, commit `c8a7962`).

Read this when a UI change adds or edits animation. Basic rules (reduced motion, `transform`/`opacity` only, no `transition: all`) are in [web-interface-guidelines.md](web-interface-guidelines.md). A pinned brief or `DESIGN.md` overrides anything here.

## Pick the tool
| Need | Use |
|---|---|
| Hover, press, color, enter/exit of a small element | CSS transitions (`@starting-style` for entry) |
| Predetermined motion, page-load sequence | CSS animations (run off the main thread) |
| Programmatic control without a library | WAAPI (`element.animate`) |
| Exit on unmount, `layout`/`layoutId`, springs, drag with momentum | `motion`, React apps only |

`motion` is a new dependency: ask first, and skip it on Astro sites. Check the installed version before using its API.

## Should it animate?
| Frequency | Decision |
|---|---|
| 100+ per day (keyboard shortcuts, command palette toggle) | No animation |
| Tens per day (hover, list navigation) | Remove or cut down |
| Occasional (modal, drawer, toast) | Standard |
| Rare or first-time (onboarding, celebration) | Delight allowed |

Valid reasons: spatial consistency, state change, feedback, explaining, avoiding a jarring jump. "It looks cool" on a frequently seen element is not one.

## Timing
- **Easing:** enter and exit use ease-out, on-screen movement uses ease-in-out, hover and color use `ease`, constant motion (marquee, progress) is `linear`. Never ease-in on UI.
- **Curves:** built-in CSS easings are weak. Use `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` and `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`.
- **Duration:** UI stays under 300ms by default. Longer travel or a bigger element can earn more; keep feedback responsive.

| Element | Duration |
|---|---|
| Button press | 100–160ms |
| Tooltip, small popover | 125–200ms |
| Dropdown, select | 150–250ms |
| Modal, drawer | 200–500ms |

- **Asymmetric:** slow where the user is deciding (hold-to-delete 2s), fast where the system responds (release 200ms).
- **Exits:** about 20% shorter than the matching entrance.
- **Stagger:** 30–80ms between items, decorative only, never blocks interaction.

## Physicality
- Never `scale(0)`. Start from `scale(0.95)` plus opacity 0.
- Small in-place entrances (a menu item, a chip) start from `scale(0.97)` plus opacity 0.
- Popovers and tooltips scale from their trigger (`transform-origin`). Modals stay centered.
- Tooltips: delay only the first. Once one is open, neighbours show instantly.
- Don't tween a control while it is held (a dragged slider thumb follows the pointer directly).
- A wrong input shakes (`translateX` 0, -10, 10, -6, 6, -3, 0px over 360ms) as well as turning red. Stay still under reduced motion.
- A stepper or wizard slides the next step in from the direction of travel, not a crossfade.
- Accordions: `interpolate-size: allow-keywords` lets `height: auto` animate. Chromium only, so elsewhere it jumps, which is fine.
- Pressable elements: `scale(0.97)` on `:active`, 160ms ease-out.
- Springs only for drag, momentum and interruptible gestures. Keep bounce at 0.1–0.3 or none.
- A crossfade that shows two overlapping states: add `filter: blur(2px)` during it (under 20px, heavy blur is slow in Safari).

## Interruptibility and performance
- Rapidly triggered motion (toasts, toggles) uses transitions, which retarget from the current state. Keyframes restart from zero.
- Set `transform` on the element itself. Driving a child's transform through a CSS variable on the parent recalculates styles for every child.
- Layout animation in `motion` runs on the main thread, so avoid it while the page is busy.

## Accessibility
- `prefers-reduced-motion`: gentler, not zero. Keep opacity and color, drop movement.
- Gate hover motion with `@media (hover: hover) and (pointer: fine)`.

## Review checklist
Flag these on sight. Fix by deleting first, then shortening, then fixing easing, origin, interruptibility and properties.
- `transition: all`, `scale(0)`, ease-in on UI, UI longer than 300ms with no reason
- Animation on a keyboard shortcut or 100+/day action
- Center origin on a trigger-anchored popover
- Keyframes on toasts or toggles
- Layout properties animated (`width`, `height`, `margin`, `padding`, `top`, `left`)
- Missing reduced-motion handling, ungated hover motion
- Same entrance on every section (see the Motion line in [ui-standards.md](ui-standards.md))

When unsure about feel, slow it 2–5x (DevTools Animations panel) and check origin, easing and synced properties.
