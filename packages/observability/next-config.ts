import { withLogtail } from "@logtail/next";
import { withSentryConfig } from "@sentry/nextjs";
import { loadObservabilityKeys } from "./keys.js";

export const sentryConfig: Parameters<typeof withSentryConfig>[1] = {
  org: loadObservabilityKeys().SENTRY_ORG,
  project: loadObservabilityKeys().SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
    automaticVercelMonitors: true,
  },
};

export const withSentry = (sourceConfig: object): object => {
  const configWithTranspile = {
    ...sourceConfig,
    transpilePackages: ["@sentry/nextjs"],
  };

  return withSentryConfig(configWithTranspile, sentryConfig);
};

export const withLogging = (config: object): object => withLogtail(config);
