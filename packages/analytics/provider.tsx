import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import type { ReactNode } from "react";
import { loadAnalyticsKeys } from "./keys.ts";
import type { AnalyticsProviderOptions } from "./types.ts";

export type AnalyticsProviderProps = AnalyticsProviderOptions & {
  children: ReactNode;
};

export const AnalyticsProvider = ({
  children,
  enableVercel = true,
  enableGoogleAnalytics = true,
}: AnalyticsProviderProps): ReactNode => {
  const { NEXT_PUBLIC_GA_MEASUREMENT_ID } = loadAnalyticsKeys();

  return (
    <>
      {children}
      {enableVercel ? <VercelAnalytics /> : null}
      {enableGoogleAnalytics && NEXT_PUBLIC_GA_MEASUREMENT_ID ? (
        <GoogleAnalytics gaId={NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      ) : null}
    </>
  );
};
