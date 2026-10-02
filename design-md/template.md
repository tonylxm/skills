# Design: {product}

_Summary: {one sentence: the feel, who it is for, and what it is not}_

## Personality
- Feels: {adj}, {adj}, {adj}. Never: {anti-adj}.
- References: {product} for {what}, {product} for {what}.

## Tokens
```yaml
color:
  light: { primary: "#", accent: "#", bg: "#", surface: "#", text: "#", muted: "#", border: "#", success: "#", warning: "#", danger: "#" }
  dark:  { primary: "#", accent: "#", bg: "#", surface: "#", text: "#", muted: "#", border: "#", success: "#", warning: "#", danger: "#" }
font: { display: "", body: "", mono: "" }
type_scale: [12, 14, 16, 20, 24, 32, 48]   # px
space: [4, 8, 12, 16, 24, 32, 48, 64]       # px
radius: { sm: 4, md: 8, lg: 16, full: 9999 }
shadow: { sm: "", md: "" }
motion: { fast: 120ms, base: 200ms, easing: "cubic-bezier(.2,.8,.2,1)" }
```

## Rules
- **Colour:** {primary is used only for ___; accent for ___}. Text roles pass WCAG AA in both modes.
- **Type:** {display font for ___ only; body weights 400/600}.
- **Layout:** {density, grid, max width}.
- **Depth:** {flat / soft shadows / borders}.

## Logo
- {concept} · {wordmark | symbol | combo} · {colour usage} · min {px}

## Components
| Component | Rules |
|---|---|
| Button | {variants, radius, states} |
| Input | |
| Card | |
| Nav | |
| Feedback | {toast, empty, error} |

## Accessibility and motion
- Focus: {style}. Touch targets ≥ 44px. Respect `prefers-reduced-motion`.
