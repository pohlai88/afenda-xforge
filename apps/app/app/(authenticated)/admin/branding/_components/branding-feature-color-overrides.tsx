"use client";

import type {
  PartialLaneColorModeScale,
  TenantBrandingSettings,
} from "@repo/design-system";
import { ERP_CATALOG_MODULE_ENTRIES } from "@repo/design-system";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import {
  filterModuleEntries,
  formatFeatureLabel,
  getCatalogResolutionLabel,
  resolveAssignedLane,
  SORTED_MODULE_ENTRIES,
} from "./branding-settings.utils.ts";

type BrandingFeatureColorOverridesProps = {
  branding: TenantBrandingSettings;
  canWrite: boolean;
  onChange: (next: TenantBrandingSettings) => void;
};

function getFeatureOverride(
  branding: TenantBrandingSettings,
  featureId: string
): PartialLaneColorModeScale | undefined {
  return branding.laneColorOverrides?.byFeature?.[featureId];
}

function hasFeatureColorOverride(
  branding: TenantBrandingSettings,
  featureId: string
): boolean {
  const override = getFeatureOverride(branding, featureId);
  return Boolean(override?.light?.solid || override?.dark?.solid);
}

export function countFeatureColorOverrides(
  branding: TenantBrandingSettings
): number {
  return ERP_CATALOG_MODULE_ENTRIES.filter((entry) =>
    hasFeatureColorOverride(branding, entry.featureId)
  ).length;
}

export function BrandingFeatureColorOverrides({
  branding,
  canWrite,
  onChange,
}: BrandingFeatureColorOverridesProps): ReactElement {
  const [query, setQuery] = useState("");
  const filteredEntries = useMemo(
    () => filterModuleEntries(SORTED_MODULE_ENTRIES, query, branding),
    [query, branding]
  );

  const updateFeatureSolid = (
    featureId: string,
    mode: "dark" | "light",
    solid: string | undefined
  ): void => {
    onChange({
      ...branding,
      laneColorOverrides: {
        ...branding.laneColorOverrides,
        byFeature: mergeFeatureSolidOverride(
          branding.laneColorOverrides?.byFeature,
          featureId,
          mode,
          solid
        ),
      },
    });
  };

  return (
    <Card>
      <CardHeader className="gap-4 border-border border-b">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <CardTitle>Module color overrides</CardTitle>
            <CardDescription>
              Override lane solid accents for individual modules. These take
              precedence over lane-wide color overrides at runtime.
            </CardDescription>
          </div>
          <div className="w-full max-w-sm space-y-2">
            <Label htmlFor="feature-color-search">Filter modules</Label>
            <Input
              id="feature-color-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search feature or lane…"
              value={query}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 pt-6 lg:grid-cols-2">
        {filteredEntries.map(([featureId]) => {
          const assignedLane = resolveAssignedLane(branding, featureId);
          const override = getFeatureOverride(branding, featureId);
          const isCustom = hasFeatureColorOverride(branding, featureId);
          const lightSolid = override?.light?.solid ?? "";
          const darkSolid = override?.dark?.solid ?? "";

          return (
            <div
              className="space-y-4 rounded-xl border border-border bg-card p-5"
              key={featureId}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-1">
                  <p className="font-medium text-sm">
                    {formatFeatureLabel(featureId)}
                  </p>
                  <p className="font-mono text-muted-foreground text-xs">
                    {featureId}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="lane">{assignedLane}</Badge>
                  <Badge variant="outline">
                    {getCatalogResolutionLabel(featureId)}
                  </Badge>
                  {isCustom ? (
                    <Badge size="sm" variant="info-outline">
                      Custom
                    </Badge>
                  ) : (
                    <Badge size="sm" variant="neutral">
                      Lane default
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`${featureId}-light-solid`}>
                    Light solid
                  </Label>
                  <Input
                    disabled={!canWrite}
                    id={`${featureId}-light-solid`}
                    onChange={(event) =>
                      updateFeatureSolid(
                        featureId,
                        "light",
                        normalizeSolidInput(event.target.value)
                      )
                    }
                    placeholder="oklch(0.62 0.11 265)"
                    spellCheck={false}
                    value={lightSolid}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${featureId}-dark-solid`}>Dark solid</Label>
                  <Input
                    disabled={!canWrite}
                    id={`${featureId}-dark-solid`}
                    onChange={(event) =>
                      updateFeatureSolid(
                        featureId,
                        "dark",
                        normalizeSolidInput(event.target.value)
                      )
                    }
                    placeholder="oklch(0.72 0.12 265)"
                    spellCheck={false}
                    value={darkSolid}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-muted-foreground text-xs">
                  Use OKLCH values from the Afenda XForge lane scale.
                </p>
                <Button
                  disabled={!(canWrite && isCustom)}
                  onClick={() =>
                    clearFeatureOverride(branding, featureId, onChange)
                  }
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Reset module
                </Button>
              </div>
            </div>
          );
        })}
        {filteredEntries.length === 0 ? (
          <p className="col-span-full py-8 text-center text-muted-foreground text-sm">
            No modules match your filter.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function normalizeSolidInput(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function mergeFeatureSolidOverride(
  byFeature: Record<string, PartialLaneColorModeScale> | undefined,
  featureId: string,
  mode: "dark" | "light",
  solid: string | undefined
): Record<string, PartialLaneColorModeScale> | undefined {
  const nextByFeature = { ...(byFeature ?? {}) };
  const current = { ...(nextByFeature[featureId] ?? {}) };
  const modeScale = { ...(current[mode] ?? {}) };

  if (solid) {
    modeScale.solid = solid;
    current[mode] = modeScale;
    nextByFeature[featureId] = current;
    return nextByFeature;
  }

  const { solid: _removedSolid, ...remainingModeScale } = modeScale;
  if (Object.keys(remainingModeScale).length === 0) {
    const { [mode]: _removedMode, ...remainingCurrent } = current;
    if (Object.keys(remainingCurrent).length === 0) {
      const { [featureId]: _removedFeature, ...remainingByFeature } =
        nextByFeature;
      return Object.keys(remainingByFeature).length > 0
        ? remainingByFeature
        : undefined;
    }

    nextByFeature[featureId] = remainingCurrent;
    return nextByFeature;
  }

  current[mode] = remainingModeScale;
  nextByFeature[featureId] = current;
  return nextByFeature;
}

function clearFeatureOverride(
  branding: TenantBrandingSettings,
  featureId: string,
  onChange: (next: TenantBrandingSettings) => void
): void {
  const { [featureId]: _removedFeature, ...nextByFeature } =
    branding.laneColorOverrides?.byFeature ?? {};

  let laneColorOverrides: TenantBrandingSettings["laneColorOverrides"];

  if (Object.keys(nextByFeature).length > 0) {
    laneColorOverrides = {
      ...branding.laneColorOverrides,
      byFeature: nextByFeature,
    };
  } else if (branding.laneColorOverrides?.byLane) {
    laneColorOverrides = {
      byLane: branding.laneColorOverrides.byLane,
    };
  } else {
    laneColorOverrides = undefined;
  }

  onChange({
    ...branding,
    laneColorOverrides,
  });
}
