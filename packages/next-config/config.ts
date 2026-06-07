import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import { loadNextConfigKeys } from "./keys.ts";

export type NextConfigImageSource = {
  url: string;
  path?: string;
};

export type XForgeNextConfigOptions = {
  transpilePackages?: string[];
  serverExternalPackages?: string[];
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
      "@repo/api",
      "@repo/analytics",
      "@repo/ai",
      "@repo/machine",
      "@repo/design-system",
      "@repo/email",
      "@repo/errors",
      "@repo/health",
      "@repo/logger",
      "@repo/openapi",
      "@repo/redis",
      "@repo/storage",
      "@repo/observability",
      "@repo/seo",
      "@repo/security",
      "@repo/rate-limit",
      "@repo/ui",
      ...(options.transpilePackages ?? []),
    ],
    serverExternalPackages: [
      "pino",
      "pino-pretty",
      ...(options.serverExternalPackages ?? []),
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
