"use client";

import type {
  AfendaThemePresetDefinition as ThemePreset,
  AfendaThemePresetName as ThemePresetName,
} from "@repo/design-system/contracts/afenda/registries";
import { AFENDA_THEME_PRESET_REGISTRY as THEME_PRESETS } from "@repo/design-system/contracts/afenda/registries";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import type { ReactElement } from "react";

type BrandingPresetGalleryProps = {
  onSelect: (presetName: ThemePresetName) => void;
  selectedPreset: ThemePresetName;
};

function PresetSwatches({ preset }: { preset: ThemePreset }): ReactElement {
  const scale = preset.brand.light;

  return (
    <div aria-hidden className="mt-4 flex items-center gap-2">
      {(
        [
          ["Primary", scale.primary],
          ["Secondary", scale.secondary],
          ["Accent", scale.accent],
        ] as const
      ).map(([label, color]) => (
        <span
          className="size-8 rounded-full border border-border shadow-sm ring-1 ring-border/40"
          key={label}
          style={{ backgroundColor: color }}
          title={label}
        />
      ))}
    </div>
  );
}

export function BrandingPresetGallery({
  onSelect,
  selectedPreset,
}: BrandingPresetGalleryProps): ReactElement {
  return (
    <Card className="overflow-hidden border-lane-active-border">
      <CardHeader className="border-lane-active-border border-b bg-lane-active-muted/60">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Tenant brand preset</CardTitle>
            <CardDescription>
              Global palette for primary actions, focus rings, and shell chrome.
              Lane accents remain independent.
            </CardDescription>
          </div>
          <Badge variant="outline">Brand layer</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-3">
        {THEME_PRESETS.map((preset) => {
          const selected = selectedPreset === preset.name;

          return (
            <button
              aria-pressed={selected}
              className={cn(
                "group rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                selected
                  ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                  : "border-border bg-card hover:border-lane-active-border hover:bg-muted/40"
              )}
              key={preset.name}
              onClick={() => onSelect(preset.name)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{preset.title}</p>
                  <p className="font-mono text-muted-foreground text-xs">
                    {preset.name}
                  </p>
                </div>
                {selected ? <Badge size="sm">Active</Badge> : null}
              </div>
              <p className="mt-3 text-muted-foreground text-xs leading-relaxed">
                {preset.description}
              </p>
              <PresetSwatches preset={preset} />
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
