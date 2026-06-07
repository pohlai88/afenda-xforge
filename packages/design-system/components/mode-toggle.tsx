"use client";

import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import type { ChangeEvent, ReactElement } from "react";

const themes = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
] as const;

export const ModeToggle = (): ReactElement => {
  const { setTheme } = useTheme();

  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-border bg-background p-1 shadow-sm">
      <SunIcon className="size-4 text-muted-foreground" />
      <select
        aria-label="Toggle theme"
        className="bg-transparent text-sm outline-none"
        defaultValue="system"
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          setTheme(event.target.value)
        }
      >
        {themes.map(({ label, value }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <MoonIcon className="size-4 text-muted-foreground" />
    </div>
  );
};
