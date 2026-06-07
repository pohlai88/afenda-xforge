"use client";

import { AnalyticsProvider } from "@repo/analytics";
import { DesignSystemProvider } from "@repo/design-system";
import type { ReactElement, ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
};

export const Providers = ({ children }: ProvidersProps): ReactElement => (
  <AnalyticsProvider>
    <DesignSystemProvider>{children}</DesignSystemProvider>
  </AnalyticsProvider>
);
