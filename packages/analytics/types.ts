export type AnalyticsProviderName = "vercel" | "google-analytics" | "posthog";

export type AnalyticsEvent = {
  name: string;
  properties?: Record<string, unknown>;
};

export type AnalyticsProviderOptions = {
  enableVercel?: boolean;
  enableGoogleAnalytics?: boolean;
};

export type AnalyticsClient = {
  capture: (
    event: AnalyticsEvent | string,
    properties?: Record<string, unknown>
  ) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
  group: (
    groupType: string,
    groupKey: string,
    properties?: Record<string, unknown>
  ) => void;
  reset: () => void;
};

export type AnalyticsServerClient = {
  capture: (
    event: AnalyticsEvent | string,
    properties?: Record<string, unknown>
  ) => Promise<void>;
  identify: (userId: string, traits?: Record<string, unknown>) => Promise<void>;
  group: (
    groupType: string,
    groupKey: string,
    properties?: Record<string, unknown>
  ) => Promise<void>;
  flush: () => Promise<void>;
};
