import withBundleAnalyzer from "@next/bundle-analyzer";
import { createEnv } from "@t3-oss/env-nextjs";
import type { NextConfig } from "next";
import { z } from "zod";

export type NextConfigKeys = {
  readonly ANALYZE?: "true" | "false";
  readonly NEXT_RUNTIME?: "nodejs" | "edge";
  readonly VERCEL?: string;
  readonly VERCEL_ENV?: "development" | "preview" | "production";
  readonly VERCEL_URL?: string;
  readonly VERCEL_REGION?: string;
  readonly VERCEL_PROJECT_PRODUCTION_URL?: string;
  readonly NEXT_PUBLIC_APP_URL?: string;
  readonly NEXT_PUBLIC_WEB_URL?: string;
  readonly NEXT_PUBLIC_API_URL?: string;
  readonly NEXT_PUBLIC_DOCS_URL?: string;
};

export const keys = (): NextConfigKeys =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      ANALYZE: z.enum(["true", "false"]).optional(),
      NEXT_RUNTIME: z.enum(["nodejs", "edge"]).optional(),
      VERCEL: z.string().optional(),
      VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
      VERCEL_URL: z.string().optional(),
      VERCEL_REGION: z.string().optional(),
      VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
    },
    client: {
      NEXT_PUBLIC_APP_URL: z.url().optional(),
      NEXT_PUBLIC_WEB_URL: z.url().optional(),
      NEXT_PUBLIC_API_URL: z.url().optional(),
      NEXT_PUBLIC_DOCS_URL: z.url().optional(),
    },
    runtimeEnv: {
      ANALYZE: process.env.ANALYZE,
      NEXT_RUNTIME: process.env.NEXT_RUNTIME,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_REGION: process.env.VERCEL_REGION,
      VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_DOCS_URL: process.env.NEXT_PUBLIC_DOCS_URL,
    },
  });

let cachedNextConfigKeys: NextConfigKeys | null = null;

export const loadNextConfigKeys = (): NextConfigKeys =>
  (cachedNextConfigKeys ??= keys());

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
