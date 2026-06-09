"use client";

import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ReactElement } from "react";

export const ThemeProvider = ({
  children,
  ...properties
}: ThemeProviderProps): ReactElement => (
  <NextThemeProvider
    attribute="class"
    defaultTheme="system"
    disableTransitionOnChange
    enableSystem
    {...properties}
  >
    {children}
  </NextThemeProvider>
);
