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
- Docker when useful
- GitHub Actions for CI, Vercel's Git integration for deploys (see [CI/CD](#cicd))
- Stripe for payments, Resend for email
- Sentry for error monitoring, PostHog for product analytics
- Managed background jobs where appropriate

Avoid Kubernetes, Kafka, Redis and similar until there is a concrete need.

## Package manager
- pnpm for new JS/TS projects. Pin it with a `"packageManager": "pnpm@<version>"` field in `package.json`.
- In an existing repo, use whatever its lockfile says (`package-lock.json` → npm, `yarn.lock` → Yarn). Never mix lockfiles.
- pnpm blocks dependency install scripts by default. If a package needs one (e.g. `supabase`, `esbuild`, `sharp`), allow it explicitly with `pnpm approve-builds` rather than turning the protection off.

## Lint & format
- **JS/TS:** ESLint as the scaffolder sets it up (flat config, `eslint.config.mjs`), plus Prettier. Put `eslint-config-prettier` last in the ESLint config so the two never conflict, and add `prettier-plugin-tailwindcss` for class sorting. Keep `.prettierrc` to just that plugin and accept Prettier's defaults. Add a `.prettierignore`.
- Scripts: `lint`, `format` (`prettier --write .`), `format:check` (`prettier --check .`) and `typecheck` (`tsc --noEmit`). CI runs `lint`, `format:check` and `typecheck`.
- **.NET:** `dotnet new editorconfig`, and `dotnet format --verify-no-changes` in CI.
- **Python:** Ruff for both lint and format. CI runs `ruff check` and `ruff format --check`.
- An `.editorconfig` at the repo root.
- **Git hooks** depend on the workflow mode (see [CI/CD](#cicd)): Solo gets Husky + lint-staged, Team gets none. The hook only auto-fixes staged files. Never put tests or typecheck in it. In `package.json`:
  ```json
  "lint-staged": {
    "*.{ts,tsx,js,jsx,mjs}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css,yml}": "prettier --write"
  }
  ```
  `.husky/pre-commit` contains just `pnpm exec lint-staged`. Use `git commit --no-verify` to skip it for a one-off.

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
- **Deploy:** Vercel's Git integration, with no workflow file. For .NET or FastAPI hosts, add a `deploy.yml` on `push: main` that needs CI to pass and runs migrations as an explicit step. If a deploy is bad, roll back to the previous one in the host.
- **Dependencies and secrets:** Dependabot weekly with minor and patch updates grouped ([templates/dependabot.yml](templates/dependabot.yml)). Turn on GitHub secret scanning and push protection.
- **Deferred → `TODO.md`:** CodeQL, a staging environment, release automation, E2E beyond the smoke run, and switching Solo → Team once there are real users or a second contributor.

## Scaffolding
Use the official scaffolder with flags so it doesn't prompt and you don't hand-write boilerplate. Inspect what it generates, then add only the project-specific dependencies and config. CLIs change their flags, so if one is rejected, check `--help`.

| Stack | Scaffold | Then |
|---|---|---|
| Next.js | `pnpm create next-app@latest <app> --ts --eslint --tailwind --src-dir --app --import-alias "@/*" --use-pnpm --yes` | `pnpm dlx shadcn@latest init` |
| Vite + React | `pnpm create vite@latest <app> --template react-ts --no-interactive` | `pnpm add tailwindcss @tailwindcss/vite`, add `tailwindcss()` to the `vite.config.ts` plugins and `@import "tailwindcss";` to `src/index.css`. Add the `@/*` path alias to `tsconfig.json`, `tsconfig.app.json` and `vite.config.ts`, then run `pnpm dlx shadcn@latest init` |
| ASP.NET Core | `dotnet new sln -n <App>` · `dotnet new webapi -n <App>.Api` (add `--use-controllers` for the Controller → Service style) | `dotnet new xunit -n <App>.Tests` · `dotnet add <App>.Tests package Microsoft.AspNetCore.Mvc.Testing Testcontainers.PostgreSql` · `dotnet sln add **/*.csproj` |
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
