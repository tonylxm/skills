# Clients: accounts, billing and handover

_You do the work on your own accounts, and the client does only what needs their identity, logins or sign-off. Prices and roles checked 2026-11; recheck before quoting. Contract: [contract-template.md](contract-template.md)._

## Pricing models
| Model | Running costs | Ongoing billing |
|---|---|---|
| **One-off build** (default) | Build on your accounts, hand over at launch. The client then pays providers directly | None |
| **First year included** | Covered by the build fee on your accounts, then a yearly hosting fee or a handover | Yearly invoice, paid upfront |
| **Care plan** | Hosting on your accounts plus set hours for updates, Dependabot PRs and fixes | Monthly, via repeating invoices (Xero or Stripe) |

If you host, your contract says what happens when a payment is missed. Your Cloudflare Workers Paid account ($5/month) and Resend plan cover many clients, so a hosting fee is mostly margin. Neon is on the client's card: if their app needs no cold starts, Launch with scale-to-zero off adds about $19/month, so name it in the quote or care plan. Running costs per service: [tech-stack.md → Running costs](tech-stack.md#running-costs).

## Accounts
| Account | Owner | Why |
|---|---|---|
| Stripe | Always the client | Payments, tax, identity checks and chargebacks are theirs |
| Domain | You buy and renew it, the client is the registrant | Whoever is registrant controls the site and email. Never register it in your name. Use Cloudflare Registrar (at-cost, renewal equals first year; `.com` about US$11, `.nz` about US$16), Porkbun or Spaceship. Avoid registrars whose cheap first year hides a high renewal (GoDaddy, Namecheap) |
| Neon with personal data, R2 | The client | Responsible for the data under privacy law, and usage bills stay with them |
| GitHub, Cloudflare Workers (Paid), Resend | You during the build. One-off: transferred at launch. Hosting or care plan: stays with you | Nothing for the client to set up |

## The client's list
Send only the rows the project needs.

| They do | When |
|---|---|
| Confirm the domain owner email (one click) | Every domain you register for them |
| Sign up to [Stripe](https://dashboard.stripe.com/register), complete business, ID and bank details, invite you as **Developer** (**Settings → Team**, invite expires in 10 days) | They take payments |
| Sign up to [Neon](https://neon.com/signup) (**Launch**, usage-based, likely a US$5/month minimum), add a card, invite you as **Admin** | The app stores personal data |
| Give you access to what they already have: domain, Google Workspace or Microsoft 365 email, old host | They already have a site or email |
| Sign in to connect their tools (Xero, Google Calendar, Mailchimp, social) | An integration with their accounts |
| Verify their Google Business Profile | Local businesses |
| Send the content: copy, photos, logo, prices | Always |
| Approve the privacy policy and terms | The site collects personal data or takes payments |
| Create Apple and Google developer accounts (business verification takes days) | Mobile apps |
| Create a [Cloudflare](https://dash.cloudflare.com/sign-up) account on Workers Paid and invite you as a member | One-off builds, at handover |

Every account they create: a business email more than one person can reach, two-factor login on. They never send you passwords or keys.

## Your list
- Buy the domain with the client as registrant, set up DNS and Resend sending (SPF, DKIM).
- Private repo on your GitHub, Worker on your Cloudflare account, Search Console verified through DNS.
- Create the database project in the region from [tech-stack.md → Data and auth](tech-stack.md#data-and-auth).
- Inside Stripe once invited: products, prices, webhooks. Keep products in a seed script, since test-mode data doesn't move to their account.
- **While waiting** on the client: build locally and on your own test accounts, and mark the blocked Phase 0 tasks `BLOCKED: waiting on client`.

## Handover
- **One-off:** transfer the repo (GitHub **Settings → Transfer**), then deploy the Worker from their Cloudflare account (`wrangler login` as them, set the secrets again, `pnpm run deploy`), move the custom domain to it and delete yours. Check that the domain, secrets and deploys work.
- Resend sending verified, backups on (a paid database plan), and who handles dependency updates afterwards agreed in writing.
- The client resets any password you knew and turns on two-factor login. Remove yourself from their accounts unless you're on a care plan.
- Public sites also follow the seo skill's handover.
