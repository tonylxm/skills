# Roadmap

_Current: Phase 0 (walking skeleton). Work it with `/roadmap-next`. Format: see the roadmap-next skill._

## Phase 0: Walking skeleton
Goal: an empty app that builds, tests, lints and deploys through CI.
- [ ] Scaffold the {framework} app: `{scaffold command from tech-stack.md}`
  - AC: `{dev}` serves a page or endpoint locally
- [ ] Add lint, format and typecheck
  - AC: `{lint}` passes, and runs in CI
- [ ] Add the test runner with one smoke test
  - AC: `{test}` passes locally and in CI
- [ ] Add CI on PRs: lint, typecheck, test and build
  - AC: a PR shows green checks
- [ ] Add `.env.example` and config loading
  - AC: the app fails fast with a clear message when a required var is missing
- [ ] Deploy "hello world" to {host}
  - AC: a public URL responds, and deploys come from the main branch

## Phase 1: {first vertical slice}
Goal: {user-visible outcome}. PRD: F1, F2

## Phase 2: {name}
Goal: {outcome}. PRD: F3
