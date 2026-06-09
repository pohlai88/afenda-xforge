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
  url?: string;
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
  images?: string | string[];
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

  try {
    return new URL(url);
  } catch {
    throw new Error(`Invalid SEO site URL: ${url}`);
  }
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

const resolveImage = (
  image: string | undefined,
  site: SiteConfig
): string | undefined => image ?? site.defaultImage;

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
    shortName:
      site?.shortName ??
      site?.name ??
      defaultSiteConfig.shortName ??
      defaultSiteConfig.name,
    publisher: site?.publisher ?? site?.name ?? defaultSiteConfig.publisher,
    author:
      site?.author ??
      ({
        name: site?.name ?? defaultSiteConfig.name,
      } satisfies SiteAuthor),
  };
  const parsedTitle = `${title} | ${resolvedSite.name}`;
  const resolvedImage = resolveImage(image, resolvedSite);
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
      url: resolvedSite.url,
      images: resolvedImage
        ? [
            {
              url: resolvedImage,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
    },
    publisher: resolvedSite.publisher,
    twitter: {
      card: "summary_large_image",
      creator: resolvedSite.twitterHandle,
      images: resolvedImage ? [resolvedImage] : undefined,
    },
    icons: resolvedSite.faviconPath
      ? {
          icon: resolvedSite.faviconPath,
        }
      : undefined,
  };

  return merge({}, defaultMetadata, properties);
};
