"use client";

import type {
  AfendaPartialLaneColorModeScale as PartialLaneColorModeScale,
  AfendaTenantBrandingSettings as TenantBrandingSettings,
} from "@repo/design-system/contracts/afenda/customization";
import type { AfendaErpVisualLaneId as ErpVisualLaneId } from "@repo/design-system/contracts/afenda/registries";
import { AFENDA_ERP_VISUAL_LANES as ERP_VISUAL_LANES } from "@repo/design-system/contracts/afenda/registries";
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

type BrandingColorOverridesProps = {
  branding: TenantBrandingSettings;
  canWrite: boolean;
  onChange: (next: TenantBrandingSettings) => void;
};

function getLaneOverride(
  branding: TenantBrandingSettings,
  laneId: ErpVisualLaneId
): PartialLaneColorModeScale | undefined {
  return branding.laneColorOverrides?.byLane?.[laneId];
}

function hasLaneColorOverride(
  branding: TenantBrandingSettings,
  laneId: ErpVisualLaneId
): boolean {
  const override = getLaneOverride(branding, laneId);
  return Boolean(override?.light?.solid || override?.dark?.solid);
}

export function countLaneColorOverrides(
  branding: TenantBrandingSettings
): number {
  return ERP_VISUAL_LANES.filter((lane) =>
    hasLaneColorOverride(branding, lane.id)
  ).length;
}

export function BrandingColorOverrides({
  branding,
  canWrite,
  onChange,
}: BrandingColorOverridesProps): ReactElement {
  const updateLaneSolid = (
    laneId: ErpVisualLaneId,
    mode: "dark" | "light",
    solid: string | undefined
  ): void => {
    onChange({
      ...branding,
      laneColorOverrides: {
        ...branding.laneColorOverrides,
        byLane: mergeLaneSolidOverride(
          branding.laneColorOverrides?.byLane,
          laneId,
          mode,
          solid
        ),
      },
    });
  };

  return (
    <Card>
      <CardHeader className="gap-2 border-border border-b">
        <CardTitle>Lane color overrides</CardTitle>
        <CardDescription>
          Override lane solid accents per ERP visual lane. Derived muted,
          border, and glow scales stay on catalog defaults unless extended
          later.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 pt-6 lg:grid-cols-2">
        {ERP_VISUAL_LANES.map((lane) => {
          const override = getLaneOverride(branding, lane.id);
          const lightSolid = override?.light?.solid ?? lane.scales.light.solid;
          const darkSolid = override?.dark?.solid ?? lane.scales.dark.solid;
          const isCustom = hasLaneColorOverride(branding, lane.id);

          return (
            <div
              className="space-y-4 rounded-xl border border-border bg-card p-5"
              key={lane.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{lane.title}</p>
                  <p className="font-mono text-muted-foreground text-xs">
                    {lane.id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="size-8 rounded-full border border-border shadow-sm"
                    style={{ backgroundColor: lightSolid }}
                    title="Light mode solid"
                  />
                  <span
                    aria-hidden
                    className="size-8 rounded-full border border-border shadow-sm"
                    style={{ backgroundColor: darkSolid }}
                    title="Dark mode solid"
                  />
                  {isCustom ? (
                    <Badge size="sm" variant="info-outline">
                      Custom
                    </Badge>
                  ) : (
                    <Badge size="sm" variant="neutral">
                      Catalog
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`${lane.id}-light-solid`}>Light solid</Label>
                  <Input
                    disabled={!canWrite}
                    id={`${lane.id}-light-solid`}
                    onChange={(event) =>
                      updateLaneSolid(
                        lane.id,
                        "light",
                        normalizeSolidInput(event.target.value)
                      )
                    }
                    placeholder={lane.scales.light.solid}
                    spellCheck={false}
                    value={override?.light?.solid ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${lane.id}-dark-solid`}>Dark solid</Label>
                  <Input
                    disabled={!canWrite}
                    id={`${lane.id}-dark-solid`}
                    onChange={(event) =>
                      updateLaneSolid(
                        lane.id,
                        "dark",
                        normalizeSolidInput(event.target.value)
                      )
                    }
                    placeholder={lane.scales.dark.solid}
                    spellCheck={false}
                    value={override?.dark?.solid ?? ""}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-muted-foreground text-xs">
                  Use OKLCH values such as{" "}
                  <span className="font-mono">{lane.scales.light.solid}</span>
                </p>
                <Button
                  disabled={!(canWrite && isCustom)}
                  onClick={() => clearLaneOverride(branding, lane.id, onChange)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Reset lane
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function normalizeSolidInput(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function mergeLaneSolidOverride(
  byLane: Record<string, PartialLaneColorModeScale> | undefined,
  laneId: ErpVisualLaneId,
  mode: "dark" | "light",
  solid: string | undefined
): Record<string, PartialLaneColorModeScale> | undefined {
  const nextByLane = { ...(byLane ?? {}) };
  const current = { ...(nextByLane[laneId] ?? {}) };
  const modeScale = { ...(current[mode] ?? {}) };

  if (solid) {
    modeScale.solid = solid;
    current[mode] = modeScale;
    nextByLane[laneId] = current;
    return nextByLane;
  }

  const { solid: _removedSolid, ...remainingModeScale } = modeScale;
  if (Object.keys(remainingModeScale).length === 0) {
    const { [mode]: _removedMode, ...remainingCurrent } = current;
    if (Object.keys(remainingCurrent).length === 0) {
      const { [laneId]: _removedLane, ...remainingByLane } = nextByLane;
      return Object.keys(remainingByLane).length > 0
        ? remainingByLane
        : undefined;
    }

    nextByLane[laneId] = remainingCurrent;
    return nextByLane;
  }

  current[mode] = remainingModeScale;
  nextByLane[laneId] = current;
  return nextByLane;
}

function clearLaneOverride(
  branding: TenantBrandingSettings,
  laneId: ErpVisualLaneId,
  onChange: (next: TenantBrandingSettings) => void
): void {
  const { [laneId]: _removedLane, ...nextByLane } =
    branding.laneColorOverrides?.byLane ?? {};

  let laneColorOverrides: TenantBrandingSettings["laneColorOverrides"];

  if (Object.keys(nextByLane).length > 0) {
    laneColorOverrides = {
      ...branding.laneColorOverrides,
      byLane: nextByLane,
    };
  } else if (branding.laneColorOverrides?.byFeature) {
    laneColorOverrides = {
      byFeature: branding.laneColorOverrides.byFeature,
    };
  } else {
    laneColorOverrides = undefined;
  }

  onChange({
    ...branding,
    laneColorOverrides,
  });
}
