"use client";

import type { ThemeProviderProps } from "next-themes";
import type { ReactElement, ReactNode } from "react";

import { ThemeProvider } from "../providers/theme.tsx";
import { Toaster } from "./sonner.tsx";

type DesignSystemProviderProps = ThemeProviderProps & {
  children: ReactNode;
};

export const DesignSystemProvider = ({
  children,
  ...properties
}: DesignSystemProviderProps): ReactElement => (
  <ThemeProvider {...properties}>
    {children}
    <Toaster />
  </ThemeProvider>
);
