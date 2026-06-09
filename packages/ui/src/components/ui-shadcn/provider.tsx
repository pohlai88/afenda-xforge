"use client";

import type { ThemeProviderProps } from "next-themes";
import type { ReactElement, ReactNode } from "react";
import { Toaster } from "./sonner";
import { ThemeProvider } from "./theme-provider";

type DesignSystemProviderProps = ThemeProviderProps & {
  children: ReactNode;
};

export const DesignSystemProvider = ({
  children,
  ...properties
}: DesignSystemProviderProps): ReactElement => (
  <ThemeProvider {...properties}>
    {children}
    <Toaster richColors />
  </ThemeProvider>
);
