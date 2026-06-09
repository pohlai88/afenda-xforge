# @repo/seo

Shared SEO utilities for XForge apps.

## Purpose

This package provides the shared metadata and structured-data layer used by the App Router apps in this monorepo.

It is intended for:

- page and layout metadata
- JSON-LD generation
- robots.txt generation
- sitemap generation

## Exports

### Metadata

- `createMetadata`
- `createSitePreset`
- `SitePreset`
- `createAppSitePreset`
- `createWebSitePreset`
- `defaultSiteConfig`
- `MetadataInput`
- `SiteConfig`

### JSON-LD

- `JsonLd`
- `stringifyJsonLd`
- `createOrganizationJsonLd`
- `createWebsiteJsonLd`
- `createBreadcrumbJsonLd`

### Robots

- `createRobots`
- `Robots`
- `RobotsRule`
- `RobotsGroupRule`

### Sitemap

- `createSitemap`
- `createLocalizedSitemap`
- `Sitemap`
- `SitemapEntry`

## Usage

```ts
import { createMetadata } from "@repo/seo/metadata";

export const metadata = createMetadata({
  title: "Dashboard",
  description: "Governance-first ERP foundation.",
  site: {
    name: "XForge",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  },
});
```

```ts
import { createRobots } from "@repo/seo/robots";

export default function robots() {
  return createRobots({
    baseUrl: process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3001",
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemapPath: "/sitemap.xml",
  });
}
```

```ts
import { createSitemap } from "@repo/seo/sitemap";

export default function sitemap() {
  return createSitemap({
    baseUrl: process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3001",
    entries: [
      {
        path: "/",
        changeFrequency: "weekly",
        priority: 1,
      },
    ],
  });
}
```

```tsx
import { JsonLd, createOrganizationJsonLd } from "@repo/seo";

export function OrganizationSchema() {
  return (
    <JsonLd
      data={createOrganizationJsonLd(
        "XForge",
        "https://xforge.example",
        "https://xforge.example/logo.svg"
      )}
    />
  );
}
```

## Conventions

- Pass absolute `baseUrl` values whenever you want route helpers to emit fully qualified URLs.
- Keep `site.url` valid; `createMetadata` throws on invalid URLs.
- Prefer file-based Next.js metadata files for icons, Open Graph images, robots, and sitemap routes when possible.
- Use `createMetadata` only for shared defaults and common Open Graph/Twitter behavior.

## Notes

- The package stays source-based for now because it is consumed only inside this monorepo.
- If you decide to publish it externally, add a build step and emit compiled output under `dist/`.
