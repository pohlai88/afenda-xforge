/*
 * This file configures the initialization of Sentry on the server.
 * The config you add here will be used whenever the server handles a request.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import "server-only";

import { consoleLoggingIntegration, init } from "@sentry/nextjs";
import { loadObservabilityKeys } from "./keys.js";

export const initializeSentry = (): ReturnType<typeof init> =>
  init({
    dsn: loadObservabilityKeys().NEXT_PUBLIC_SENTRY_DSN,
    enableLogs: true,
    tracesSampleRate: 1,
    debug: false,
    includeLocalVariables: true,
    integrations: [
      consoleLoggingIntegration({ levels: ["log", "error", "warn"] }),
    ],
  });
