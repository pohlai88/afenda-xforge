export type RobotsRule = {
  userAgent?: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
  crawlDelay?: number;
};

export type RobotsGroupRule = {
  userAgent: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
  crawlDelay?: number;
};

export type Robots = {
  rules: RobotsRule | RobotsGroupRule[];
  sitemap?: string | string[];
  host?: string;
};

export type CreateRobotsInput = {
  rules: RobotsRule | RobotsGroupRule[];
  sitemapPath?: string | string[];
  baseUrl?: string;
  host?: string;
};

const resolveAbsoluteUrl = (baseUrl: string, path: string): string =>
  new URL(path, baseUrl).toString();

const resolveSitemap = (
  baseUrl: string | undefined,
  sitemapPath: string | string[] | undefined
): string | string[] | undefined => {
  if (!(baseUrl && sitemapPath)) {
    return sitemapPath;
  }

  if (Array.isArray(sitemapPath)) {
    return sitemapPath.map((path) => resolveAbsoluteUrl(baseUrl, path));
  }

  return resolveAbsoluteUrl(baseUrl, sitemapPath);
};

export const createRobots = ({
  rules,
  sitemapPath,
  baseUrl,
  host,
}: CreateRobotsInput): Robots => ({
  rules,
  ...(resolveSitemap(baseUrl, sitemapPath)
    ? { sitemap: resolveSitemap(baseUrl, sitemapPath) }
    : {}),
  ...(host ? { host } : {}),
});
