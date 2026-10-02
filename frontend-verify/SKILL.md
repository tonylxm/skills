---
name: frontend-verify
description: Use after any user-facing UI change (new screen, restyle, layout or component fix, UI bug fix) and before saying it is done, or when asked to check, QA, test or screenshot the running app in a browser.
---

# Frontend verify

Prove a UI change works in a real browser before calling it done. Tests and typecheck passing is not evidence that a screen looks or behaves right.

## 1. Open the app

- Start it with the run skill, or `preview_start` from `.claude/launch.json`. Reuse a server that is already running.
- Use the built-in browser by default. Use Claude in Chrome only when the page needs the user's logged-in state, and only read in that session.
- Go straight to the screen that changed.

## 2. One batched pass

Collect everything in a single round, using `browser_batch` where the steps are predictable:

| Check | How |
|---|---|
| Widths 375, 768, 1280 | `resize_window`, then a screenshot at each. No horizontal scroll, nothing clipped or overlapping |
| Light and dark | `resize_window` with `colorScheme`, only if the app supports dark. Not reliable for local files or static HTML previews, which always render light |
| Console and network | `read_console_messages` (errors only), `read_network_requests` for failed calls |
| Accessibility tree | `read_page`: every control has a name, headings run in order, landmarks exist |
| Keyboard | Tab through the changed area: logical order, visible focus, Escape closes overlays, Enter and Space activate |
| States | Trigger loading, empty, error and disabled where the change touches them |
| The flow | Exercise the changed journey end to end with real-looking data, including long text |
| Design | Compare screenshots with `DESIGN.md`, the frontend-design craft-floor Refuse list and any `docs/design/references/` screens |

Reset the viewport with `resize_window` preset `desktop` when done.

## 3. Fix, then confirm once

Fix everything the pass found in one batch, then run one confirming pass over the failed checks. Stop there: open-ended screenshot loops cost more than they find. If something still fails, report it rather than looping.

## No browser tools

In an environment without them (for example Codex), take screenshots at the three widths with the project's Playwright and check console errors in its output. If that isn't possible either, say verification was skipped. Never report a pass you didn't observe.

## Report

A short table: check, pass or fail, and the evidence (screenshot, console line, element). List anything not checked and why.

Playwright end-to-end tests in CI remain the regression gate. This skill is the human-eye check before a change is called done.
