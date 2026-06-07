/*
 * This file configures the initialization of Sentry for edge runtime.
 * The config you add here will be used whenever a page or API route is loaded in an edge runtime.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import { consoleLoggingIntegration, init } from "@sentry/nextjs";
import { loadObservabilityKeys } from "./keys.ts";

export const initializeSentry = (): ReturnType<typeof init> =>
  init({
    dsn: loadObservabilityKeys().NEXT_PUBLIC_SENTRY_DSN,
    enableLogs: true,
    tracesSampleRate: 1,
    debug: false,
    integrations: [
      consoleLoggingIntegration({ levels: ["log", "error", "warn"] }),
    ],
  });
