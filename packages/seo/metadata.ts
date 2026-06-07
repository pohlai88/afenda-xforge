import merge from "lodash.merge";
import type { SiteAuthor, SiteConfig } from "./site.ts";
import { defaultSiteConfig } from "./site.ts";

type MetadataAuthor = SiteAuthor;

type MetadataOpenGraphImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

type MetadataOpenGraph = {
  title?: string;
  description?: string;
  type?: string;
  siteName?: string;
  locale?: string;
  images?: MetadataOpenGraphImage[];
};

type MetadataAppleWebApp = {
  capable?: boolean;
  statusBarStyle?: "default" | "black" | "black-translucent";
  title?: string;
};

type MetadataTwitter = {
  card?: "summary" | "summary_large_image" | "app" | "player";
  creator?: string;
};

export type Metadata = {
  title: string;
  description?: string;
  applicationName?: string;
  metadataBase?: URL;
  authors?: MetadataAuthor[];
  creator?: string;
  formatDetection?: {
    telephone?: boolean;
  };
  appleWebApp?: MetadataAppleWebApp;
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
  openGraph?: MetadataOpenGraph;
  publisher?: string;
  twitter?: MetadataTwitter;
  icons?: {
    icon?: string;
  };
};

export type MetadataInput = Omit<Metadata, "description" | "title"> & {
  title: string;
  description?: string;
  image?: string;
  site?: Partial<SiteConfig>;
};

const buildMetadataBase = (url?: string): URL | undefined => {
  if (!url) {
    return;
  }

  return new URL(url);
};

const normalizeAuthors = (
  authors?: SiteConfig["author"]
): MetadataAuthor[] | undefined => {
  if (!authors) {
    return;
  }

  return Array.isArray(authors) ? authors : [authors];
};

const getCreator = (authors?: SiteConfig["author"]): string | undefined => {
  const normalizedAuthors = normalizeAuthors(authors);

  return normalizedAuthors?.[0]?.name;
};

export const createMetadata = ({
  title,
  description,
  image,
  site,
  ...properties
}: MetadataInput): Metadata => {
  const resolvedSite: SiteConfig = {
    ...defaultSiteConfig,
    ...site,
  };
  const parsedTitle = `${title} | ${resolvedSite.name}`;
  const defaultMetadata: Metadata = {
    title: parsedTitle,
    description: description ?? resolvedSite.description,
    applicationName: resolvedSite.shortName ?? resolvedSite.name,
    metadataBase: buildMetadataBase(resolvedSite.url),
    authors: normalizeAuthors(resolvedSite.author),
    creator: getCreator(resolvedSite.author),
    formatDetection: {
      telephone: false,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: parsedTitle,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: parsedTitle,
      description: description ?? resolvedSite.description,
      type: "website",
      siteName: resolvedSite.name,
      locale: resolvedSite.locale ?? "en_US",
    },
    publisher: resolvedSite.publisher,
    twitter: {
      card: "summary_large_image",
      creator: resolvedSite.twitterHandle,
    },
    icons: resolvedSite.faviconPath
      ? {
          icon: resolvedSite.faviconPath,
        }
      : undefined,
  };

  const metadata = merge(defaultMetadata, properties);

  if (image && metadata.openGraph) {
    metadata.openGraph.images = [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: title,
      },
    ];
  }

  return metadata;
};
