# SEO in Next.js App Router

Checked against Next.js 16.3 docs as of November 2026. APIs move between majors, so confirm against the installed version's `node_modules/next/dist/docs/01-app/` before copying.

| Baseline item | Where | How |
|---|---|---|
| Site URL | `src/lib/site.ts` | One `siteUrl` constant from an env var (for example `NEXT_PUBLIC_SITE_URL`), validated at startup. Everything below uses it |
| Titles | `app/layout.tsx` | `metadata.title = { template: '%s \| Business', default: 'Business, what it does' }`. Pages set a plain `title` string. The template applies only to child segments, not the layout's own segment |
| Description | each `page.tsx` | `metadata.description`, or `generateMetadata` for dynamic routes |
| Absolute URLs | `app/layout.tsx` | `metadataBase: new URL(siteUrl)`, so canonical and OG paths can be relative. Return it as a string if `generateMetadata` uses `'use cache'` |
| Canonical | each `page.tsx` | `alternates: { canonical: '/path' }` |
| `lang` | `app/layout.tsx` | `<html lang="en">` (or the site's language) |
| Sitemap | `app/sitemap.ts` | Default export returning `MetadataRoute.Sitemap`: one entry per public route, absolute URLs from `siteUrl`. Use `generateSitemaps` only past 50,000 URLs |
| Robots | `app/robots.ts` | Default export returning `MetadataRoute.Robots`. Production: allow `/`, `` sitemap: `${siteUrl}/sitemap.xml` ``. Otherwise disallow `/` |
| Preview `noindex` | `app/layout.tsx` | `robots: process.env.VERCEL_ENV === 'production' ? undefined : { index: false, follow: false }`. Use the same condition in `robots.ts` |
| Share image | `app/opengraph-image.tsx` (or a static `opengraph-image.png`) | 1200x630. A `twitter-image` falls back to it if absent. Set `openGraph` and `twitter.card: 'summary_large_image'` in the root metadata |
| JSON-LD | `app/layout.tsx` (sitewide business) or `page.tsx` | `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />`. The `replace` blocks script injection. Type it with `schema-dts` only if already installed (ask before adding it) |
| 404 | `app/not-found.tsx` | Call `notFound()` from `next/navigation` for missing dynamic records, so the status is 404 rather than a 200 "not found" page |
| Redirects | `next.config.ts` | `async redirects() { return [{ source: '/old', destination: '/new', permanent: true }] }`. `permanent: true` sends 308, which Google treats like 301 |
| `www` policy | Vercel domain settings | Add both domains and redirect one to the other in the Vercel dashboard |
| Images and fonts | components | `next/image` with `width`/`height` (or `fill` in a sized parent) and `alt`. `next/font` for fonts |

## Example `LocalBusiness` JSON-LD

```ts
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Business Name',
  url: siteUrl,
  telephone: '+65 6000 0000',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '1 Example Road',
    addressLocality: 'Singapore',
    postalCode: '000000',
    addressCountry: 'SG',
  },
  openingHours: ['Mo-Fr 09:00-18:00'],
  image: `${siteUrl}/opengraph-image`,
}
```

Use the most specific `@type` that fits (`Dentist`, `Restaurant`, `HairSalon`). Keep name, address and phone identical to the Google Business Profile.
