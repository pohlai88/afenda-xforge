"use client";

import type { AfendaDensityRegistryMode as DensityMode } from "@repo/design-system/contracts/afenda/registries";
import { AFENDA_DENSITY_MODES } from "@repo/design-system/contracts/afenda/registries";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import type { ReactElement } from "react";

const DENSITY_OPTIONS = [
  {
    id: "compact" as const,
    label: "Compact",
    description: "Admin-heavy workflows with tighter controls and rows.",
  },
  {
    id: "default" as const,
    label: "Default",
    description: "Balanced ERP density for everyday tenant usage.",
  },
  {
    id: "comfortable" as const,
    label: "Comfortable",
    description: "Review and approval surfaces with extra breathing room.",
  },
] satisfies readonly {
  id: DensityMode;
  label: string;
  description: string;
}[];

type BrandingDensitySelectorProps = {
  canWrite: boolean;
  onSelect: (density: DensityMode) => void;
  selectedDensity: DensityMode | undefined;
};

export function BrandingDensitySelector({
  canWrite,
  onSelect,
  selectedDensity = "default",
}: BrandingDensitySelectorProps): ReactElement {
  return (
    <Card className="overflow-hidden border-lane-active-border">
      <CardHeader className="border-lane-active-border border-b bg-lane-active-muted/60">
        <CardTitle>Tenant layout density</CardTitle>
        <CardDescription>
          Applies <code className="text-xs">data-density</code> on the tenant
          shell. Control and table row heights follow Afenda density tokens.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-6">
        {DENSITY_OPTIONS.map(({ id, label, description }) => (
          <div
            className={cn(
              "flex items-center justify-between border border-border bg-surface px-4 py-3",
              selectedDensity === id && "border-lane-active-border bg-lane-active-muted/40"
            )}
            key={id}
          >
            <div>
              <p className="font-medium text-sm">{label}</p>
              <p className="text-muted-foreground text-xs">{description}</p>
            </div>
            <Button
              disabled={!canWrite}
              onClick={() => onSelect(id)}
              size="sm"
              type="button"
              variant={selectedDensity === id ? "secondary" : "outline"}
            >
              {selectedDensity === id ? "Selected" : "Select"}
            </Button>
          </div>
        ))}
        <p className="text-muted-foreground text-xs">
          Modes: {AFENDA_DENSITY_MODES.join(", ")}
        </p>
      </CardContent>
    </Card>
  );
}
