"use client";

import { useTheme } from "next-themes";
import type { ReactElement } from "react";
import { Toaster as SonnerToaster } from "sonner";

export { toast } from "sonner";

export function Toaster(): ReactElement {
  const { theme = "system" } = useTheme();

  return (
    <SonnerToaster
      className="toaster group"
      theme={theme as "light" | "dark" | "system"}
      toastOptions={{
        className: "border-border bg-popover text-popover-foreground",
      }}
    />
  );
}
