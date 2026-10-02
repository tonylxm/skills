# Roadmap

_Current: Phase 0 (walking skeleton). Work it with `/roadmap-next`. Format: see the roadmap-next skill._

## Phase 0: Walking skeleton
Goal: an empty app that builds, tests, lints and deploys through CI.

<!-- Use ONE variant. Template: the stack matches tech-stack.md → Templates. Scaffold: anything else. Delete the other. -->

### Template variant
- [ ] Create the repo from the template: `gh repo create {app} --template tonylxm/{template} --private --clone`, then rename per its README
  - AC: `{dev}` serves the page locally without horizontal scroll at phone width, and `{lint}`, `{format:check}`, `{typecheck}` and `{test}` pass
- [ ] Apply the workflow mode. Solo: keep the hook. Team: remove it per the README and make `main` require CI
  - AC: the first push shows green checks. Solo: committing a badly formatted file auto-fixes it. Team: `main` requires the checks
- [ ] Turn on secret scanning and push protection (templates don't copy repo settings)
  - AC: a test push containing a fake secret is blocked
- [ ] Set real env values from `.env.example` locally and on {host}
  - AC: the app fails fast with a clear message when a required var is missing
- [ ] Deploy "hello world" to {host}
  - AC: a public URL responds, production deploys from `main`, and PRs get preview URLs

### Scaffold variant
- [ ] Scaffold the {framework} app: `{scaffold command from tech-stack.md}`
  - AC: `{dev}` serves a page or endpoint locally (UI projects: the page renders without horizontal scroll at phone width)
- [ ] Add lint, format and typecheck (see Lint & format in tech-stack.md). Solo: also add Husky + lint-staged
  - AC: `{lint}`, `{format:check}` and `{typecheck}` pass, and run in CI. Solo: committing a badly formatted file auto-fixes it
- [ ] Add the test runner with one smoke test
  - AC: `{test}` passes locally and in CI
- [ ] Add CI from `templates/ci.yml` in project-starter: lint, format, typecheck, test and build
  - AC: a push shows green checks. Team: `main` requires them
- [ ] Enable Dependabot (`templates/dependabot.yml`), secret scanning and push protection
  - AC: `.github/dependabot.yml` is committed, and a test push containing a fake secret is blocked
- [ ] Add `.env.example` and config loading
  - AC: the app fails fast with a clear message when a required var is missing
- [ ] Deploy "hello world" to {host}
  - AC: a public URL responds, production deploys from `main`, and PRs get preview URLs

## Phase 1: {first vertical slice}
Goal: {user-visible outcome}. PRD: F1, F2

## Phase 2: {name}
Goal: {outcome}. PRD: F3
