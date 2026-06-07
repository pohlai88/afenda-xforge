"use client";

import { DesktopIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";

import { Button } from "./ui/button.tsx";

const themes = [
  {
    label: "Light",
    value: "light",
    icon: SunIcon,
  },
  {
    label: "Dark",
    value: "dark",
    icon: MoonIcon,
  },
  {
    label: "System",
    value: "system",
    icon: DesktopIcon,
  },
] as const;

export const ModeToggle = (): ReactElement => {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedTheme = mounted ? (theme ?? "system") : "system";

  return (
    <fieldset
      aria-label="Theme mode"
      className="inline-flex items-center gap-1 rounded-md border border-border bg-background p-1 shadow-sm"
    >
      {themes.map(({ icon: Icon, label, value }) => {
        const selected = selectedTheme === value;

        return (
          <Button
            aria-label={label}
            aria-pressed={selected}
            key={value}
            onClick={(): void => setTheme(value)}
            size="icon-sm"
            type="button"
            variant={selected ? "secondary" : "ghost"}
          >
            <Icon />
          </Button>
        );
      })}
    </fieldset>
  );
};
