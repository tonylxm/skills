# Deprecations

Things agents keep using that a stack has since replaced. The lint rule comes first (`no-deprecated`, see [tech-stack.md → Lint & format](tech-stack.md#quality-baseline)); a row here covers what lint can't see. The builder reads only the rows for the repo's stack and installed version. A row whose "Since" is below the installed version is deleted, not kept.

| Stack | Since | Avoid | Use instead | Checked |
|---|---|---|---|---|
| Next.js | 16 | `middleware.ts` | `proxy.ts` | carried over, not re-verified |
| node-postgres (`pg`) | current | `sslmode=require` in the connection string | `sslmode=verify-full` (`require` prints a deprecation warning) | carried over from tech-stack.md |

Add a row when the same one shows up in 2+ PRs (the retro does this). Repo-only gotchas go in that repo's `AGENTS.md` instead.
