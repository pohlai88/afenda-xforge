import type { MetadataInput } from "./metadata.ts";
import type { CreateRobotsInput } from "./robots.ts";
import type { SiteConfig } from "./site.ts";
import { defaultSiteConfig } from "./site.ts";
import type { CreateSitemapInput } from "./sitemap.ts";

export type SitePreset = {
  site: SiteConfig;
  metadata: MetadataInput;
  robots: CreateRobotsInput;
  sitemap?: CreateSitemapInput;
};

type CreateSitePresetInput = {
  title: string;
  description: string;
  baseUrl: string;
  site: Partial<SiteConfig>;
  robots: Omit<CreateRobotsInput, "baseUrl">;
  sitemap?: Omit<CreateSitemapInput, "baseUrl">;
};

const buildSiteConfig = (
  baseUrl: string,
  site: Partial<SiteConfig>
): SiteConfig => ({
  ...defaultSiteConfig,
  ...site,
  url: baseUrl,
});

export const createSitePreset = ({
  title,
  description,
  baseUrl,
  site,
  robots,
  sitemap,
}: CreateSitePresetInput): SitePreset => ({
  site: buildSiteConfig(baseUrl, site),
  metadata: {
    title,
    description,
    site: buildSiteConfig(baseUrl, site),
  },
  robots: {
    baseUrl,
    ...robots,
  },
  ...(sitemap
    ? {
        sitemap: {
          baseUrl,
          ...sitemap,
        },
      }
    : {}),
});

export const createAppSitePreset = (baseUrl: string): SitePreset =>
  createSitePreset({
    title: "App",
    description: "XForge ERP application shell.",
    baseUrl,
    site: {
      name: "XForge",
      shortName: "XForge",
      description:
        "Governance-first ERP foundation for tenant-scoped business systems.",
      publisher: "XForge",
      author: { name: "XForge" },
      twitterHandle: "@xforge",
      logoPath: "/icon.svg",
      faviconPath: "/icon.svg",
      defaultImage: "/opengraph-image",
    },
    robots: {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    },
  });

export const createWebSitePreset = (baseUrl: string): SitePreset =>
  createSitePreset({
    title: "XForge Web",
    description: "Public XForge web surface.",
    baseUrl,
    site: {
      name: "XForge",
      shortName: "XForge",
      description: "Public XForge web surface.",
      publisher: "XForge",
      author: { name: "XForge" },
      twitterHandle: "@xforge",
      logoPath: "/icon.svg",
      faviconPath: "/icon.svg",
      defaultImage: "/opengraph-image",
    },
    robots: {
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemapPath: "/sitemap.xml",
    },
    sitemap: {
      entries: [
        {
          path: "/",
          changeFrequency: "weekly",
          priority: 1,
        },
      ],
    },
  });
