# Preferred Tech Stack

Default recommendations for step 4 and the Phase 0 scaffold. Deviate only when the project's constraints require it, and say why. In `--adopt`, the existing manifests win.

## Principles
- Prefer simple, modern, maintainable solutions.
- Start with a modular monolith. Avoid premature microservices and infrastructure.
- Choose technology based on product requirements, not trends.
- Avoid unnecessary abstractions and boilerplate.

## Frontend
**Default:** Next.js + TypeScript
- Next.js App Router
- Tailwind CSS
- shadcn/ui + Lucide
- Zod
- React Hook Form for complex forms
- TanStack Query for client-side server state, when caching, refetching, mutations or pagination are useful
- `useState`/`useReducer` for local state
- URL/search params for shareable navigation and filter state

**Responsive by default:** mobile-first layouts with Tailwind breakpoints, from ~360px phone width up to desktop. Skip only when the project says otherwise (e.g. a desktop-only internal tool), and say so.

**Use Vite + React instead** for simple SPAs and internal tools, where Next.js SSR, routing or full-stack features add little value.

## Backend
Choose based on complexity.

### Next.js full-stack
For small and medium SaaS, CRUD apps, dashboards and straightforward business logic.
- Server Components, Server Actions, Route Handlers
- Zod
- PostgreSQL

### ASP.NET Core + C#
For substantial SaaS, marketplaces, financial systems, complex business logic, public APIs, or multiple clients.
- REST + OpenAPI
- EF Core, with Dapper where direct SQL is useful
- PostgreSQL

### Python + FastAPI
Only where Python gives a genuine advantage, such as AI/ML, data processing, or Python-specific libraries.

## Backend architecture
For complex applications, prefer a **feature-oriented / vertical slice** layout:

```text
Features/
  Projects/
  Quotes/
  Payments/
  Users/
Domain/
Infrastructure/
```

- Keep each feature's endpoint, validation, application logic and data access close together.
- Use the traditional Controller → Service → Repository layout for simple CRUD or conventional applications.
- Don't add these by default: generic repositories, generic services, MediatR, CQRS, factories, microservices. Add an abstraction only when it solves an actual problem.

## Database & infrastructure
- PostgreSQL by default
- Supabase when managed Postgres, Auth or Storage materially helps
- Vercel for Next.js where appropriate
- Docker when useful (see [Containers](#containers))
- GitHub Actions for CI, Vercel's Git integration for deploys (see [CI/CD](#cicd))
- Stripe for payments, Resend for email
- Sentry for error monitoring, PostHog for product analytics
- Managed background jobs where appropriate

Avoid Kubernetes, Kafka, Redis and similar until there is a concrete need.

### Containers
- **Local runtime:** OrbStack on macOS/Apple Silicon. It's light, starts fast, is fully Docker/Compose compatible and runs ARM64 natively. Use Docker Desktop instead when ecosystem compatibility or team standardisation matters.
- **Stay runtime-agnostic:** use standard `Dockerfile`s and `docker compose` only, with nothing OrbStack-specific, so teammates and CI can use Docker Desktop or Linux unchanged.
- **Architecture:** prefer multi-arch images that run natively on ARM64 locally. Pin `platform: linux/amd64` only when an image has no ARM64 build or production needs it.

## Auth
- **Default: Supabase Auth** for every stack. Next.js uses `@supabase/ssr` (cookie sessions). An ASP.NET Core API validates Supabase's JWTs with `AddAuthentication().AddJwtBearer()` and authorises with policies.
- **Use Entra ID or Auth0 instead** when customers need enterprise SSO (SAML/OIDC per tenant). Record it as an ADR.
- Never store passwords yourself. Authorise on the server for every request and deny by default; hiding UI is not authorisation.
- Supabase tables reachable from the client have Row Level Security on, with policies covered by tests.

## Migrations
Schema changes go only through committed migrations, never by hand on a shared database.

| Stack | Create | Apply in deploy |
|---|---|---|
| Supabase | `pnpm supabase migration new <name>`, SQL in `supabase/migrations/`. Replay locally with `pnpm supabase db reset` | `pnpm supabase db push --db-url "$DATABASE_URL"` as an explicit step before the app deploys |
| EF Core | `dotnet ef migrations add <Name>`. Review the SQL with `dotnet ef migrations script --idempotent` | A migration bundle (`dotnet ef migrations bundle`) run as its own step. Never `Database.Migrate()` at startup |

- **Breaking changes use expand and contract:** add the new column or table, backfill, switch the code, then drop the old one in a later deploy. Migrations ship before the code that needs them.
- Integration tests run against the migrated schema, so a broken migration fails CI.

## Package manager
- pnpm for new JS/TS projects. Pin it with a `"packageManager": "pnpm@<version>"` field in `package.json`.
- In an existing repo, use whatever its lockfile says (`package-lock.json` → npm, `yarn.lock` → Yarn). Never mix lockfiles.
- pnpm blocks dependency install scripts by default. If a package needs one (e.g. `supabase`, `esbuild`, `sharp`), allow it explicitly with `pnpm approve-builds` rather than turning the protection off.

## Lint & format
- **JS/TS:** ESLint as the scaffolder sets it up (flat config, `eslint.config.mjs`), plus Prettier. Put `eslint-config-prettier` last in the ESLint config so the two never conflict, and add `prettier-plugin-tailwindcss` for class sorting. Keep `.prettierrc` to just that plugin and accept Prettier's defaults. Add a `.prettierignore`.
- Scripts: `lint`, `format` (`prettier --write .`), `format:check` (`prettier --check .`) and `typecheck` (`tsc --noEmit`). CI runs `lint`, `format:check` and `typecheck`.
- **.NET:** `dotnet new editorconfig`, and `dotnet format --verify-no-changes` in CI.
- **Python:** Ruff for both lint and format. CI runs `ruff check` and `ruff format --check`.
- **Deprecated APIs fail the build**, so agents writing from stale memory get caught by tooling rather than review:
  - ESLint: `"@typescript-eslint/no-deprecated": "error"`. It needs typed linting (`parserOptions.projectService: true`), which makes `lint` noticeably slower.
  - oxlint: `"typescript/no-deprecated": "error"` with `"options": { "typeAware": true }` (oxlint 1.26+).
  - .NET: `<WarningsAsErrors>CS0612;CS0618</WarningsAsErrors>` in `Directory.Build.props`.
  - Python: Ruff's `UP` (pyupgrade) rules, and `filterwarnings = ["error::DeprecationWarning"]` under `[tool.pytest.ini_options]`.
- An `.editorconfig` at the repo root.
- **Git hooks** depend on the workflow mode (see [CI/CD](#cicd)): Solo gets Husky + lint-staged, Team gets none. The hook only auto-fixes staged files. Never put tests or typecheck in it. In `package.json`:
  ```json
  "lint-staged": {
    "*.{ts,tsx,js,jsx,mjs}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css,yml}": "prettier --write"
  }
  ```
  `.husky/pre-commit` contains just `pnpm exec lint-staged`.

## Testing
Write tests first, using the tdd skill. It covers how to write them. This section covers which tools to use and what to cover.

| Level | TypeScript | .NET | Python |
|---|---|---|---|
| Unit / component | Vitest, plus React Testing Library for components | xUnit | pytest |
| Integration (API + DB) | Vitest against a real Postgres | xUnit + `WebApplicationFactory` + Testcontainers | pytest + FastAPI `TestClient` |
| End-to-end | Playwright | Playwright | Playwright |

- **Database:** run integration tests against real Postgres, using Testcontainers or `supabase start`. Don't use SQLite or in-memory fakes, since they hide constraint and query bugs.
- **Mocks:** mock only at system boundaries such as Stripe, Resend and third-party APIs. See the tdd skill's `mocking.md`.
- **Must cover:** business rules, authorisation (who can see or do what), money and data-integrity paths, and 1–3 critical user journeys in Playwright.
- **Skip:** coverage % targets, snapshot-heavy UI tests, and tests of framework or library code.
- **CI:** every PR runs unit and integration tests, plus a Playwright smoke run of the critical journeys.

## CI/CD
Step 2's "solo or team" answer sets the workflow mode. Record it in the PRD's Quality baseline and in `AGENTS.md`.

| | Solo (default) | Team |
|---|---|---|
| Commits | Straight to `main`. Agents on long or unattended runs use a branch and a PR | Branch and PR only |
| Pre-commit | Husky + lint-staged (see Lint & format), about 1–3s | None, since CI is the gate |
| CI | Runs on every push and PR, and **reports** | Runs on PRs, and **blocks the merge**: `main` requires CI, squash merge only |
| Deploy | Production on push to `main`, with previews on agent PRs | Preview on each PR, production on merge |

- **CI:** one workflow, copied from [templates/ci.yml](templates/ci.yml). It runs a frozen install, the Lint & format checks, tests, then a build. Add a Postgres service once integration tests exist, and the Playwright smoke run once the first user journey exists (Phase 1).
- **Deploy:** Vercel's Git integration, with no workflow file. For .NET or FastAPI hosts, add a `deploy.yml` on `push: main` that needs CI to pass and runs migrations as an explicit step (see [Migrations](#migrations)). If a deploy is bad, roll back to the previous one in the host.
- **Dependencies and secrets:** Dependabot weekly with minor and patch updates grouped ([templates/dependabot.yml](templates/dependabot.yml)). Turn on GitHub secret scanning and push protection.
- **Git conventions (both modes):**
  - Commits: Conventional Commits (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`), small and green.
  - Branches (Team, and Solo agent runs): `feat|fix|chore/<slug>`, one ROADMAP task each, deleted after merge.
  - PRs: the squash title is the Conventional Commit; link the ROADMAP task; CI green.
  - Solo → Team: turn on branch protection requiring CI, and update the `AGENTS.md` Workflow line.
- **Deferred → `TODO.md`:** CodeQL, a staging environment, release automation, E2E beyond the smoke run, and switching Solo → Team once there are real users or a second contributor.

## Templates
When the chosen stack matches one of these, Phase 0 starts from the template instead of the scaffolders. Each one already has the Lint & format, Testing (unit, component, phone-width Playwright smoke test), Solo-mode hook, `.env.example` with fail-fast validation, CI and Dependabot defaults on this page, and is green in CI.

| Stack | Template |
|---|---|
| Next.js + Supabase (simple web app) | [tonylxm/nextjs-supabase-starter](https://github.com/tonylxm/nextjs-supabase-starter) |
| Next.js + ASP.NET Core + Postgres (serious SaaS) | [tonylxm/nextjs-dotnet-starter](https://github.com/tonylxm/nextjs-dotnet-starter) |
| Vite + React (SPA, internal tool) | [tonylxm/vite-react-starter](https://github.com/tonylxm/vite-react-starter) |

```bash
gh repo create <app> --template tonylxm/<template> --private --clone
```

Then follow the template's README checklist (rename, env, secret scanning, host). For Team mode, the README says how to remove the hook. If the folder already has the project docs, clone into `<app>` and copy it up as described under [Scaffolding](#scaffolding-fallback-when-no-template-fits) (if the folder is already a git repo, add `--exclude .git` and set the remote yourself).

**Keeping templates current:** [templates/ci.yml](templates/ci.yml), [templates/dependabot.yml](templates/dependabot.yml) and this page are the source. When they change, update the template repos too. Merge each template's Dependabot PRs when CI is green. Majors of TypeScript, ESLint and `@types/node` are ignored in `dependabot.yml`, so upgrade those by hand once the framework supports them.

## Scaffolding (fallback when no template fits)
Use the official scaffolder with flags so it doesn't prompt and you don't hand-write boilerplate. Inspect what it generates, then add only the project-specific dependencies and config. CLIs change their flags, so if one is rejected, check `--help`.

| Stack | Scaffold | Then |
|---|---|---|
| Next.js | `pnpm create next-app@latest <app> --ts --eslint --tailwind --src-dir --app --import-alias "@/*" --use-pnpm --yes` | `pnpm dlx shadcn@latest init -d`. Delete the generated `CLAUDE.md`. Make `typecheck` `next typegen && tsc --noEmit`, since route types such as `LayoutProps` live in the gitignored `.next/` and a fresh CI clone fails without them |
| Vite + React | `pnpm create vite@latest <app> --template react-ts --no-interactive` | `pnpm add tailwindcss @tailwindcss/vite`, add `tailwindcss()` to the `vite.config.ts` plugins and `@import "tailwindcss";` to `src/index.css`. Add the `@/*` path alias to `tsconfig.json`, `tsconfig.app.json` and `vite.config.ts`, then run `pnpm dlx shadcn@latest init -d -t vite`. The scaffolder now sets up oxlint instead of ESLint. Keep it (no `eslint-config-prettier` needed), and use `oxlint --fix` in lint-staged and `tsc -b` for `typecheck` |
| ASP.NET Core | `dotnet new sln -n <App>` · `dotnet new webapi -n <App>.Api` (add `--use-controllers` for the Controller → Service style) | `dotnet new xunit -n <App>.Tests` · `dotnet add <App>.Tests package Microsoft.AspNetCore.Mvc.Testing Testcontainers.PostgreSql` · `dotnet sln add **/*.csproj`. On the .NET 10 SDK, xUnit v3 needs `"test": { "runner": "Microsoft.Testing.Platform" }` in `global.json`, and the CI command becomes `dotnet test --solution <App>.slnx` |
| FastAPI | `uv init <app>` · `uv add "fastapi[standard]"` | `uv add --dev pytest ruff` |
| JS lint/format | `pnpm add -D prettier eslint-config-prettier prettier-plugin-tailwindcss` | Add `eslint-config-prettier` to `eslint.config.mjs`, then add the scripts above |
| Git hooks (Solo) | `pnpm add -D husky lint-staged` · `pnpm exec husky init` | Replace `.husky/pre-commit` with `pnpm exec lint-staged`, then add the `lint-staged` config above |
| JS testing | `pnpm add -D vitest` · `pnpm create playwright@latest` | For React components: `pnpm add -D @testing-library/react @testing-library/dom jsdom` |
| Supabase | `pnpm add -D supabase --allow-build=supabase` · `pnpm supabase init` | `pnpm supabase start` for local Postgres, Auth and Storage |

**Scaffolding into a repo that already has docs:** scaffolders refuse to run in a folder that isn't empty. `create-next-app` stops on `AGENTS.md`, `CLAUDE.md` or `ROADMAP.md`, and Vite cancels. So generate the app in a subfolder named after it, copy it up without overwriting anything, then delete the subfolder:

```bash
<scaffold command with <app> as the directory>
rsync -a --ignore-existing --exclude CLAUDE.md <app>/ ./ && rm -rf <app>
```

Your own docs win. `create-next-app` also writes a `<!-- BEGIN:nextjs-agent-rules -->` block into `AGENTS.md`, and `next dev` adds it back. Keep that block (see agents-md).

## Default stacks
| Use case | Stack |
|---|---|
| Simple web app | Next.js + TypeScript + Tailwind + shadcn/ui + Zod + PostgreSQL/Supabase + Vercel |
| Serious SaaS / marketplace | Next.js + TypeScript → ASP.NET Core + C# → PostgreSQL |
| AI/ML-heavy | Next.js → ASP.NET Core → Python/FastAPI where genuinely required → PostgreSQL |

Rule of thumb: use the simplest stack that comfortably supports the product's foreseeable requirements.
