# E2E conventions (Playwright)

Deterministic tests for the project's 1-3 critical journeys. Which journeys qualify: [SKILL.md](SKILL.md). Test levels: [tdd/testing.md](../tdd/testing.md).

- Locators by role, label or text first. Test ids only when nothing accessible fits. No CSS or XPath selectors.
- Run against the built app (`build` + `start`), not the dev server, so CI matches production.
- Serve E2E on its own port (default 3100, DB 5433), not the dev port, with `reuseExistingServer: false` so it can't pick up `pnpm dev`. Read the ports from `E2E_PORT` and `DB_PORT` so parallel worktrees can each set their own.
- Sign in once in a setup project and reuse `storageState`. Seed data through the DB or API, not through the UI.
- CI: one retry, `trace: 'on-first-retry'`, upload the report on failure. A flaky test is fixed or deleted, never retried more.
- A fourth journey needs a past bug in that area as its reason.
- Assert user-visible outcomes (text, URL, a record visible after reload), never CSS classes, DOM structure or internal calls.
