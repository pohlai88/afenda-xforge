import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import { loadNextConfigKeys } from "./keys.js";

export type NextConfigImageSource = {
  url: string;
  path?: string;
};

export type XForgeNextConfigOptions = {
  transpilePackages?: string[];
  allowImageSources?: readonly NextConfigImageSource[];
  skipTrailingSlashRedirect?: boolean;
  reactStrictMode?: boolean;
};

type RemotePattern = {
  hostname: string;
  pathname: string;
  port: string;
  protocol: "http" | "https";
};

const toRemotePattern = (source: NextConfigImageSource): RemotePattern => {
  const url = new URL(source.url);
  const protocol = url.protocol.replace(":", "");

  if (protocol !== "http" && protocol !== "https") {
    throw new Error(`Unsupported image protocol: ${url.protocol}`);
  }

  return {
    protocol: protocol as "http" | "https",
    hostname: url.hostname,
    port: url.port,
    pathname: source.path ?? "/**",
  };
};

export const createNextConfig = (
  options: XForgeNextConfigOptions = {}
): NextConfig => {
  const env = loadNextConfigKeys();
  const appUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const webUrl = env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3001";
  const remoteSources = options.allowImageSources ?? [
    { url: appUrl },
    { url: webUrl },
    ...(env.NEXT_PUBLIC_API_URL ? [{ url: env.NEXT_PUBLIC_API_URL }] : []),
    ...(env.NEXT_PUBLIC_DOCS_URL ? [{ url: env.NEXT_PUBLIC_DOCS_URL }] : []),
  ];

  return {
    reactStrictMode: options.reactStrictMode ?? true,
    skipTrailingSlashRedirect: options.skipTrailingSlashRedirect ?? false,
    images: {
      formats: ["image/avif", "image/webp"],
      remotePatterns: remoteSources.map(toRemotePattern),
    },
    transpilePackages: [
      "@repo/auth",
      "@repo/analytics",
      "@repo/ai",
      "@repo/design-system",
      "@repo/email",
      "@repo/errors",
      "@repo/health",
      "@repo/redis",
      "@repo/storage",
      "@repo/observability",
      "@repo/seo",
      "@repo/security",
      "@repo/rate-limit",
      ...(options.transpilePackages ?? []),
    ],
  };
};

export const withAnalyzer = (
  sourceConfig: NextConfig,
  enabled?: boolean
): NextConfig => {
  const env = loadNextConfigKeys();

  if (!(enabled ?? env.ANALYZE === "true")) {
    return sourceConfig;
  }

  return withBundleAnalyzer({
    enabled: true,
  })(sourceConfig);
};
