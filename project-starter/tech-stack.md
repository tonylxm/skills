# Preferred Tech Stack

Defaults for step 3 and the Phase 0 scaffold, tuned for freelance work: pick a base stack from the project, then add only what it needs. Deviate when the project requires it, and say why. In an existing repo, its manifests win.

## Principles
- Use the simplest stack that fits. Most freelance jobs are public websites with no database or backend.
- One repo per project. Split the backend into its own repo only when the API serves several products (web plus mobile), different teams own each side, the backend has its own release cycle or security boundary, or the API is sold to customers.
- Keep Postgres portable: app-owned migrations and server-side data access for business logic. No generic database adapter without a real need.
- Accounts, billing, handover and contracts: [clients.md](clients.md). Plans and running costs: [Running costs](#running-costs).

## Pick a base stack
| Project | Stack | Backend logic | Template |
|---|---|---|---|
| Mostly content (business site, portfolio, services, blog), a few interactive widgets | Astro + Tailwind, React islands for widgets | Astro actions (contact form + Resend) | astro-site-starter |
| Any app: public site with connected interactive features, logged-in app, dashboard, client portal, internal tool | Next.js + Neon + Drizzle + Better Auth (no database if there's no data) | Next.js route handlers and server actions | nextjs-neon-starter |

**Shared defaults**
- **Astro:** `.astro` components + Tailwind, zero JS by default. Add `@astrojs/react` only for an interactive island (calculator, booking widget), which also lets you reuse shadcn/ui pieces. If islands need to share state or cover most of the page, use Next.js instead.
- **React apps:** TypeScript, Tailwind, shadcn/ui + Lucide, Zod, React Hook Form for complex forms, TanStack Query when caching, refetching or mutations help. `useState`/`useReducer` for local state, URL params for shareable filters.
- **Everywhere:** responsive from ~360px phone width up, unless the project says desktop only. Cloudflare Workers hosting (the Astro adapter, or OpenNext for Next.js) on your Workers Paid account. Stripe for payments, Resend for email, files in Cloudflare R2.
- **Backend logic** means Stripe webhooks, private API keys, transactional email, scheduled jobs (Cloudflare Cron Triggers), integrations or real business logic. Next.js apps use Next.js for it, never Hono inside Next.js.
- **FastAPI** only where Python genuinely helps (AI/ML, data processing). Workers don't run it, so pick its host per project.

## Running costs
USD, checked 2026-11 from pricing pages and summaries; recheck before quoting. Who owns and pays each account: [clients.md](clients.md#accounts).

| Service | Use | Free tier | Production |
|---|---|---|---|
| Cloudflare Workers | Hosting, cron | 100k requests/day per account, 10 ms CPU per request (too little for Next.js server rendering) | Paid: $5/month per account with 10M requests, then $0.30 per million, 30 s CPU per request by default. One account covers every client you host |
| Neon | Postgres | 1 GB per branch, 100 CU-hours/month, 6 h restore window. Suspends after 5 min idle (can't be turned off); the next query waits a few hundred ms while it wakes | Launch: $0.106 per CU-hour, $0.35 per GB-month. Always on at 0.25 CU is about $19/month in compute. Neon's plans page lists a $5/month minimum; other sources say none |
| Resend | Email | 3,000/month, 100/day | Pro: $20/month for 50k |
| Cloudflare R2 | Files | 10 GB, 1M Class A and 10M Class B operations/month | $0.015 per GB-month, no egress fees |
| Stripe | Payments | No monthly fee | Transaction fees only |
| Domain | | | About $11/year for `.com`. Registrar choice: [clients.md](clients.md#accounts) |

Static assets (prerendered Astro pages, JS, CSS, images) are served without running the Worker and don't count as requests. A request is one run of server code: a server-rendered page, a server action, an API call or a webhook.

**Upgrade when**
- **Workers Paid:** every Next.js app from its first day in production, since its pages can fail on Free's 10 ms CPU limit. An Astro site on the client's own account can stay on Free: its prerendered pages are static assets and only the contact form runs the Worker. Move it to Paid when the Worker's errors show `exceededCpu` (Error 1102), when regular days pass about 50k requests (on Free, requests past the daily cap fail until midnight UTC), or when it gains a shop, login or other server-rendered pages.
- **Neon Launch:** losing up to a day of data is unacceptable (Free's nightly backup plus a 6-hour restore window can lose writes made between them; Launch restores to any point in 7 days), it nears 100 CU-hours or 1 GB, or the client won't accept cold starts (staff use it all day, or they notice the first slow request). Then turn scale-to-zero off (about $19/month at 0.25 CU), billed to the client.
- **Resend Pro:** over 3,000 emails a month or 100 a day.
- **Checking:** the thresholds above are buffers below each limit. Check each dashboard monthly and after a launch or campaign: Workers (Metrics → Errors, Requests), Neon (Usage, act at about 70 CU-hours), Resend (Usage), R2 (Overview).
- **Supabase Pro ($25/month):** the app needs realtime or a full backend-as-a-service. No template; scaffold it.

## Prototypes
A prototype gets client sign-off on flows and look during requirements. It is throwaway, and the quote says so.

- **Stack:** the intended project's UI framework (Astro for content sites, otherwise React + Tailwind + shadcn/ui), or Vite + React if that isn't decided yet. Use the plain scaffolder from [Scaffolding](#scaffolding-when-no-template-fits), not a template.
- **Data:** frontend only. Typed mock fixtures shaped like the domain, `localStorage` when a flow needs to persist, and a role switcher instead of a real login.
- **Skip:** database, real auth, tests, CI, Husky, Dependabot and SEO.
- **Accounts:** your Cloudflare account (`wrangler deploy`, shared by its `*.workers.dev` URL). Never real client or personal data.
- **After approval:** create a new repo from the matching template rather than building on the prototype. Copy presentational components, layouts and design tokens (or `DESIGN.md`), turn screens and flows into the PRD and roadmap, and discard the mock data and state wiring.

## Data and auth
- **Neon:** Drizzle on `node-postgres` (`pg`), so tests run on plain Postgres. Deployed Workers connect through Cloudflare Hyperdrive (Neon's direct connection string, caching off), which pools connections near Neon; it's included in every Workers plan, with a limit of 25 configs per Paid account. Change `sslmode=require` to `sslmode=verify-full`, or `pg` prints a deprecation warning. Auth is Better Auth with the Drizzle adapter (`better-auth`, `@better-auth/drizzle-adapter`), its tables in the app's own schema. Not Neon Auth (beta SDK, no MFA). Email verification and password reset need Resend. On Workers, build the database client and auth instance per request and never hold one at module level (see nextjs-neon-starter's `src/db/index.ts`).
- **Neon cold starts (Free):** keep public pages free of database queries (static or cached), so only signed-in users ever wake a suspended database, and show a loading state on database-backed pages and forms. Put the Neon region near the client's users. Never keep a Free database awake with a scheduled ping: 0.25 CU around the clock is about 182 CU-hours a month, and past 100 Neon stops the database until the next month. If cold starts matter, move to Launch (see [Running costs](#running-costs)).
- **Authorization:** the browser never queries the database. Server code checks the session on every request and filters by user, deny by default. Multi-tenant or sensitive data adds Postgres RLS as a second net: policies in the Drizzle schema (`pgPolicy`), the app connecting as a non-owner role, and the user set with `set_config('app.user_id', ..., true)` inside each request's transaction. Not the Neon Data API (browser-direct, custom auth providers still in beta).
- **Keys:** only public values go in `NEXT_PUBLIC_`/`PUBLIC_` vars. Database, auth, Stripe and Resend secrets stay server-side (`wrangler secret put`).
- Never store passwords yourself. Authorize on the server for every request and deny by default; hiding UI is not authorization.
- Pick the database region for the client's users and privacy law.

## Migrations
Schema changes go only through committed migrations, never by hand on a shared database.

| Stack | Create | Apply in deploy |
|---|---|---|
| Neon (Drizzle) | Edit `src/db/schema.ts`, then `pnpm db:generate --name=<name>`. SQL lands in `drizzle/`. Never `drizzle-kit push` on a shared database | `pnpm db:migrate` with the target `DATABASE_URL`, before the app deploys |

Breaking changes use expand and contract: add the new column, backfill, switch the code, drop the old one in a later deploy.

## Backups
Every app whose Neon database holds real data gets a nightly copy outside Neon. Neon's own recovery lives in the same account, so it's lost with the account or project.

| Plan | Neon gives you | You add |
|---|---|---|
| Free | Restore to any point in the last 6 hours, 1 manual snapshot | Nightly backup workflow. Take the manual snapshot before a risky migration, then delete it |
| Launch | Restore window up to 7 days (set it to 7), scheduled daily snapshots kept up to 35 days ($0.09 per GB-month) | Daily snapshot schedule kept 7 to 14 days, plus the nightly backup workflow |

**Set up** [templates/backup.yml](templates/backup.yml) (copy to `.github/workflows/backup.yml`):
1. In the client's Cloudflare account, create an R2 bucket and an R2 API token scoped to it (Object Read & Write). Add a lifecycle rule that deletes objects after 30 days.
2. `age-keygen -o <app>-backup.key` on your machine. Store the file in your password manager, never in the repo. The public key it prints goes in the `BACKUP_AGE_RECIPIENT` variable.
3. Add the secrets and variables listed at the top of the workflow. `BACKUP_DATABASE_URL` is Neon's direct (non-pooler) string; set `PG_MAJOR` to the project's Postgres version.
4. Run it once from the Actions tab and check the file lands in the bucket. GitHub emails you when a scheduled run fails.

**Restore** into a new, empty Neon project or branch, check the data, then point the app at it:

```bash
aws s3 cp s3://<bucket>/<file> . --endpoint-url https://<account-id>.r2.cloudflarestorage.com
age --decrypt --identity <app>-backup.key <file> | pg_restore --no-owner --no-acl -d "<new database url>"
```

Test a restore into a throwaway project once a quarter, and before handover.

## Quality baseline
**Package manager:** pnpm, pinned with `"packageManager": "pnpm@<version>"`. In an existing repo, use its lockfile's manager and never mix lockfiles. Allow needed install scripts with `pnpm approve-builds`.

**Lint & format**
- ESLint as the scaffolder sets it up (flat config), plus Prettier with `eslint-config-prettier` last and `prettier-plugin-tailwindcss` (plus `prettier-plugin-astro` on Astro). Vite's scaffolder uses oxlint instead: keep it.
- Scripts: `lint`, `format`, `format:check`, `typecheck` (`tsc --noEmit`, `astro check` on Astro). CI runs `lint`, `format:check` and `typecheck`.
- Deprecated APIs fail the build: ESLint `"@typescript-eslint/no-deprecated": "error"` (needs `parserOptions.projectService: true`), or oxlint `"typescript/no-deprecated": "error"` with `"typeAware": true`. Python: Ruff's `UP` rules and `filterwarnings = ["error::DeprecationWarning"]`.
- `.editorconfig` at the root. Solo mode adds Husky + lint-staged, auto-fixing staged files only (never tests or typecheck):
  ```json
  "lint-staged": {
    "*.{ts,tsx,js,jsx,mjs,astro}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css,yml}": "prettier --write"
  }
  ```
  On oxlint projects (Vite) replace `eslint --fix` with `oxlint --fix`.

**Testing** (test-first with the tdd skill)
| Stack | Tests |
|---|---|
| Astro site | Build, a phone-width Playwright smoke test, and the seo skill's launch checks |
| React apps | Vitest + React Testing Library, integration tests against real Postgres (Docker Compose or Testcontainers, never SQLite), 1–3 critical journeys in Playwright |
| FastAPI | pytest + `TestClient`, Ruff |

Levels, journeys and Playwright conventions: [tdd/testing.md](../tdd/testing.md). Must cover business rules, authorization (RLS policies too, where used) and money paths. Mock only at system boundaries (Stripe, Resend). Skip coverage targets and snapshot-heavy tests.

## CI/CD
Step 2's "solo or team" answer sets the workflow mode. Record it in the PRD and `AGENTS.md`.

| | Solo (default) | Team |
|---|---|---|
| Commits | Straight to `main`; gnhf runs use a branch and PR | Branch and PR only, squash merge |
| Pre-commit | Husky + lint-staged | None, CI is the gate |
| CI | Runs on every push and PR, reports | Runs on PRs, blocks the merge |
| Deploy | Production on push to `main` | Preview per PR, production on merge |

- **CI:** copy [templates/ci.yml](templates/ci.yml): frozen install, lint and format checks, tests, build. Add a Postgres service once integration tests exist.
- **Deploy:** `pnpm run deploy` (wrangler) from your machine, or Workers Builds (Cloudflare's Git integration, previews for other branches) with the same command, no workflow file. Migrations run as an explicit step before deploy. Roll back with `wrangler rollback`.
- **Dependencies and secrets:** Dependabot weekly, minor and patch grouped ([templates/dependabot.yml](templates/dependabot.yml)), alerts on. Public repos or orgs with GitHub Secret Protection: turn on secret scanning and push protection. Private personal repos: the `secrets` job in `ci.yml` runs gitleaks (orgs need a free `GITLEAKS_LICENSE`), and Solo's `.husky/pre-commit` starts with:
  ```sh
  command -v gitleaks >/dev/null || { echo "gitleaks not found: brew install gitleaks"; exit 1; }
  gitleaks git --pre-commit --staged --redact --no-banner
  ```
- **Git:** Conventional Commits, small and green. Branches `feat|fix|chore/<slug>`, one ROADMAP task each. Solo → Team once there are real users or a second contributor: turn on branch protection requiring CI and update the `AGENTS.md` Workflow line (roadmap-next reads it).
- **Deferred to the roadmap's Later section:** CodeQL, a staging environment, release automation, E2E beyond the 1-3 journeys.

## Templates
A template ships the Lint & format, Testing, Solo hook, `.env.example` with fail-fast validation, CI and Dependabot defaults on this page, green in CI, with auth deny-by-default where the stack has auth.

| Stack | Template |
|---|---|
| Astro site | [tonylxm/astro-site-starter](https://github.com/tonylxm/astro-site-starter) |
| Next.js + Neon | [tonylxm/nextjs-neon-starter](https://github.com/tonylxm/nextjs-neon-starter) |

```bash
gh repo create <app> --template tonylxm/<template> --private --clone
```

Then follow the template's README checklist. If the folder already has the project docs, clone into `<app>` and copy it up as described below. Keep templates current: [templates/ci.yml](templates/ci.yml), [templates/dependabot.yml](templates/dependabot.yml), [templates/backup.yml](templates/backup.yml) and this page are the source. Merge template Dependabot PRs when CI is green.

## Scaffolding (when no template fits)
Use the official scaffolder with flags so it doesn't prompt. CLIs change their flags; if one is rejected, check `--help`.

| Stack | Scaffold | Then |
|---|---|---|
| Astro | `pnpm create astro@latest <app> --template minimal --yes` | `pnpm astro add tailwind cloudflare`, then copy the adapter options from astro-site-starter: `imageService: "compile"` and `prerenderEnvironment: "node"` (so the build reads env from `process.env`), plus `session: false` unless the site needs sessions. `pnpm astro add react` only for islands |
| Next.js | `pnpm create next-app@latest <app> --ts --eslint --tailwind --src-dir --app --import-alias "@/*" --use-pnpm --yes` | `pnpm dlx shadcn@latest init -d`. Check `globals.css` sets `--font-sans: var(--font-geist-sans)`. Delete the generated `CLAUDE.md`. Make `typecheck` `next typegen && tsc --noEmit`. For Workers: `pnpm add @opennextjs/cloudflare` and `pnpm add -D wrangler`, then copy `wrangler.jsonc`, `open-next.config.ts` and the `preview`/`deploy` scripts from nextjs-neon-starter |
| Vite + React | `pnpm create vite@latest <app> --template react-ts --no-interactive` | `pnpm add tailwindcss @tailwindcss/vite`, add `tailwindcss()` to `vite.config.ts` and `@import "tailwindcss";` to `src/index.css`. Add the `@/*` alias to both tsconfigs and `vite.config.ts`, then `pnpm dlx shadcn@latest init -d -t vite`. `typecheck` is `tsc -b` |
| Neon | `pnpm add drizzle-orm pg better-auth @better-auth/drizzle-adapter` · `pnpm add -D drizzle-kit @types/pg` | `db:generate` and `db:migrate` scripts, `drizzle.config.ts`. Auth schema: `pnpm dlx auth@latest generate --config src/lib/auth.cli.ts --output src/db/auth-schema.ts` (the CLI needs an exported `auth`, the app uses `getAuth()`). Local Postgres via Docker Compose or Testcontainers |
| FastAPI | `uv init <app>` · `uv add "fastapi[standard]"` | `uv add --dev pytest ruff` |
| JS lint/format | `pnpm add -D prettier eslint-config-prettier prettier-plugin-tailwindcss` | Add `eslint-config-prettier` last in `eslint.config.mjs`, then the scripts above. Run `pnpm format` once and add `pnpm-lock.yaml` to `.prettierignore`, or `format:check` fails on the scaffold's own files |
| Git hooks (Solo) | `pnpm add -D husky lint-staged` · `pnpm exec husky init` | `.husky/pre-commit` is `pnpm exec lint-staged`, plus the `lint-staged` config above |
| JS testing | `pnpm add -D vitest` · `pnpm create playwright@latest` | `test` is `vitest run --passWithNoTests` until the first test exists. Components: `pnpm add -D @testing-library/react @testing-library/dom jsdom` |

After `shadcn init`, run `pnpm remove shadcn && pnpm add -D shadcn`. Init puts it in `dependencies`, which ships its CLI deps (`@modelcontextprotocol/sdk` and more) to production, but the app only uses its CSS (`shadcn/tailwind.css`) at build time.

**Scaffolding into a folder that already has docs:** scaffolders refuse non-empty folders. Generate into a subfolder, copy it up without overwriting, delete the subfolder:

```bash
<scaffold command with <app> as the directory>
rsync -a --ignore-existing --exclude CLAUDE.md <app>/ ./ && rm -rf <app>
```

Your docs win. `create-next-app` writes a `<!-- BEGIN:nextjs-agent-rules -->` block into `AGENTS.md`; keep it (see agents-md).

**GitHub repo:** scaffolders don't create one. From the project root, commit (run `git init` first if the scaffolder didn't), then:

```bash
gh repo create <app> --private --source . --push
```

## Avoid by default
- Next.js for a plain content site; a database or backend for a brochure site.
- Hono inside Next.js; separate frontend and backend repos without a split reason above.
- ASP.NET Core, microservices, Kubernetes, Kafka, Redis, until there is a concrete need.
- Generic repositories, generic services, database adapters, CQRS or MediatR-style layers.
- Neon Auth (beta, no MFA); Workers Free for a Next.js app in production.
