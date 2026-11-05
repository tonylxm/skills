# Testing levels

Integration-heavy, a few unit tests for pure logic, 1-3 Playwright journeys. Nothing else. Stack picks live in [project-starter/tech-stack.md](../project-starter/tech-stack.md); this page says what to write at each level.

## Which level

| Level | Use for | Effort | Example |
|---|---|---|---|
| Unit | Pure logic with real branching: pricing, date rules, validation, parsing | ~20% | `calculateQuote()` returns 15 for these items |
| Integration | Anything touching the DB, auth, RLS, webhooks, API routes. Real Postgres, mock only Stripe/Resend | ~60% | POST `/api/orders` as user A, user B can't read it |
| Component (RTL) | Only components with real logic (validation, conditional states) | ~10% | Form shows an error on invalid email |
| E2E (Playwright) | The 1-3 journeys that cost the client money if broken | ~10% | Contact form to confirmation. Sign in, pay, see receipt |

Integration is the layer that earns its keep: it catches the bugs that actually ship (bad query, missing RLS policy, broken webhook) and survives refactors.

## By project

| Project | Do | Skip |
|---|---|---|
| Marketing site (Astro) | Build passes, phone-width smoke, contact form journey, seo launch checks | Unit and component tests |
| App with auth/DB | Integration on auth, RLS, business rules. 1-3 journeys | Testing every component |
| Payments | Webhook signature and idempotency (a replayed event doesn't fulfill twice), Stripe test mode, one checkout journey | Mocking your own payment code |

Short job (under a week): build, smoke, contact form journey only. Anything with a security boundary (RLS, roles) always gets integration tests, whatever the budget.

## Rules

- Agree the seams before writing any test (see [SKILL.md](SKILL.md)).
- Every bug fix starts with a failing regression test.
- Test what must not break: business rules, authorization, money. Not layout, copy or glue.
- No coverage targets, no snapshot tests. [frontend-verify](../frontend-verify/SKILL.md) covers how it looks.

## Playwright conventions

- Locators by role, label or text first. Test ids only when nothing accessible fits. No CSS or XPath selectors.
- Run against the built app (`build` + `start`), not the dev server, so CI matches production.
- Sign in once in a setup project and reuse `storageState`. Seed data through the DB or API, not through the UI.
- CI: one retry, `trace: 'on-first-retry'`, upload the report on failure. A flaky test is fixed or deleted, never retried more.
- A fourth journey needs a past bug in that area as its reason.
