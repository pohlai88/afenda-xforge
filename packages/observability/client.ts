/*
 * This file configures the initialization of Sentry on the client.
 * The config you add here will be used whenever a users loads a page in their browser.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import {
  captureRouterTransitionStart,
  consoleLoggingIntegration,
  init,
  replayIntegration,
} from "@sentry/nextjs";
import { loadObservabilityKeys } from "./keys.js";

export const initializeSentry = (): ReturnType<typeof init> =>
  init({
    dsn: loadObservabilityKeys().NEXT_PUBLIC_SENTRY_DSN,
    enableLogs: true,
    tracesSampleRate: 1,
    debug: false,
    replaysOnErrorSampleRate: 1,
    replaysSessionSampleRate: 0.1,
    integrations: [
      replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
      consoleLoggingIntegration({ levels: ["log", "error", "warn"] }),
    ],
  });

export const onRouterTransitionStart = captureRouterTransitionStart;
