import "server-only";
import { PostHog } from "posthog-node";
import { loadAnalyticsKeys } from "./keys.ts";
import type { AnalyticsEvent, AnalyticsServerClient } from "./types.ts";

let serverAnalytics: PostHog | undefined;

const getServerAnalytics = (): PostHog | undefined => {
  if (serverAnalytics) {
    return serverAnalytics;
  }

  const {
    NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST,
    POSTHOG_API_KEY,
    POSTHOG_HOST,
  } = loadAnalyticsKeys();

  const apiKey = POSTHOG_API_KEY ?? NEXT_PUBLIC_POSTHOG_KEY;
  const host = POSTHOG_HOST ?? NEXT_PUBLIC_POSTHOG_HOST;

  if (!(apiKey && host)) {
    return;
  }

  serverAnalytics = new PostHog(apiKey, {
    host,
    flushAt: 1,
    flushInterval: 0,
  });

  return serverAnalytics;
};

const toEvent = (event: AnalyticsEvent | string): AnalyticsEvent =>
  typeof event === "string" ? { name: event, properties: undefined } : event;

export const createServerAnalytics = (): AnalyticsServerClient | undefined => {
  const analytics = getServerAnalytics();

  if (!analytics) {
    return;
  }

  return {
    capture: async (
      event: AnalyticsEvent | string,
      properties?: Record<string, unknown>
    ): Promise<void> => {
      const payload = toEvent(event);
      analytics.capture({
        distinctId: "server",
        event: payload.name,
        properties: properties ?? payload.properties,
      });
      await analytics.flush();
    },
    identify: async (
      userId: string,
      traits?: Record<string, unknown>
    ): Promise<void> => {
      analytics.identify({
        distinctId: userId,
        properties: traits,
      });
      await analytics.flush();
    },
    group: async (
      groupType: string,
      groupKey: string,
      properties?: Record<string, unknown>
    ): Promise<void> => {
      analytics.groupIdentify({
        groupType,
        groupKey,
        properties,
      });
      await analytics.flush();
    },
    isFeatureEnabled: async (
      key: string,
      distinctId: string,
      options?: {
        groups?: Record<string, string>;
        personProperties?: Record<string, string>;
        sendFeatureFlagEvents?: boolean;
        disableGeoip?: boolean;
      }
    ): Promise<boolean | undefined> =>
      analytics.isFeatureEnabled(key, distinctId, options),
    flush: async (): Promise<void> => {
      await analytics.flush();
    },
  };
};

export const analytics = createServerAnalytics();
