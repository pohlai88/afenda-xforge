"use client";

import type { AfendaTenantBrandingSettings as TenantBrandingSettings } from "@repo/design-system/contracts/afenda/customization";
import type { AfendaErpVisualLaneId as ErpVisualLaneId } from "@repo/design-system/contracts/afenda/registries";
import { validateTenantBrandingColors } from "@repo/design-system/customise-branding/resolution";
import type { TenantAdminSettingsSnapshot } from "@repo/features-system-admin-control-plane/contract";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/ui/components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTenantBranding } from "../../../../_components/tenant-branding-context.tsx";
import {
  BrandingColorOverrides,
  countLaneColorOverrides,
} from "./_components/branding-color-overrides.tsx";
import { BrandingDensitySelector } from "./_components/branding-density-selector.tsx";
import {
  BrandingFeatureColorOverrides,
  countFeatureColorOverrides,
} from "./_components/branding-feature-color-overrides.tsx";
import { BrandingLaneMatrix } from "./_components/branding-lane-matrix.tsx";
import { BrandingPresetGallery } from "./_components/branding-preset-gallery.tsx";
import {
  countLaneOverrides,
  isBrandingDirty,
  resolveCatalogDefaultLane,
} from "./_components/branding-settings.utils.ts";

type BrandingSettingsViewProps = {
  canWrite: boolean;
  initialSettings: TenantAdminSettingsSnapshot;
};

type SaveStatus = "idle" | "pending" | "success" | "error";

export function BrandingSettingsView({
  canWrite,
  initialSettings,
}: BrandingSettingsViewProps): ReactElement {
  const router = useRouter();
  const { setTenantBranding } = useTenantBranding();
  const [branding, setBranding] = useState<TenantBrandingSettings>(
    initialSettings.branding
  );
  const [savedBaseline, setSavedBaseline] = useState<TenantBrandingSettings>(
    initialSettings.branding
  );
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setBranding(initialSettings.branding);
    setSavedBaseline(initialSettings.branding);
  }, [initialSettings.branding]);

  const dirty = isBrandingDirty(branding, savedBaseline);
  const overrideCount = countLaneOverrides(branding);
  const colorOverrideCount =
    countLaneColorOverrides(branding) + countFeatureColorOverrides(branding);

  const updateModuleLane = (featureId: string, laneId: ErpVisualLaneId) => {
    setStatus("idle");
    setMessage(null);
    setBranding((current) => {
      const defaultLane = resolveCatalogDefaultLane(featureId);
      const nextOverrides = { ...(current.moduleLaneOverrides ?? {}) };

      if (laneId === defaultLane) {
        const { [featureId]: _removed, ...remaining } = nextOverrides;
        return {
          ...current,
          moduleLaneOverrides:
            Object.keys(remaining).length > 0 ? remaining : undefined,
        };
      }

      nextOverrides[featureId] = laneId;

      return {
        ...current,
        moduleLaneOverrides: nextOverrides,
      };
    });
  };

  const resetDraft = (): void => {
    setBranding(initialSettings.branding);
    setStatus("idle");
    setMessage(null);
  };

  const saveBranding = async (): Promise<void> => {
    if (!canWrite) {
      return;
    }

    setStatus("pending");
    setMessage(null);

    const colorValidation = validateTenantBrandingColors(branding);
    if (!colorValidation.valid) {
      const firstError = colorValidation.errors[0];
      setStatus("error");
      setMessage(
        firstError
          ? `Color validation failed: ${firstError.family} (${firstError.hue}°) conflicts with ${firstError.conflictingFamily} — ${firstError.distance.toFixed(1)}° separation (minimum ${firstError.minimumRequired}°).`
          : "Color validation failed."
      );
      return;
    }

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
      setSavedBaseline(branding);
      setStatus("success");
      setMessage(
        "Tenant branding saved. Lane colors and layout density apply immediately."
      );
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Tenant branding update failed"
      );
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <header className="rounded-xl border border-lane-active-border bg-card/95 p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="lane">Governance lane</Badge>
              <Badge variant="neutral">Tenant scope</Badge>
              {dirty ? <Badge variant="warning">Unsaved changes</Badge> : null}
              {canWrite ? null : (
                <Badge variant="outline">Read-only access</Badge>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
                System administration
              </p>
              <h1 className="font-semibold text-4xl tracking-tight">
                Dual tenant theme
              </h1>
              <p className="max-w-3xl text-muted-foreground">
                Configure tenant-global brand presets and per-module ERP visual
                lanes. Brand drives primary CTAs; lanes scope module accents
                only — never operational status or destructive flows.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="outline">Preset: {branding.themePreset}</Badge>
              <Badge variant="outline">
                Density: {branding.density ?? "default"}
              </Badge>
              <Badge variant="outline">{overrideCount} lane overrides</Badge>
              <Badge variant="outline">
                {colorOverrideCount} color overrides
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {status === "success" && message ? (
        <Alert variant="success">
          <AlertTitle>Branding saved</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      {status === "error" && message ? (
        <Alert variant="destructive">
          <AlertTitle>Branding update failed</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      {canWrite ? null : (
        <Alert>
          <AlertTitle>View-only mode</AlertTitle>
          <AlertDescription>
            You can review tenant branding settings but saving changes requires
            tenant settings write permission.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="presets">
        <TabsList variant="line">
          <TabsTrigger value="presets">Brand presets</TabsTrigger>
          <TabsTrigger value="lanes">Module lanes</TabsTrigger>
          <TabsTrigger value="colors">Lane colors</TabsTrigger>
          <TabsTrigger value="feature-colors">Module colors</TabsTrigger>
        </TabsList>

        <TabsContent className="mt-6 space-y-6" value="presets">
          <BrandingPresetGallery
            onSelect={(themePreset) => {
              if (!canWrite) {
                return;
              }

              setStatus("idle");
              setMessage(null);
              setBranding((current) => ({ ...current, themePreset }));
            }}
            selectedPreset={branding.themePreset}
          />
          <BrandingDensitySelector
            canWrite={canWrite}
            onSelect={(density) => {
              if (!canWrite) {
                return;
              }

              setStatus("idle");
              setMessage(null);
              setBranding((current) => ({
                ...current,
                density: density === "default" ? undefined : density,
              }));
            }}
            selectedDensity={branding.density ?? "default"}
          />
        </TabsContent>

        <TabsContent className="mt-6 space-y-6" value="lanes">
          <BrandingLaneMatrix
            branding={branding}
            canWrite={canWrite}
            onLaneChange={updateModuleLane}
          />
        </TabsContent>

        <TabsContent className="mt-6 space-y-6" value="colors">
          <BrandingColorOverrides
            branding={branding}
            canWrite={canWrite}
            onChange={(next) => {
              setStatus("idle");
              setMessage(null);
              setBranding(next);
            }}
          />
        </TabsContent>

        <TabsContent className="mt-6 space-y-6" value="feature-colors">
          <BrandingFeatureColorOverrides
            branding={branding}
            canWrite={canWrite}
            onChange={(next) => {
              setStatus("idle");
              setMessage(null);
              setBranding(next);
            }}
          />
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-4 z-layer-sticky flex flex-col gap-3 rounded-xl border border-border bg-background/95 p-4 shadow-lg backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="font-medium text-sm">
            {dirty
              ? "Review and publish branding changes"
              : "Branding is in sync"}
          </p>
          <p className="text-muted-foreground text-xs">
            Changes apply tenant-wide through CSS variables on the next save.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            disabled={!(canWrite && dirty) || status === "pending"}
            onClick={resetDraft}
            type="button"
            variant="outline"
          >
            Reset
          </Button>
          <Button
            disabled={!(canWrite && dirty) || status === "pending"}
            onClick={saveBranding}
            type="button"
          >
            {status === "pending" ? "Saving…" : "Save branding"}
          </Button>
        </div>
      </div>
    </div>
  );
}
