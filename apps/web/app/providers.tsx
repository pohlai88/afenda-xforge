"use client";

import { AnalyticsProvider } from "@repo/analytics/provider";
import { DesignSystemProvider } from "@repo/ui";
import type { ReactElement, ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
};

export const Providers = ({ children }: ProvidersProps): ReactElement => (
  <AnalyticsProvider>
    <DesignSystemProvider>{children}</DesignSystemProvider>
  </AnalyticsProvider>
);
