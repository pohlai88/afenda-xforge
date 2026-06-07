export type SiteAuthor = {
  name: string;
  url?: string;
  email?: string;
};

export type SiteAuthorInput = SiteAuthor | SiteAuthor[];

export type SiteConfig = {
  name: string;
  shortName?: string;
  description: string;
  url?: string;
  locale?: string;
  publisher?: string;
  author?: SiteAuthorInput;
  supportEmail?: string;
  twitterHandle?: string;
  defaultImage?: string;
  logoPath?: string;
  faviconPath?: string;
};

export const defaultSiteConfig: SiteConfig = {
  name: "XForge",
  shortName: "XForge",
  description:
    "Governance-first ERP foundation for tenant-scoped business systems.",
  locale: "en_US",
  publisher: "XForge",
  author: { name: "XForge" },
  supportEmail: "support@example.com",
  twitterHandle: "@xforge",
  logoPath: "/logo.svg",
  faviconPath: "/favicon.ico",
};
