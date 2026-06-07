export type SiteAuthor = {
  name: string;
  url?: string;
  email?: string;
};

export type SiteAuthorInput = SiteAuthor | SiteAuthor[];

export type SiteConfig = {
  name: string;
  description: string;
  url?: string;
  locale?: string;
  publisher?: string;
  author?: SiteAuthorInput;
  twitterHandle?: string;
  defaultImage?: string;
};

export const defaultSiteConfig: SiteConfig = {
  name: "XForge",
  description:
    "Governance-first ERP foundation for tenant-scoped business systems.",
  locale: "en_US",
  publisher: "XForge",
  author: { name: "XForge" },
  twitterHandle: "@xforge",
};
