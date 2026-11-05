# Client account setup

_You handle the setup on one call, and the client ends up owning the accounts they must own (see [tech-stack.md → Ownership](tech-stack.md#ownership-and-handover)). Keep only the services this stack needs. Prices and roles checked 2026-11; recheck before quoting._

## How it runs
1. **Quote it** as part of the build: a 30-minute setup call.
2. **Send the prep message** below a few days before.
3. **On the call,** screen-share and guide them through each service. They type their email, password, card and ID, and invite you. You never hold their passwords or card.
4. **Until the call,** build locally and on your own test accounts. Mark the Phase 0 setup and deploy tasks `BLOCKED: waiting on client accounts`. Put Stripe products and prices in a seed script, since test data doesn't move to their account.

## Prep message (send to the client)

> Before our setup call, please have ready:
> - A business email more than one person can reach (e.g. `admin@yourbusiness.com`)
> - Your phone, for two-factor login codes
> - The business card that will pay for hosting and services
> - {Stripe only} Your business registration details, bank account, and photo ID
>
> The accounts will be in your business's name, so you own your site, payments and customer data. I'll do the work inside them.

## On the call

| Service | Sign up | Plan | Invite you | Role |
|---|---|---|---|---|
| Domain | You buy it in your registrar account, or they buy it at [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) | n/a | Cloudflare: **Members → Invite** | **DNS** (+ **Cloudflare R2 Admin** if storing files) |
| GitHub | [github.com/organizations/plan](https://github.com/organizations/plan) | Free | **People → Invite member** | **Owner** (removed at handover) |
| Vercel | [vercel.com/signup](https://vercel.com/signup) | **Pro**, about US$20/mo per paid seat (Hobby is non-commercial) | **Settings → Members → Invite** | **Member** (your seat about US$20/mo) |
| Supabase | [supabase.com/dashboard](https://supabase.com/dashboard) | **Pro**, from US$25/mo | Organisation **Team** settings | **Administrator** (members free) |
| Neon | [neon.com/signup](https://neon.com/signup) | **Launch**, usage-based, no minimum | **People → Invite member** | **Admin** (members free) |
| Stripe | [dashboard.stripe.com/register](https://dashboard.stripe.com/register) | Pay per transaction | **Settings → Team → Add member** (invite expires in 10 days) | **Developer** |
| Resend | [resend.com/signup](https://resend.com/signup) | Free (100/day) or **Pro** US$20/mo (50,000/mo) | **Settings → Team → Invite** | **Admin** (to verify their sending domain) |

For every account: their business email, two-factor login on. Create the projects yourself afterwards (Supabase or Neon region near their users).

**If you buy the domain:** put the client's name and business email as the registrant (owner) contact, bill the renewal yearly, and transfer it to their own registrar account at handover. Never register it in your own name.

## After the call
Check each invite arrived, accept them, and tell the client which ones (if any) still need their action.
