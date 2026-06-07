import { posthog } from "posthog-js";
import { loadAnalyticsKeys } from "./keys.js";
import type { AnalyticsClient, AnalyticsEvent } from "./types.js";

let initialized = false;

export const initializeAnalytics = (): boolean => {
  if (initialized) {
    return true;
  }

  const { NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST } =
    loadAnalyticsKeys();

  if (!(NEXT_PUBLIC_POSTHOG_KEY && NEXT_PUBLIC_POSTHOG_HOST)) {
    return false;
  }

  posthog.init(NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: NEXT_PUBLIC_POSTHOG_HOST,
    defaults: "2025-05-24",
  });
  initialized = true;

  return true;
};

const toEvent = (event: AnalyticsEvent | string): AnalyticsEvent =>
  typeof event === "string" ? { name: event, properties: undefined } : event;

export const createAnalyticsClient = (): AnalyticsClient => ({
  capture: (
    event: AnalyticsEvent | string,
    properties?: Record<string, unknown>
  ): void => {
    const payload = toEvent(event);
    posthog.capture(payload.name, properties ?? payload.properties);
  },
  identify: (userId: string, traits?: Record<string, unknown>): void => {
    posthog.identify(userId, traits);
  },
  group: (
    groupType: string,
    groupKey: string,
    properties?: Record<string, unknown>
  ): void => {
    posthog.group(groupType, groupKey, properties);
  },
  reset: (): void => {
    posthog.reset();
  },
});

export const analytics = createAnalyticsClient();
