# SEO in Next.js App Router

Checked against Next.js 16.4 docs as of November 2026. APIs move between majors, so confirm against the installed version's `node_modules/next/dist/docs/01-app/` before copying.

**Metadata merges shallowly.** A page's `openGraph` replaces the layout's whole `openGraph` object, so a page that sets it repeats the shared fields (or spreads a shared constant). Never put `alternates.canonical` or `openGraph.url` in the root layout, or every page inherits the home URL.

| Baseline item | Where | How |
|---|---|---|
| Site URL | `src/lib/site.ts` | One `siteUrl` constant from `NEXT_PUBLIC_SITE_URL`, validated in `site.ts` itself (not a shared env module that also requires the database). Add the var to `.env.example`, the test config and the deploy build (a CI variable). Previews use the production URL too, so canonicals always point at production |
| Titles | `app/layout.tsx` | `metadata.title = { template: '%s \| Business', default: 'Business, what it does' }`. Pages set a plain `title` string. The template applies only to child segments, not the layout's own segment |
| Description | each `page.tsx` | `metadata.description`, or `generateMetadata` for dynamic routes |
| Absolute URLs | `app/layout.tsx` | `metadataBase: new URL(siteUrl)`, so canonical and OG paths can be relative. Return it as a string if `generateMetadata` uses `'use cache'` |
| Canonical | each `page.tsx` | `alternates: { canonical: '/path' }` |
| `lang` | `app/layout.tsx` | `<html lang="en">` (or the site's language) |
| Sitemap | `app/sitemap.ts` | Default export returning `MetadataRoute.Sitemap`: one entry per public route, absolute URLs from `siteUrl`, each identical to that page's canonical (Next renders the home canonical without a trailing slash, so list the home page as `siteUrl`). Skip `lastModified` unless real dates exist. Use `generateSitemaps` only past 50,000 URLs |
| Robots | `app/robots.ts` | Default export returning `MetadataRoute.Robots`. Production: allow `/`, `` sitemap: `${siteUrl}/sitemap.xml` ``. Otherwise disallow `/` |
| Preview `noindex` | `app/layout.tsx` | `robots: isProduction ? undefined : { index: false, follow: false }`, with `isProduction` in `site.ts`. It is `process.env.NEXT_PUBLIC_SITE_ENV === 'production'`, set only by the production deploy script. The `NEXT_PUBLIC_` prefix inlines it at build time, so static pages, `robots.ts` and dynamic pages rendered later on the Worker all agree. Set it for the build, including local production builds |
| Share image | `app/opengraph-image.tsx` (or a static `opengraph-image.png`) | 1200x630. A `twitter-image` falls back to it if absent. Set `openGraph` and `twitter.card: 'summary_large_image'` in the root metadata |
| JSON-LD | `app/layout.tsx` (sitewide business) or `page.tsx`. It renders in the body, which Google reads fine | `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />`. The `replace` blocks script injection. Type it with `schema-dts` only if already installed (ask before adding it) |
| 404 | `app/not-found.tsx` | Call `notFound()` from `next/navigation` for missing dynamic records, so the status is 404 rather than a 200 "not found" page |
| Redirects | `next.config.ts` | `async redirects() { return [{ source: '/old', destination: '/new', permanent: true }] }`. `permanent: true` sends 308, which Google treats like 301 |
| `www` and trailing slash | Cloudflare, `next.config.ts` | Add both hostnames as custom domains and redirect one to the other with a Cloudflare redirect rule. Next serves URLs without a trailing slash by default (`trailingSlash: false`); keep it |
| Images and fonts | components | `next/image` with `width`/`height` (or `fill` in a sized parent) and `alt`. `next/font` for fonts |

## Example local business JSON-LD

```ts
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CafeOrCoffeeShop',
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
  openingHours: ['Mo-Fr 07:00-17:00', 'Sa-Su 08:00-15:00'],
  image: `${siteUrl}/business.jpg`,
}
```

Use the most specific `@type` on schema.org (`CafeOrCoffeeShop`, `Dentist`, `HairSalon`, else `LocalBusiness`). Name, address, phone and hours match the Google Business Profile exactly. Use a static image in `public/` for `image`, since the generated share image's URL carries a hash query.
