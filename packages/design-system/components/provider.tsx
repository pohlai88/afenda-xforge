"use client";

import type { ReactElement, ReactNode } from "react";

import { ThemeProvider } from "../providers/theme.js";
import { Toaster } from "./sonner.js";

type DesignSystemProviderProps = {
  children: ReactNode;
};

export const DesignSystemProvider = ({
  children,
}: DesignSystemProviderProps): ReactElement => (
  <ThemeProvider>
    {children}
    <Toaster />
  </ThemeProvider>
);
