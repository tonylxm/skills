# Client account setup

_Send the client only the sections their project needs (see [tech-stack.md → Ownership](tech-stack.md#ownership-and-handover)). Prices and roles checked 2026-11; recheck before quoting._

**For you (the freelancer):** dev runs locally and on your own test accounts until these are done, so mark the Phase 0 setup and deploy tasks `BLOCKED: waiting on client accounts` meanwhile. Products and prices go in a seed script, since Stripe test data doesn't move to their account.

---

## Setting up your accounts

These accounts are in your business's name and on your card, so you own your site, your payments and your customers' data. I do the setup and the work inside them.

For each one:
- Sign up with a **business email** that more than one person can reach (e.g. `admin@yourbusiness.com`), not a personal one.
- Turn on **two-factor login**.
- **Invite me** at `{your email}` with the role shown. Never send me passwords or keys.

### Domain
- Buy `{domain}` at a registrar, e.g. [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) (sells at cost).
- Invite me with DNS access (Cloudflare: **Members → Invite**, policies **DNS** and, if we store files, **Cloudflare R2 Admin**).

### GitHub (code)
- Create a free organisation: [github.com/organizations/plan](https://github.com/organizations/plan).
- **People → Invite member**, role **Owner**. You can remove me after handover.

### Vercel (hosting)
- Sign up at [vercel.com/signup](https://vercel.com/signup) and create a team on **Pro** (about US$20/month per paid seat). The free plan is for personal use only.
- **Settings → Members → Invite**, role **Member**. My seat adds about US$20/month.

### Supabase (database and logins)
- Sign up at [supabase.com/dashboard](https://supabase.com/dashboard) and create an organisation on **Pro** (from US$25/month).
- Invite me from the organisation's **Team** settings, role **Administrator**. Members are free.
- Don't create the project: I'll create it in `{region}`.

### Neon (database)
- Sign up at [neon.com/signup](https://neon.com/signup) and create an organisation on **Launch** (pay for what you use, no monthly minimum).
- **People → Invite member**, role **Admin**. Members are free.

### Stripe (payments)
- Sign up at [dashboard.stripe.com/register](https://dashboard.stripe.com/register) and complete the business and bank details yourself. Payouts go to your bank.
- **Settings → Team → Add member**, role **Developer**. The invite expires after 10 days.

### Resend (email)
- Sign up at [resend.com/signup](https://resend.com/signup). Free covers 100 emails/day; **Pro** (US$20/month) covers 50,000/month.
- **Settings → Team → Invite**, role **Admin**, so I can verify your domain for sending.

## When you're done
Reply with which ones are set up. I'll take it from there and tell you if anything needs your card or ID.
