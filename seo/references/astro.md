# SEO in Astro

Checked against Astro 7.4 and `@astrojs/sitemap` 3.7 as of November 2026. Confirm against the installed versions (`node_modules/astro/dist/types/public/config.d.ts` and the docs) before copying.

| Baseline item | Where | How |
|---|---|---|
| Site URL | `astro.config.mjs` | `site: 'https://client.com'`. Canonicals, share images and the sitemap all build from `Astro.site` |
| Head tags | `src/layouts/Layout.astro` | One layout that takes `title`, `description` and `noindex` props and renders title, description, canonical, `og:*` and `twitter:*`. Home page omits `title` and gets the default "Business, what it does" |
| Canonical | layout | `new URL(Astro.url.pathname.replace(/(\/index)?\.html$/, ''), Astro.site)`. With `build.format: 'file'`, prerendered pathnames end in `.html` (home is `/index.html`), which wouldn't match the sitemap |
| `lang` | layout | `<html lang="en">` |
| Trailing slash | `astro.config.mjs` | `trailingSlash: 'never'` with `build: { format: 'file' }`, so built URLs, canonicals and the sitemap agree |
| Sitemap | `astro.config.mjs` | `integrations: [sitemap()]` from `@astrojs/sitemap` (writes `sitemap-index.xml`). Leave out noindex pages with `sitemap({ filter: (page) => !page.includes('/thanks') })` |
| Robots | `src/pages/robots.txt.ts` | A `GET` route returning text: `Allow: /` in production, `Disallow: /` otherwise, plus `Sitemap: <site>/sitemap-index.xml` |
| Preview `noindex` | layout and `robots.txt.ts` | An explicit `SITE_ENV` enum read through `astro:env` (declare it in `env.schema`, optional, `access: 'public'`). Only the production deploy script sets `SITE_ENV=production`. Static pages read it at build time, so set it for the build |
| Share image | `public/og.png` | 1200x630 static image, referenced as an absolute URL from `Astro.site`, with `og:image:width`/`height` |
| JSON-LD | layout | `<script type="application/ld+json" is:inline set:html={JSON.stringify(jsonLd).replace(/</g, '\\u003c')} />`. Build it from one source of business facts, leaving out unset fields. Swap `Organization` for the client's `LocalBusiness` subtype (example in [nextjs.md](nextjs.md#example-local-business-json-ld), the object is the same) |
| 404 | `src/pages/404.astro` | Uses the layout with `noindex`. Hosts serve it with status 404 |
| Redirects | `astro.config.mjs` | `redirects: { '/old': '/new' }`. Production GET redirects are 301 |
| Images and fonts | components | `Image` / `Picture` from `astro:assets` with `alt`; local fonts through Astro's fonts API or self-hosted files, not a render-blocking stylesheet |

Astro ships HTML with no client JavaScript by default, so the raw HTML check in the pre-launch table passes as long as head tags come from the layout, not a client component.
