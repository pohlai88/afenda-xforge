"use client";

import { AnalyticsProvider } from "@repo/analytics/provider";
import { AuthProvider } from "@repo/auth/provider";
import { DesignSystemProvider } from "@repo/ui";
import type { ThemeProviderProps } from "next-themes";
import type { ReactElement, ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
  defaultTheme?: ThemeProviderProps["defaultTheme"];
};

export const Providers = ({
  children,
  defaultTheme = "system",
}: ProvidersProps): ReactElement => (
  <AnalyticsProvider>
    <AuthProvider>
      <DesignSystemProvider defaultTheme={defaultTheme}>
        {children}
      </DesignSystemProvider>
    </AuthProvider>
  </AnalyticsProvider>
);
