# Next.js (App Router) + Vercel recipe

Summary: a passcode gate in four small files, a branch domain for the link, and two Vercel settings. Written against Next 16 (`proxy.ts`, Node runtime by default). On older Next the file is `middleware.ts` on the Edge runtime, where `node:crypto` is unavailable: use Web Crypto there. Check the installed version's docs first (`node_modules/next/dist/docs/`).

| File | Job |
|---|---|
| `src/lib/preview-gate.ts` | Pure functions: token, passcode check, access decision, safe `next` path. Unit-tested |
| `src/proxy.ts` | Optimistic check: redirect to unlock, add `X-Robots-Tag` |
| `<preview>/_lib/access.ts` | `requirePreviewAccess()` called at the top of every preview page |
| `<preview>/unlock/page.tsx` + `actions.ts` + form | Passcode form, server action sets the cookie |

## Gate rules

- Cookie value = `HMAC-SHA256(key = normalised passcode, msg = fixed label)`, hex. Never the passcode itself. Changing the passcode revokes every cookie.
- Compare with `timingSafeEqual` (check lengths first). Normalise input: trim, lowercase, collapse spaces.
- Access: passcode unset and `VERCEL_ENV` unset means open (local dev); passcode unset on Vercel means locked.
- Cookie: `httpOnly`, `secure` in production, `sameSite: "lax"`, `path` = the preview route, 30-day `maxAge`.
- Wrong passcode: wait ~1s before answering (no rate limit exists behind the form).
- `next` param: parse with `new URL(value, "http://x.invalid")`, accept only same-origin paths under the preview route, never the unlock page; otherwise fall back to the preview home. Covers `//evil`, `/\evil` and absolute URLs.
- Tests: right/wrong/empty passcode, normalisation, token changes with passcode, forged cookie, open locally, closed on Vercel without passcode, every `next` attack above.

## Where checks go

- Proxy redirects unauthenticated requests to `/<preview>/unlock?next=<path+query>` and lets the unlock path through.
- Each page calls `await requirePreviewAccess()` (reads `cookies()`, `redirect`s on failure). Not in a layout: layouts don't re-render on client navigation, and the Next auth guide says to check close to the content.
- The proxy matcher usually excludes images, so files in `public/` skip the gate. Keep real client images out of `public/`, or serve them from a gated route.
- If an app-wide auth proxy (Supabase, Auth.js) runs, return before it for preview paths so a preview deploy needs no auth keys.
- Unlock page metadata: neutral title (`"<Client>, design preview"`) and OG title/description, since the gate is all a chat app's link preview can see.

## Vercel

Confirm each with the user before running.

1. **Deployment Protection**: if Vercel Authentication covers preview deployments, clients hit a Vercel login. Turn it off for previews (the passcode gate replaces it). Note that other routes on preview deploys become public too.
2. **Env**: set `PREVIEW_PASSCODE` on the Preview environment only. Production never needs it; the preview route 404s there (`if (process.env.VERCEL_ENV === "production") notFound()` in the preview layout).
3. **Link**: add `<project>-preview.vercel.app` as a project domain assigned to a git branch (for example `client-preview`). Update it with `git push origin main:client-preview`. Prefer this to `vercel alias set`, which pins one deployment and goes stale.
4. **Check** in a private window: no Vercel login, unlock works, production preview route 404s.

Link points at the site root. If the preview lives under a route, redirect `/` to it on the preview host only, so the bare link works and other deploys are unchanged:

```ts
// next.config.ts
async redirects() {
  return [{
    source: "/",
    has: [{ type: "host", value: "<project>-preview.vercel.app" }],
    destination: "/design-preview",
    permanent: false,
  }];
},
```
