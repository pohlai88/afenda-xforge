import { createMetadata } from "@repo/seo/metadata";
import { createWebSitePreset } from "@repo/seo/presets";
import { createRobots } from "@repo/seo/robots";
import { createSitemap } from "@repo/seo/sitemap";
import type { Metadata } from "next";
import type { MetadataRoute } from "next";

const webBaseUrl = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3001";

export const webSitePreset = createWebSitePreset(webBaseUrl);

export const webLayoutMetadata: Metadata = createMetadata({
  title: "XForge Web",
  description: "Public XForge web surface.",
  site: webSitePreset.site,
});

export const webHomeMetadata: Metadata = createMetadata({
  title: "XForge",
  description: "Governance-first ERP foundation for controlled operations.",
  site: webSitePreset.site,
});

export const webRobots: MetadataRoute.Robots = createRobots({
  baseUrl: webBaseUrl,
  rules: {
    userAgent: "*",
    allow: "/",
  },
  sitemapPath: "/sitemap.xml",
});

export const webSitemap: MetadataRoute.Sitemap = createSitemap({
  baseUrl: webBaseUrl,
  entries: [
    {
      path: "/",
      changeFrequency: "weekly",
      priority: 1,
    },
  ],
});
