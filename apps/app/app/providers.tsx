"use client";

import { AnalyticsProvider } from "@repo/analytics/provider";
import { AuthProvider } from "@repo/auth/provider";
import { DesignSystemProvider } from "@repo/ui";
import type { ReactElement, ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
};

export const Providers = ({ children }: ProvidersProps): ReactElement => (
  <AnalyticsProvider>
    <AuthProvider>
      <DesignSystemProvider>{children}</DesignSystemProvider>
    </AuthProvider>
  </AnalyticsProvider>
);
