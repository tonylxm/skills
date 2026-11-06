---
name: client-preview
description: Use when a prototype, mockup, design preview or staging build is about to go to a client (or other outside reviewer) for feedback, when asked to "send this to the client", "share the prototype", "get a test link", or to check a preview is safe, private and presentable before sharing.
---

# Client Preview

Gets a prototype in front of a client safely: a passcode gate, a readable link, a pre-send checklist and an email. Done when the checklist is green, the link opens for a fresh visitor, and the email and passcode are drafted for the user to send.

Never send the email or passcode yourself. Deploys, env vars, domain and protection changes are outward-facing: confirm each with the user first.

## 1. Scope

Ask (with a recommendation) only what you can't read from the repo:

- Which routes the client sees. Recommend a dedicated preview route (`/design-preview`) that 404s on production, over sharing the whole app.
- Real or placeholder content. Recommend placeholder unless the client supplied it and agreed to its use in a preview.
- Feedback style: default to email reply with numbered notes ([templates/client-email.md](templates/client-email.md)).

## 2. Gate it

Default: an app-level passcode gate. Free, host-agnostic, keeps the URL clean. The passcode goes by a different channel than the link (text message vs email).

- Passcode: a 4-word lowercase passphrase. Generate it, put it in the host's env for the preview environment only, never in the repo or chat history beyond the hand-off.
- Fail closed: a hosted deploy with no passcode set is locked, not open. Local dev with no passcode is open.
- Check on the server close to the content (each page), not only in middleware or a layout.

Stack recipe: [references/nextjs-vercel.md](references/nextjs-vercel.md). For another stack, apply the same rules with its equivalents.

Alternatives, if the user asks: host password protection (Vercel's is a paid add-on), host share links (free, but long tokens in the URL), or unlisted + noindex only (placeholder content, low stakes).

## 3. Make the link

Default: a named `<project>-preview.vercel.app` (or the host's equivalent) that tracks a dedicated branch, so it always shows the latest push and never goes stale. A subdomain of the user's own domain is the upgrade. No tokens or passcodes in the URL.

## 4. Pre-send checklist

Run every item, report each as pass / fix / n.a. with what you checked. Fix what you can; list the rest for the user.

**Access**
- [ ] Gate on for the shared host; unlock tested in a private window with the real passcode and a wrong one
- [ ] Deep links redirect to unlock and come back after
- [ ] The host's own login wall (for example Vercel Authentication on previews) doesn't block the client
- [ ] Production still hides the preview route

**Link**
- [ ] Resolves to the latest build
- [ ] Pasted into a chat app, the preview card shows a neutral title and no other client's name or image
- [ ] No tokens, passcodes or personal data in the URL

**Security**
- [ ] No secrets in the client bundle (review every public env var prefix, for example `NEXT_PUBLIC_*`)
- [ ] The preview runs without production keys; no admin, payment or real-data routes reachable from it
- [ ] `noindex` in page meta and an `X-Robots-Tag: noindex` header (the `seo` skill covers preview noindex)
- [ ] If the diff added the gate, run `/security-review` on it

**Assets and licensing**
- [ ] Fonts licensed for web use
- [ ] Images placeholder, owned, or licensed for this use; no watermarked stock; no other clients' work
- [ ] Real client images are not in the public/static folder, which skips the gate

**Confidentiality**
- [ ] No real customer data, internal notes, TODOs, pricing or other clients visible
- [ ] Repo and host project private if they hold client material

**Permissions**
- [ ] The client agreed to their material appearing in a preview
- [ ] Known who at the client will see it (the passcode will be forwarded)

**Quality**
- [ ] Run the `frontend-verify` skill on the shared URL: phone and desktop, console clean, links work
- [ ] Placeholder copy and images are clearly placeholders

No link expiry by default: the preview stays up until the user takes it down.

## 5. Email

Draft from [templates/client-email.md](templates/client-email.md) in chat, filled in for this project. Draft the separate passcode message too. The user sends both.

## 6. Afterwards (when the user decides)

Offer, don't do: rotate the passcode (revokes all access at once), remove the branch domain, delete the preview route once a direction is chosen.
