# Preferred Tech Stack

Defaults for step 3 and the Phase 0 scaffold, tuned for freelance work: pick a base stack from the project, then add only what it needs. Deviate when the project requires it, and say why. In an existing repo, its manifests win.

## Principles
- Use the simplest stack that fits. Most freelance jobs are public websites with no database or backend.
- One repo per project. Split the backend into its own repo only when the API serves several products (web plus mobile), different teams own each side, the backend has its own release cycle or security boundary, or the API is sold to customers.
- Keep Postgres portable: app-owned migrations and server-side data access for business logic. No generic database adapter without a real need.
- The client owns production accounts and billing. Free plans are for experiments and demos.

## Pick a base stack
| Project | Stack | Backend logic | Template |
|---|---|---|---|
| Mostly content (business site, portfolio, services, blog), a few interactive widgets | Astro + Tailwind, React islands for widgets | Astro actions (contact form + Resend) | astro-site-starter (planned) |
| Public site with many connected interactive features, or public site + logged-in app | Next.js + Supabase (no Supabase if there's no data) | Next.js route handlers and server actions | nextjs-supabase-starter |
| Private or SEO-unimportant interactive app (dashboard, client portal, internal tool) | Vite + React + Supabase | Hono in `api/`, when needed | vite-supabase-starter (planned) |
| App that owns all data and auth (custom API, several clients) | Next.js + Neon + Drizzle + Better Auth | Next.js route handlers | nextjs-neon-starter |

**Shared defaults**
- **Astro:** `.astro` components + Tailwind, zero JS by default. Add `@astrojs/react` only for an interactive island (calculator, booking widget), which also lets you reuse shadcn/ui pieces. If islands need to share state or cover most of the page, use Next.js instead.
- **React apps:** TypeScript, Tailwind, shadcn/ui + Lucide, Zod, React Hook Form for complex forms, TanStack Query when caching, refetching or mutations help. `useState`/`useReducer` for local state, URL params for shareable filters.
- **Everywhere:** responsive from ~360px phone width up, unless the project says desktop only. Vercel hosting. Stripe for payments, Resend for email. Files in Supabase Storage, or Cloudflare R2 on Neon.
- **Backend logic** means Stripe webhooks, private API keys, transactional email, scheduled jobs (Vercel Cron), integrations or real business logic. Next.js apps use Next.js for it, never Hono inside Next.js. Vite apps add Hono in `api/` (Vercel Functions; run locally with `vercel dev`).
- **FastAPI** only where Python genuinely helps (AI/ML, data processing), as Vercel Python Functions in the same repo unless the work is long-running.

## Data and auth
- **Supabase:** RLS on for every table reachable from the client, with policies covered by tests. Server code using the service-role key bypasses RLS, so it checks authorization itself. Next.js uses `@supabase/ssr` (cookie sessions); Hono verifies the Supabase JWT.
- **Neon:** Drizzle on `node-postgres` (`pg`) with Neon's pooled connection string, so tests run on plain Postgres. Change `sslmode=require` to `sslmode=verify-full`, or `pg` prints a deprecation warning. Auth is Better Auth with the Drizzle adapter (`better-auth`, `@better-auth/drizzle-adapter`), its tables in the app's own schema. Not Neon Auth (beta SDK, no MFA). Email verification and password reset need Resend.
- **Keys:** only publishable keys go in `VITE_`/`NEXT_PUBLIC_` vars. Service-role, Stripe and Resend keys stay server-side.
- Never store passwords yourself. Authorize on the server for every request and deny by default; hiding UI is not authorization.
- Portability is partial on Supabase: schema and migrations move to any Postgres, but `supabase-js` calls and Supabase Auth don't. Choose Neon at the start if the app must own its data access and auth.

## Migrations
Schema changes go only through committed migrations, never by hand on a shared database.

| Stack | Create | Apply in deploy |
|---|---|---|
| Supabase | `pnpm supabase migration new <name>`, SQL in `supabase/migrations/`. Replay locally with `pnpm supabase db reset` | `pnpm supabase db push --db-url "$DATABASE_URL"` as an explicit step before the app deploys |
| Neon (Drizzle) | Edit `src/db/schema.ts`, then `pnpm db:generate --name=<name>`. SQL lands in `drizzle/`. Never `drizzle-kit push` on a shared database | `pnpm db:migrate` with the target `DATABASE_URL`, before the app deploys |

Breaking changes use expand and contract: add the new column, backfill, switch the code, drop the old one in a later deploy.

## Ownership and handover
- The client creates and pays for the domain, GitHub org or repo, Vercel (Pro: Hobby is non-commercial), Supabase or Neon, Stripe, Resend and R2. You join as a member. Secrets live in their accounts.
- Pick the database region for the client's users and privacy law.
- Handover: repo transferred to the client, Resend domain DNS (SPF, DKIM) set, backups on (a paid database plan), and agreed in writing who handles dependency updates afterwards. Public sites also follow the seo skill's handover.

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

**Testing** (test-first with the tdd skill)
| Stack | Tests |
|---|---|
| Astro site | Build, a phone-width Playwright smoke test, and the seo skill's launch checks |
| React apps | Vitest + React Testing Library, integration tests against real Postgres (`supabase start` or Testcontainers, never SQLite), 1–3 critical journeys in Playwright |
| FastAPI | pytest + `TestClient`, Ruff |

Must cover business rules, authorization (RLS policies included) and money paths. Mock only at system boundaries (Stripe, Resend). Skip coverage targets and snapshot-heavy tests.

## CI/CD
Step 2's "solo or team" answer sets the workflow mode. Record it in the PRD and `AGENTS.md`.

| | Solo (default) | Team |
|---|---|---|
| Commits | Straight to `main`; agent runs and `(parallel)` tasks use a branch and PR | Branch and PR only, squash merge |
| Pre-commit | Husky + lint-staged | None, CI is the gate |
| CI | Runs on every push and PR, reports | Runs on PRs, blocks the merge |
| Deploy | Production on push to `main` | Preview per PR, production on merge |

- **CI:** copy [templates/ci.yml](templates/ci.yml): frozen install, lint and format checks, tests, build. Add a Postgres service once integration tests exist.
- **Deploy:** Vercel's Git integration, no workflow file. Migrations run as an explicit step before deploy. Roll back a bad deploy in Vercel.
- **Dependencies and secrets:** Dependabot weekly, minor and patch grouped ([templates/dependabot.yml](templates/dependabot.yml)), alerts on. Public repos or orgs with GitHub Secret Protection: turn on secret scanning and push protection. Private personal repos: the `secrets` job in `ci.yml` runs gitleaks (orgs need a free `GITLEAKS_LICENSE`), and Solo's `.husky/pre-commit` starts with:
  ```sh
  command -v gitleaks >/dev/null || { echo "gitleaks not found: brew install gitleaks"; exit 1; }
  gitleaks git --pre-commit --staged --redact --no-banner
  ```
- **Git:** Conventional Commits, small and green. Branches `feat|fix|chore/<slug>`, one ROADMAP task each. Solo → Team once there are real users or a second contributor: turn on branch protection requiring CI and update the `AGENTS.md` Workflow line (roadmap-next reads it).
- **Deferred to the roadmap's Later section:** CodeQL, a staging environment, release automation, E2E beyond the smoke run.

## Templates
A template ships the Lint & format, Testing, Solo hook, `.env.example` with fail-fast validation, CI and Dependabot defaults on this page, green in CI, with auth deny-by-default where the stack has auth.

| Stack | Template |
|---|---|
| Astro site | tonylxm/astro-site-starter (planned: scaffold until it exists) |
| Next.js + Supabase | [tonylxm/nextjs-supabase-starter](https://github.com/tonylxm/nextjs-supabase-starter) |
| Vite + React + Supabase | tonylxm/vite-supabase-starter (planned: start from [tonylxm/vite-react-starter](https://github.com/tonylxm/vite-react-starter) and add Supabase) |
| Next.js + Neon | [tonylxm/nextjs-neon-starter](https://github.com/tonylxm/nextjs-neon-starter) |

```bash
gh repo create <app> --template tonylxm/<template> --private --clone
```

Then follow the template's README checklist. If the folder already has the project docs, clone into `<app>` and copy it up as described below. Keep templates current: [templates/ci.yml](templates/ci.yml), [templates/dependabot.yml](templates/dependabot.yml) and this page are the source. Merge template Dependabot PRs when CI is green.

## Scaffolding (when no template fits)
Use the official scaffolder with flags so it doesn't prompt. CLIs change their flags; if one is rejected, check `--help`.

| Stack | Scaffold | Then |
|---|---|---|
| Astro | `pnpm create astro@latest <app> --template minimal --yes` | `pnpm astro add tailwind vercel` (Vercel adapter for actions), `pnpm astro add react` only for islands |
| Next.js | `pnpm create next-app@latest <app> --ts --eslint --tailwind --src-dir --app --import-alias "@/*" --use-pnpm --yes` | `pnpm dlx shadcn@latest init -d`. Check `globals.css` sets `--font-sans: var(--font-geist-sans)`. Delete the generated `CLAUDE.md`. Make `typecheck` `next typegen && tsc --noEmit` |
| Vite + React | `pnpm create vite@latest <app> --template react-ts --no-interactive` | `pnpm add tailwindcss @tailwindcss/vite`, add `tailwindcss()` to `vite.config.ts` and `@import "tailwindcss";` to `src/index.css`. Add the `@/*` alias to both tsconfigs and `vite.config.ts`, then `pnpm dlx shadcn@latest init -d -t vite`. `typecheck` is `tsc -b` |
| Hono in `api/` | `pnpm add hono` | Follow Hono's Vercel guide for the entry file; `vercel dev` runs the SPA and API together |
| Supabase | `pnpm add -D supabase --allow-build=supabase` · `pnpm supabase init` | `pnpm add @supabase/supabase-js` (plus `@supabase/ssr` on Next.js). `pnpm supabase start` for local Postgres, Auth and Storage |
| Neon | `pnpm add drizzle-orm pg better-auth @better-auth/drizzle-adapter` · `pnpm add -D drizzle-kit @types/pg` | `db:generate` and `db:migrate` scripts, `drizzle.config.ts`. Auth schema: `pnpm dlx auth@latest generate --config src/lib/auth.ts --output src/db/auth-schema.ts`. Local Postgres via Docker Compose or Testcontainers |
| FastAPI | `uv init <app>` · `uv add "fastapi[standard]"` | `uv add --dev pytest ruff` |
| JS lint/format | `pnpm add -D prettier eslint-config-prettier prettier-plugin-tailwindcss` | Add `eslint-config-prettier` last in `eslint.config.mjs`, then the scripts above |
| Git hooks (Solo) | `pnpm add -D husky lint-staged` · `pnpm exec husky init` | `.husky/pre-commit` is `pnpm exec lint-staged`, plus the `lint-staged` config above |
| JS testing | `pnpm add -D vitest` · `pnpm create playwright@latest` | Components: `pnpm add -D @testing-library/react @testing-library/dom jsdom` |

**Scaffolding into a folder that already has docs:** scaffolders refuse non-empty folders. Generate into a subfolder, copy it up without overwriting, delete the subfolder:

```bash
<scaffold command with <app> as the directory>
rsync -a --ignore-existing --exclude CLAUDE.md <app>/ ./ && rm -rf <app>
```

Your docs win. `create-next-app` writes a `<!-- BEGIN:nextjs-agent-rules -->` block into `AGENTS.md`; keep it (see agents-md).

## Avoid by default
- Next.js for a plain content site; a database or backend for a brochure site.
- Hono inside Next.js; Neon while Supabase covers the need; separate frontend and backend repos without a split reason above.
- ASP.NET Core, microservices, Kubernetes, Kafka, Redis, until there is a concrete need.
- Generic repositories, generic services, database adapters, CQRS or MediatR-style layers.
- Neon Auth, free plans in production, and production accounts billed to you instead of the client.
