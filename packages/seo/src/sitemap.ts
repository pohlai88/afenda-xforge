export type SitemapChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type SitemapEntry = {
  path: string;
  lastModified?: string | Date;
  changeFrequency?: SitemapChangeFrequency;
  priority?: number;
  alternates?: {
    languages?: Record<string, string>;
  };
};

export type Sitemap = Array<{
  url: string;
  lastModified?: string | Date;
  changeFrequency?: SitemapChangeFrequency;
  priority?: number;
  alternates?: {
    languages?: Record<string, string>;
  };
}>;

export type CreateSitemapInput = {
  baseUrl: string;
  entries: SitemapEntry[];
};

export type CreateLocalizedSitemapInput = CreateSitemapInput & {
  defaultLocale: string;
  locales: readonly string[];
  prefixDefaultLocale?: boolean;
};

const resolveAbsoluteUrl = (baseUrl: string, path: string): string =>
  new URL(path, baseUrl).toString();

const resolveLocalizedPath = (
  baseUrl: string,
  path: string,
  locale: string,
  defaultLocale: string,
  prefixDefaultLocale: boolean
): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (locale === defaultLocale && !prefixDefaultLocale) {
    return resolveAbsoluteUrl(baseUrl, normalizedPath);
  }

  return resolveAbsoluteUrl(baseUrl, `/${locale}${normalizedPath}`);
};

const resolveAlternates = (
  baseUrl: string,
  alternates: SitemapEntry["alternates"]
): SitemapEntry["alternates"] | undefined => {
  if (!alternates?.languages) {
    return alternates;
  }

  return {
    languages: Object.fromEntries(
      Object.entries(alternates.languages).map(([locale, url]) => [
        locale,
        resolveAbsoluteUrl(baseUrl, url),
      ])
    ),
  };
};

export const createSitemap = ({
  baseUrl,
  entries,
}: CreateSitemapInput): Sitemap =>
  entries.map(({ path, ...entry }) => ({
    url: new URL(path, baseUrl).toString(),
    ...entry,
    ...(resolveAlternates(baseUrl, entry.alternates)
      ? { alternates: resolveAlternates(baseUrl, entry.alternates) }
      : {}),
  }));

export const createLocalizedSitemap = ({
  baseUrl,
  defaultLocale,
  locales,
  prefixDefaultLocale = false,
  entries,
}: CreateLocalizedSitemapInput): Sitemap =>
  entries.map(({ path, ...entry }) => {
    const alternates = {
      languages: Object.fromEntries(
        locales.map((locale) => [
          locale,
          resolveLocalizedPath(
            baseUrl,
            path,
            locale,
            defaultLocale,
            prefixDefaultLocale
          ),
        ])
      ),
    };

    return {
      url: resolveLocalizedPath(
        baseUrl,
        path,
        defaultLocale,
        defaultLocale,
        prefixDefaultLocale
      ),
      ...entry,
      alternates,
    };
  });
