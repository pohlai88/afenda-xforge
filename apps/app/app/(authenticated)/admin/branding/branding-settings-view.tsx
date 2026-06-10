"use client";

import type {
  ErpVisualLaneId,
  TenantBrandingSettings,
} from "@repo/design-system";
import {
  ERP_MODULE_LANE_DEFAULTS,
  ERP_VISUAL_LANE_IDS,
  ERP_VISUAL_LANES,
  THEME_PRESETS,
} from "@repo/design-system";
import type { TenantAdminSettingsSnapshot } from "@repo/features-system-admin-control-plane/server";
import { NativeSelect, NativeSelectOption } from "@repo/ui";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Label } from "@repo/ui/components/label";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useState } from "react";
import { useTenantBranding } from "../../../_components/tenant-branding-context.tsx";

type BrandingSettingsViewProps = {
  initialSettings: TenantAdminSettingsSnapshot;
};

const MODULE_ENTRIES = Object.entries(ERP_MODULE_LANE_DEFAULTS);

export function BrandingSettingsView({
  initialSettings,
}: BrandingSettingsViewProps): ReactElement {
  const router = useRouter();
  const { setBranding: setTenantBranding } = useTenantBranding();
  const [branding, setBranding] = useState<TenantBrandingSettings>(
    initialSettings.branding
  );
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  const updateModuleLane = (featureId: string, laneId: ErpVisualLaneId) => {
    setBranding((current) => ({
      ...current,
      moduleLaneOverrides: {
        ...current.moduleLaneOverrides,
        [featureId]: laneId,
      },
    }));
  };

  const saveBranding = async (): Promise<void> => {
    setStatus("pending");
    setMessage(null);

    try {
      const response = await fetch("/api/system-admin/tenant-settings", {
        body: JSON.stringify({
          key: "tenant-branding",
          value: JSON.stringify(branding),
          reason: "Updated tenant branding from admin branding settings page.",
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Tenant branding update failed");
      }

      setTenantBranding(branding);
      setStatus("success");
      setMessage("Branding settings accepted.");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Tenant branding update failed"
      );
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-semibold text-3xl tracking-tight">
            Tenant branding
          </h1>
          <Badge variant="lane">Governance lane</Badge>
        </div>
        <p className="max-w-3xl text-muted-foreground text-sm">
          Theme presets control primary CTAs and focus rings. ERP lanes scope
          module accents only — never status tones or primary buttons.
        </p>
      </header>

      <Card className="border-lane-active-border">
        <CardHeader className="border-lane-active-border border-b bg-lane-active-muted">
          <CardTitle>Theme preset</CardTitle>
          <CardDescription>
            Tenant-global brand palette applied through CSS variables.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          {THEME_PRESETS.map((preset) => {
            const selected = branding.themePreset === preset.name;

            return (
              <button
                className={`rounded-lg border p-4 text-left transition ${
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:bg-muted/50"
                }`}
                key={preset.name}
                onClick={() =>
                  setBranding((current) => ({
                    ...current,
                    themePreset: preset.name,
                  }))
                }
                type="button"
              >
                <p className="font-medium text-sm">{preset.title}</p>
                <p className="text-muted-foreground text-xs">{preset.name}</p>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Module lane matrix</CardTitle>
          <CardDescription>
            Override catalog defaults per feature module.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {MODULE_ENTRIES.map(([featureId, defaultLane]) => {
            const laneId =
              branding.moduleLaneOverrides?.[featureId] ?? defaultLane;
            const lane = ERP_VISUAL_LANES.find((entry) => entry.id === laneId);

            return (
              <div
                className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-[1.4fr_1fr_auto]"
                key={featureId}
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm">{featureId}</p>
                  <p className="text-muted-foreground text-xs">
                    Default: {defaultLane}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`lane-${featureId}`}>Lane</Label>
                  <NativeSelect
                    id={`lane-${featureId}`}
                    onChange={(event) =>
                      updateModuleLane(
                        featureId,
                        event.target.value as ErpVisualLaneId
                      )
                    }
                    value={laneId}
                  >
                    {ERP_VISUAL_LANE_IDS.map((id) => (
                      <NativeSelectOption key={id} value={id}>
                        {id}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                <div className="flex items-center">
                  <Badge variant="lane">{lane?.title ?? laneId}</Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          disabled={status === "pending"}
          onClick={saveBranding}
          type="button"
        >
          {status === "pending" ? "Saving..." : "Save branding"}
        </Button>
        {message ? (
          <p
            className={
              status === "error"
                ? "text-destructive text-sm"
                : "text-muted-foreground text-sm"
            }
          >
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
