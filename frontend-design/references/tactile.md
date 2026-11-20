# Tactile motion

Read this with [motion.md](motion.md) when a control should feel physical: buttons, tabs, toggles, segmented controls, skeletons. Timing, easing basics and reduced motion live in motion.md and are not repeated here. A pinned brief or `DESIGN.md` overrides anything here.

## Where it applies
| Surface | Feel |
|---|---|
| Primary and secondary buttons, switches, segmented controls, tabs | Full: depth, press-in, spring release |
| Row actions, links, icon buttons | Colour change and a 0.97 press only |
| Table cells, list rows, keyboard-driven actions (100+ a day) | None |

Depth and bounce on every element reads as a toy. Spend it on the controls a person presses on purpose.

## Raised buttons
- **Light from above:** a 1px inner top highlight (`inset 0 1px 0 rgb(255 255 255 / .2)`), a small tight shadow and a larger soft one below. Dark mode: lower the highlight to .08 and deepen the shadow, never glow.
- **Press:** `:active` goes to `scale(.97) translateY(1px)`, the outer shadow shrinks to nearly flat, the inner highlight fades, and the fill darkens one step. 100–160ms, ease-out.
- **Release:** back to rest with the spring curve below, 200ms. The release is the part that feels alive, so it is slower than the press.
- Put the transform on the button itself, and transition only `transform`, `box-shadow` and `background-color`. Never `transition: all`.
- Hover (gated by `@media (hover: hover) and (pointer: fine)`): colour only, no movement.
- A disabled button has no depth: flat, no shadow, no press.

## Springs without a library
- **Overshoot, light:** `cubic-bezier(.34, 1.56, .64, 1)`. For a small pop (a checked box, a pill landing).
- **Real spring:** CSS `linear()` easing sampled from a spring curve, e.g. `linear(0, .22 8%, .72 20%, 1.04 34%, 1.07 40%, .98 56%, 1.01 72%, 1)`. Generate the points once, store them as a token. Supported in current Chrome, Safari and Firefox, and ignored (falls back to the declared `ease-out`) elsewhere, so declare a plain fallback first.
- Keep overshoot to 3–8%. More reads as a game.
- Use transitions, not keyframes, so a second click mid-flight retargets from the current state instead of restarting.
- Reach for the `motion` library only for drag with momentum, exit-on-unmount or shared-layout animation. Ask first.

## Squish and pop tabs
- The selection pill slides to the new item (see `SlidingIndicator` in Milly: it moves on the press, not when the server answers).
- During the slide the pill stretches a little (`scaleX(1.04)`, origin on the side it moves toward) and settles with the light overshoot curve. The labels cross-fade colour only.
- The pressed item squishes (`scale(.96)`), the arriving item pops back to 1.
- Reduced motion keeps the colour change and drops the slide, the stretch and the squish.

## Layout stays put
- Reserve space for anything that arrives later: explicit `width`/`height` or `aspect-ratio` on images and charts, `min-height` on regions that load, `scrollbar-gutter: stable` on the page.
- Numbers use `tabular-nums` so a changing amount keeps its width. Never animate a figure counting up (DESIGN.md rule in Milly).
- A control's state change (selected, loading) must not change its size: a loading button keeps its width, with the label and spinner overlaid, not swapped.
- Animate `transform` and `opacity` only. A popover or toast is positioned out of flow, so its arrival moves nothing.
- Fonts: `font-display: swap` with a metric-matched fallback, so text does not reflow.

## Skeletons
- Same dimensions as the content they stand in for, built from the real row or card layout, not a generic grey block.
- One shimmer: a slow linear gradient sweep (1.5s, `linear`), `transform`-driven, all skeletons in sync. Under reduced motion, a static fill.
- Show a skeleton only after about 150ms, and hold it at least 300ms once shown, so a fast load never flashes.
- Content arrives by a 120ms opacity fade into the same box. No slide, no height change.
- Empty and error states reuse the skeleton's box, so the page does not jump when loading ends.

## AI tells in motion
- Every section sliding up on scroll, staggered cards on load, hover lifts on every card.
- Bounce on frequent actions, `scale(0)` entrances, infinite pulsing or floating decoration.
- Spinners where a skeleton fits. Parallax or tilt with no purpose. Gradient shimmer on buttons.
- Springs with visible wobble (more than two oscillations).

## Verify
1. Slow the animation 4x (DevTools Animations panel) and check origin, overshoot and that nothing else moves.
2. Click twice fast on the same control and on two neighbouring controls: it must retarget, not restart or stack.
3. Turn on reduced motion: colour and opacity stay, movement goes.
4. Throttle the network and CPU: no layout shift when content arrives (Chrome Performance panel, Layout Shift track).
5. Touch: the press state shows on tap, and nothing depends on hover.
