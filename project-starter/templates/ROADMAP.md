# Roadmap

_Current: Phase 0 (walking skeleton). Work it with `/roadmap-next`. Format: roadmap-next._

## Phase 0: Walking skeleton
Goal: an empty app that builds, tests, lints and deploys through CI.
- [ ] 0.1 Create the app from {template or scaffold command from tech-stack.md}
  - AC: `{dev}` serves locally (UI: no horizontal scroll at phone width), and `{lint}`, `{format:check}`, `{typecheck}` and `{test}` pass
- [ ] 0.2 Apply the workflow mode and CI (tech-stack.md → CI/CD)
  - AC: a push shows green checks. Solo: committing a badly formatted file auto-fixes it. Team: `main` requires the checks
- [ ] 0.3 Turn on secret scanning and Dependabot (tech-stack.md → CI/CD)
  - AC: a commit or push containing a fake secret is blocked
- [ ] 0.4 Provision {data store and auth from ARCHITECTURE.md} and set real env values locally and on {host}
  - AC: the app connects, and fails fast with a clear message when a required var is missing
- [ ] 0.5 Deploy "hello world" to {host}
  - AC: a public URL responds, production deploys from `main`, and PRs get previews

## Phase 1: {first vertical slice}
Goal: {user-visible outcome}. PRD: F1, F2

## Later
- {deferred idea or follow-up}: {why, who asked}
